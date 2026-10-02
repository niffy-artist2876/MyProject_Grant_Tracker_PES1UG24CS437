import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type DB = Database.Database;

const SCHEMA_PATH = path.join(process.cwd(), "src", "db", "schema.sql");

/** Opens a database, applies the schema and seeds the demo users. */
export function openDatabase(file: string): DB {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));
  seedUsers(db);
  return db;
}

// Stand-in users until authentication is built.
function seedUsers(db: DB) {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (n > 0) return;
  const insert = db.prepare("INSERT INTO users (name, role) VALUES (?, ?)");
  insert.run("Dr. Iyer", "FACULTY");
  insert.run("Dr. Menon", "FACULTY");
  insert.run("Dean Rao", "DEAN");
}

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { grantDb?: DB };

export function getDb(): DB {
  globalForDb.grantDb ??= openDatabase(
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "grants.db"),
  );
  return globalForDb.grantDb;
}
