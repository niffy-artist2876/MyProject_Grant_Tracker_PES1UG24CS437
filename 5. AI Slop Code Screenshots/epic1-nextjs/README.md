# Epic 1: Track Grant Funds (Next.js + SQL)

A web implementation of [FR-001](../../1.%20Requirements/FRs_and_NFRs.md#1-fr-001-high-priority-grant-fund-allocation-and-expense-logging): grant allocation, expense logging, balances, overdraft blocking and Dean override. It covers the four stories of Epic 1 in the [WBS](../../4.%20SRS%20and%20Work%20Breakdown%20Steps/WBS.md). Built with Next.js 16 (App Router, Server Actions) and SQLite.

| Story | Jira | Where |
|---|---|---|
| Grant allocation (Dean) | FR-001 | `createGrant` in [ledger.ts](src/lib/ledger.ts), [/](src/app/page.tsx) |
| 1.1 Log an expense, validate against budget | SBPS9-16, KP-17, KP-18 | `logExpense`, [/grants/[id]](src/app/grants/[id]/page.tsx) |
| 1.2 View remaining balance | SBPS9-17 | `grant_balances` view in [schema.sql](src/db/schema.sql) |
| 1.3 Block overdraft | SBPS9-18 | `logExpense` |
| 1.4 Dean override | SBPS9-19 | `decideOverdraft`, [/overdrafts](src/app/overdrafts/page.tsx) |

## Design

- **Rules live in one place.** [ledger.ts](src/lib/ledger.ts) enforces every rule, including the role checks. The pages and server actions only call it, so a rule can't be skipped by calling an action directly.
- **No stored balance.** Spent and remaining amounts are derived from approved expenses by the `grant_balances` view, so they can't drift out of sync. This rules out bug BTB9-2 (balance not updated after approval) by construction.
- **Integer money.** Amounts are stored as paise (`INTEGER`) and never as floats.
- **Defence in depth for BTB9-1.** Negative and zero amounts are refused by the input parser, by the ledger, and by a `CHECK` constraint in the database.
- **Race-safe overdraft check.** The balance check and the insert run in one `IMMEDIATE` transaction, so two simultaneous expenses can't both pass against the same balance. Dean decisions are one-shot (`UPDATE … WHERE status = 'PENDING'`), so a double-click can't deduct twice.
- **Portable SQL.** The schema avoids SQLite-specific features. Moving to PostgreSQL mainly means swapping the driver and using `SELECT … FOR UPDATE` in `logExpense`.

## Not built yet

- **Authentication.** The "Acting as" switcher in the header is a development stand-in that lets anyone pick a seeded user (Dr. Iyer, Dr. Menon, Dean Rao). See [session.ts](src/lib/session.ts). Replace it before any real use.
- **Audit ledger (NFR-001).** Decisions record who made them and when, but there is no tamper-evident log yet.
- The other four epics.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is created at `data/grants.db` on first run. Set `DATABASE_PATH` to use a different file.

## Test

```bash
npm test
```

33 tests run the ledger against an in-memory SQLite database with the real schema. They cover the FR-001 acceptance criteria, both Epic 1 bugs, role checks, double decisions and money parsing.
