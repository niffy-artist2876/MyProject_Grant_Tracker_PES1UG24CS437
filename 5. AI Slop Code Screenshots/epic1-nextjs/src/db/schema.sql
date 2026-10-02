-- Epic 1: Track Grant Funds (FR-001)
-- Written for SQLite; kept to standard SQL so it ports to PostgreSQL.
-- Money is stored as integer paise to avoid floating-point rounding.

CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY,
  name  TEXT    NOT NULL,
  role  TEXT    NOT NULL CHECK (role IN ('FACULTY', 'DEAN'))
);

CREATE TABLE IF NOT EXISTS grants (
  id                TEXT    PRIMARY KEY,
  title             TEXT    NOT NULL CHECK (length(trim(title)) > 0),
  pi_id             INTEGER NOT NULL REFERENCES users (id),
  sanctioned_paise  INTEGER NOT NULL CHECK (sanctioned_paise > 0),
  created_by        INTEGER NOT NULL REFERENCES users (id),
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- There is deliberately no "spent" or "balance" column anywhere: both are
-- derived from approved expenses (see grant_balances), so they cannot drift
-- out of sync with the expense log (bug BTB9-2).
CREATE TABLE IF NOT EXISTS expenses (
  id            INTEGER PRIMARY KEY,
  grant_id      TEXT    NOT NULL REFERENCES grants (id),
  logged_by     INTEGER NOT NULL REFERENCES users (id),
  description   TEXT    NOT NULL CHECK (length(trim(description)) > 0),
  -- BTB9-1: the database itself refuses zero and negative amounts.
  amount_paise  INTEGER NOT NULL CHECK (amount_paise > 0),
  status        TEXT    NOT NULL CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
  -- 1 if the expense exceeded the remaining balance when it was logged.
  is_overdraft  INTEGER NOT NULL DEFAULT 0 CHECK (is_overdraft IN (0, 1)),
  decided_by    INTEGER REFERENCES users (id),
  decided_at    TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  -- An overdraft can only leave PENDING through a recorded Dean decision.
  CHECK (status <> 'PENDING' OR decided_by IS NULL),
  CHECK (is_overdraft = 0 OR status = 'PENDING' OR decided_by IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_expenses_grant_status ON expenses (grant_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses (status);

CREATE VIEW IF NOT EXISTS grant_balances AS
SELECT
  g.id AS grant_id,
  g.sanctioned_paise,
  COALESCE(SUM(CASE WHEN e.status = 'APPROVED' THEN e.amount_paise END), 0) AS spent_paise,
  g.sanctioned_paise
    - COALESCE(SUM(CASE WHEN e.status = 'APPROVED' THEN e.amount_paise END), 0) AS remaining_paise,
  COALESCE(SUM(CASE WHEN e.status = 'PENDING' THEN e.amount_paise END), 0) AS pending_paise,
  COUNT(CASE WHEN e.status = 'PENDING' THEN 1 END) AS pending_count
FROM grants g
LEFT JOIN expenses e ON e.grant_id = g.id
GROUP BY g.id, g.sanctioned_paise;
