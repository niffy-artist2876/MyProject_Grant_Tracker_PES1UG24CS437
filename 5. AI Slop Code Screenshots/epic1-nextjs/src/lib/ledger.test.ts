import { beforeEach, describe, expect, it } from "vitest";
import { openDatabase, type DB } from "./db";
import {
  LedgerError,
  createGrant,
  decideOverdraft,
  getGrant,
  listExpenses,
  listPendingOverdrafts,
  listUsers,
  logExpense,
  type User,
} from "./ledger";

let db: DB;
let iyer: User;
let menon: User;
let dean: User;

const RUPEE = 100;

beforeEach(() => {
  db = openDatabase(":memory:");
  [iyer, menon, dean] = ["Dr. Iyer", "Dr. Menon", "Dean Rao"].map(
    (name) => listUsers(db).find((u) => u.name === name)!,
  );
  createGrant(db, dean, {
    id: "g1",
    title: "Solar Cells",
    piId: iyer.id,
    sanctionedPaise: 100_000 * RUPEE,
  });
});

const balance = () => getGrant(db, "G1")!;

describe("FR-001 grant allocation", () => {
  it("stores the grant with its sanctioned amount and an untouched balance", () => {
    expect(balance()).toMatchObject({
      id: "G1",
      piName: "Dr. Iyer",
      sanctionedPaise: 100_000 * RUPEE,
      spentPaise: 0,
      remainingPaise: 100_000 * RUPEE,
    });
  });

  it("only lets the Dean allocate grants", () => {
    expect(() =>
      createGrant(db, iyer, { id: "G2", title: "X", piId: iyer.id, sanctionedPaise: 100 }),
    ).toThrow("Only the Dean");
  });

  it("refuses duplicate IDs, non-faculty PIs and non-positive budgets", () => {
    expect(() =>
      createGrant(db, dean, { id: "G1", title: "X", piId: iyer.id, sanctionedPaise: 100 }),
    ).toThrow("already exists");
    expect(() =>
      createGrant(db, dean, { id: "G2", title: "X", piId: dean.id, sanctionedPaise: 100 }),
    ).toThrow("faculty member");
    expect(() =>
      createGrant(db, dean, { id: "G2", title: "X", piId: iyer.id, sanctionedPaise: 0 }),
    ).toThrow("greater than zero");
  });
});

describe("Story 1.1 / 1.2: logging expenses updates the balance", () => {
  it("approves an expense within budget and deducts it immediately", () => {
    const result = logExpense(db, iyer, {
      grantId: "G1",
      description: "Oscilloscope",
      amountPaise: 2_500_050,
    });
    expect(result).toMatchObject({ status: "APPROVED", remainingPaise: 7_499_950 });
    expect(balance()).toMatchObject({ spentPaise: 2_500_050, remainingPaise: 7_499_950 });
  });

  it("allows spending exactly the remaining balance", () => {
    logExpense(db, iyer, { grantId: "G1", description: "All of it", amountPaise: 100_000 * RUPEE });
    expect(balance().remainingPaise).toBe(0);
  });

  it("only lets faculty log expenses", () => {
    expect(() =>
      logExpense(db, dean, { grantId: "G1", description: "X", amountPaise: 100 }),
    ).toThrow("Only faculty");
  });

  it("refuses unknown grants and blank descriptions", () => {
    expect(() =>
      logExpense(db, iyer, { grantId: "NOPE", description: "X", amountPaise: 100 }),
    ).toThrow("No grant");
    expect(() =>
      logExpense(db, iyer, { grantId: "G1", description: "   ", amountPaise: 100 }),
    ).toThrow("Description");
  });

  // BTB9-1: negative expense amount accepted.
  it("refuses zero and negative amounts, in code and in the database", () => {
    for (const amountPaise of [0, -50_000]) {
      expect(() =>
        logExpense(db, iyer, { grantId: "G1", description: "Refund", amountPaise }),
      ).toThrow(LedgerError);
    }
    expect(() =>
      db
        .prepare(
          "INSERT INTO expenses (grant_id, logged_by, description, amount_paise, status) VALUES ('G1', ?, 'x', -1, 'APPROVED')",
        )
        .run(iyer.id),
    ).toThrow(/CHECK constraint/);
    expect(balance().remainingPaise).toBe(100_000 * RUPEE);
  });
});

describe("Story 1.3: overdrafts are blocked", () => {
  it("holds an overdraft as pending without deducting it", () => {
    logExpense(db, iyer, { grantId: "G1", description: "Oscilloscope", amountPaise: 2_500_050 });
    const result = logExpense(db, iyer, {
      grantId: "G1",
      description: "Spectrometer",
      amountPaise: 80_000 * RUPEE,
    });

    expect(result).toMatchObject({ status: "PENDING", shortfallPaise: 500_050 });
    expect(balance()).toMatchObject({
      remainingPaise: 7_499_950,
      pendingPaise: 80_000 * RUPEE,
      pendingCount: 1,
    });
  });
});

describe("Story 1.4: Dean override", () => {
  let pendingId: number;

  beforeEach(() => {
    logExpense(db, iyer, { grantId: "G1", description: "Oscilloscope", amountPaise: 25_000 * RUPEE });
    pendingId = logExpense(db, iyer, {
      grantId: "G1",
      description: "Spectrometer",
      amountPaise: 80_000 * RUPEE,
    }).expenseId;
  });

  // BTB9-2: balance doesn't update after expense approval.
  it("deducts an approved override from the balance", () => {
    decideOverdraft(db, dean, pendingId, "APPROVE");
    expect(balance()).toMatchObject({
      spentPaise: 105_000 * RUPEE,
      remainingPaise: -5_000 * RUPEE,
      pendingCount: 0,
    });
    expect(listExpenses(db, "G1")[0]).toMatchObject({
      status: "APPROVED",
      isOverdraft: true,
      decidedByName: "Dean Rao",
    });
  });

  it("leaves the balance alone when the Dean rejects", () => {
    decideOverdraft(db, dean, pendingId, "REJECT");
    expect(balance()).toMatchObject({ remainingPaise: 75_000 * RUPEE, pendingCount: 0 });
    expect(listPendingOverdrafts(db)).toHaveLength(0);
  });

  it("only lets the Dean decide", () => {
    expect(() => decideOverdraft(db, iyer, pendingId, "APPROVE")).toThrow("Only the Dean");
    expect(balance().pendingCount).toBe(1);
  });

  it("applies a decision once, so a double approval cannot deduct twice", () => {
    decideOverdraft(db, dean, pendingId, "APPROVE");
    expect(() => decideOverdraft(db, dean, pendingId, "APPROVE")).toThrow("not awaiting");
    expect(() => decideOverdraft(db, dean, pendingId, "REJECT")).toThrow("not awaiting");
    expect(balance().spentPaise).toBe(105_000 * RUPEE);
  });

  it("cannot be used to approve an expense that was never blocked", () => {
    const normal = listExpenses(db, "G1").find((e) => e.description === "Oscilloscope")!;
    expect(() => decideOverdraft(db, dean, normal.id, "REJECT")).toThrow("not awaiting");
  });

  it("holds further spending once the grant is overdrawn", () => {
    decideOverdraft(db, dean, pendingId, "APPROVE");
    const result = logExpense(db, menon, { grantId: "G1", description: "Cable", amountPaise: 1_000 });
    expect(result).toMatchObject({ status: "PENDING", shortfallPaise: 5_000 * RUPEE + 1_000 });
  });
});
