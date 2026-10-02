// Business rules for Epic 1: Track Grant Funds (FR-001).
// Every rule is enforced here, not in the UI, so it holds no matter how the
// functions are called.
import type { DB } from "./db";
import { formatPaise } from "./money";

export type Role = "FACULTY" | "DEAN";
export type User = { id: number; name: string; role: Role };
export type ExpenseStatus = "APPROVED" | "PENDING" | "REJECTED";

export type GrantSummary = {
  id: string;
  title: string;
  piId: number;
  piName: string;
  sanctionedPaise: number;
  spentPaise: number;
  remainingPaise: number;
  pendingPaise: number;
  pendingCount: number;
};

export type Expense = {
  id: number;
  grantId: string;
  loggedByName: string;
  description: string;
  amountPaise: number;
  status: ExpenseStatus;
  isOverdraft: boolean;
  decidedByName: string | null;
  decidedAt: string | null;
  createdAt: string;
};

/** A rule violation with a message that is safe to show to the user. */
export class LedgerError extends Error {}

const GRANT_ID = /^[A-Z0-9][A-Z0-9-]{0,19}$/;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function listUsers(db: DB): User[] {
  return db.prepare("SELECT id, name, role FROM users ORDER BY role DESC, name").all() as User[];
}

export function getUser(db: DB, id: number): User | undefined {
  return db.prepare("SELECT id, name, role FROM users WHERE id = ?").get(id) as User | undefined;
}

// ---------------------------------------------------------------------------
// FR-001: grant allocation (Dean only)
// ---------------------------------------------------------------------------

