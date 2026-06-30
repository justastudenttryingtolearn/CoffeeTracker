/**
 * Shared schema SQL – imported by both database.ts (runtime) and seed.ts (dev seeding)
 * so the table definitions are never duplicated.
 */
export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    note TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
  );
`;

