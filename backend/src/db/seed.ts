import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Use in-memory database for seeding to avoid file path issues
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/coffee.db');

import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA foreign_keys = ON`);
db.exec(`
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
`);

// Clear existing data and insert seed data
db.exec(`DELETE FROM purchases; DELETE FROM members;`);

const insertMember = db.prepare(`INSERT INTO members (name, createdAt) VALUES (?, ?)`);
const insertPurchase = db.prepare(`INSERT INTO purchases (memberId, note, createdAt) VALUES (?, ?, ?)`);

const members = [
  { name: 'Alice', createdAt: '2024-01-01T09:00:00.000Z' },
  { name: 'Bob', createdAt: '2024-01-01T09:01:00.000Z' },
  { name: 'Charlie', createdAt: '2024-01-01T09:02:00.000Z' },
  { name: 'Diana', createdAt: '2024-01-01T09:03:00.000Z' },
];

const memberIds: Record<string, number> = {};
for (const m of members) {
  const result = insertMember.run(m.name, m.createdAt);
  memberIds[m.name] = result.lastInsertRowid as number;
}

const purchases = [
  { member: 'Alice', note: 'Morning round', createdAt: '2024-03-01T08:30:00.000Z' },
  { member: 'Bob', note: null, createdAt: '2024-03-05T09:00:00.000Z' },
  { member: 'Charlie', note: 'Brought pastries too!', createdAt: '2024-03-10T08:45:00.000Z' },
  { member: 'Alice', note: null, createdAt: '2024-03-15T10:00:00.000Z' },
  { member: 'Bob', note: 'Special blend', createdAt: '2024-03-20T09:30:00.000Z' },
];

for (const p of purchases) {
  insertPurchase.run(memberIds[p.member], p.note ?? null, p.createdAt);
}

console.log('Seed data inserted successfully.');
console.log(`Members: ${members.map(m => m.name).join(', ')}`);
console.log(`Purchases: ${purchases.length} records`);

db.close();