export function createGrant(
  db: DB,
  actor: User,
  input: { id: string; title: string; piId: number; sanctionedPaise: number },
): void {
  if (actor.role !== "DEAN") throw new LedgerError("Only the Dean can allocate grants.");

  const id = input.id.trim().toUpperCase();
  const title = input.title.trim();
  if (!GRANT_ID.test(id)) {
    throw new LedgerError("Grant ID must be 1-20 letters, digits or hyphens.");
  }
  if (!title) throw new LedgerError("Title is required.");
  if (!Number.isSafeInteger(input.sanctionedPaise) || input.sanctionedPaise <= 0) {
    throw new LedgerError("Sanctioned amount must be greater than zero.");
  }
  const pi = getUser(db, input.piId);
  if (!pi || pi.role !== "FACULTY") {
    throw new LedgerError("Principal investigator must be a faculty member.");
  }
  if (db.prepare("SELECT 1 FROM grants WHERE id = ?").get(id)) {
    throw new LedgerError(`A grant with ID ${id} already exists.`);
  }

  db.prepare(
    `INSERT INTO grants (id, title, pi_id, sanctioned_paise, created_by)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, title, pi.id, input.sanctionedPaise, actor.id);
}

// ---------------------------------------------------------------------------
// Story 1.2: balances
// ---------------------------------------------------------------------------

const GRANT_SUMMARY_SQL = `
  SELECT g.id, g.title, g.pi_id AS piId, u.name AS piName,
         b.sanctioned_paise AS sanctionedPaise, b.spent_paise AS spentPaise,
         b.remaining_paise AS remainingPaise, b.pending_paise AS pendingPaise,
         b.pending_count AS pendingCount
  FROM grants g
  JOIN users u ON u.id = g.pi_id
  JOIN grant_balances b ON b.grant_id = g.id`;

export function listGrants(db: DB): GrantSummary[] {
  return db.prepare(`${GRANT_SUMMARY_SQL} ORDER BY g.created_at, g.id`).all() as GrantSummary[];
}

export function getGrant(db: DB, id: string): GrantSummary | undefined {
  return db.prepare(`${GRANT_SUMMARY_SQL} WHERE g.id = ?`).get(id.toUpperCase()) as
    | GrantSummary
    | undefined;
}

// ---------------------------------------------------------------------------
// Story 1.1 + 1.3: log an expense, block overdrafts
// ---------------------------------------------------------------------------

export type LogExpenseResult =
  | { status: "APPROVED"; expenseId: number; remainingPaise: number }
  | { status: "PENDING"; expenseId: number; shortfallPaise: number };

export function logExpense(
  db: DB,
  actor: User,
  input: { grantId: string; description: string; amountPaise: number },
): LogExpenseResult {
  if (actor.role !== "FACULTY") throw new LedgerError("Only faculty can log expenses.");

  const description = input.description.trim();
  if (!description) throw new LedgerError("Description is required.");
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new LedgerError("Amount must be greater than zero.");
  }

  // The balance check and the insert run in one IMMEDIATE transaction, which
  // takes the write lock first. Two concurrent requests therefore cannot both
  // see the same remaining balance and jointly overdraw the grant.
  // On PostgreSQL the equivalent is SELECT ... FOR UPDATE on the grant row.
  return db
    .transaction((): LogExpenseResult => {
      const grant = getGrant(db, input.grantId);
      if (!grant) throw new LedgerError(`No grant with ID ${input.grantId}.`);

      const withinBudget = input.amountPaise <= grant.remainingPaise;
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO expenses (grant_id, logged_by, description, amount_paise, status, is_overdraft)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          grant.id,
          actor.id,
          description,
          input.amountPaise,
          withinBudget ? "APPROVED" : "PENDING",
          withinBudget ? 0 : 1,
        );
      const expenseId = Number(lastInsertRowid);

      return withinBudget
        ? {
            status: "APPROVED",
            expenseId,
            remainingPaise: grant.remainingPaise - input.amountPaise,
          }
        : {
            status: "PENDING",
            expenseId,
            shortfallPaise: input.amountPaise - grant.remainingPaise,
          };
    })
    .immediate();
}

const EXPENSE_SQL = `
  SELECT e.id, e.grant_id AS grantId, l.name AS loggedByName, e.description,
         e.amount_paise AS amountPaise, e.status, e.is_overdraft AS isOverdraft,
         d.name AS decidedByName, e.decided_at AS decidedAt, e.created_at AS createdAt
  FROM expenses e
  JOIN users l ON l.id = e.logged_by
  LEFT JOIN users d ON d.id = e.decided_by`;

function toExpense(row: Expense): Expense {
  return { ...row, isOverdraft: Boolean(row.isOverdraft) };
}

export function listExpenses(db: DB, grantId: string): Expense[] {
  return (
    db
      .prepare(`${EXPENSE_SQL} WHERE e.grant_id = ? ORDER BY e.id DESC`)
      .all(grantId.toUpperCase()) as Expense[]
  ).map(toExpense);
}

// ---------------------------------------------------------------------------
// Story 1.4: Dean override
// ---------------------------------------------------------------------------

export function listPendingOverdrafts(db: DB): Expense[] {
  return (
    db.prepare(`${EXPENSE_SQL} WHERE e.status = 'PENDING' ORDER BY e.id`).all() as Expense[]
  ).map(toExpense);
}

export function decideOverdraft(
  db: DB,
  actor: User,
  expenseId: number,
  decision: "APPROVE" | "REJECT",
): void {
  if (actor.role !== "DEAN") throw new LedgerError("Only the Dean can decide on overdrafts.");

  // The status guard in the WHERE clause makes a decision one-shot: a second
  // click, or a second Dean acting at the same moment, changes nothing.
  const { changes } = db
    .prepare(
      `UPDATE expenses
       SET status = ?, decided_by = ?, decided_at = datetime('now')
       WHERE id = ? AND status = 'PENDING'`,
    )
    .run(decision === "APPROVE" ? "APPROVED" : "REJECTED", actor.id, expenseId);

  if (changes === 0) {
    throw new LedgerError("This expense is not awaiting a decision.");
  }
}

export function describeResult(result: LogExpenseResult): string {
  return result.status === "APPROVED"
    ? `Expense recorded. Remaining balance: ${formatPaise(result.remainingPaise)}.`
    : `Blocked: this exceeds the remaining balance by ${formatPaise(result.shortfallPaise)}. ` +
        "It has been sent to the Dean for an override decision.";
}
