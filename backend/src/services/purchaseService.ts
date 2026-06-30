import db from '../db/database';
import { Purchase, PaginatedResponse } from '../types';

/** Returns all purchases (no pagination) – used internally by the status service. */
export function getAllPurchasesUnpaginated(): Purchase[] {
  return db
    .prepare(
      `SELECT p.id, p.memberId, m.name AS memberName, p.note, p.createdAt
       FROM purchases p
       JOIN members m ON p.memberId = m.id
       ORDER BY p.createdAt DESC`
    )
    .all() as unknown as Purchase[];
}

export function getAllPurchases(limit = 50, offset = 0): PaginatedResponse<Purchase> {
  const total = (db.prepare(`SELECT COUNT(*) as count FROM purchases`).get() as { count: number }).count;
  const data = db
    .prepare(
      `SELECT p.id, p.memberId, m.name AS memberName, p.note, p.createdAt
       FROM purchases p
       JOIN members m ON p.memberId = m.id
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as unknown as Purchase[];
  return { data, total, limit, offset };
}

export function createPurchase(memberId: number, note: string | null): Purchase {
  const memberExists = db.prepare(`SELECT id FROM members WHERE id = ?`).get(memberId);
  if (!memberExists) {
    throw new Error(`Member with id ${memberId} not found.`);
  }

  const createdAt = new Date().toISOString();
  const result = db
    .prepare(`INSERT INTO purchases (memberId, note, createdAt) VALUES (?, ?, ?)`)
    .run(memberId, note ?? null, createdAt);

  const id = result.lastInsertRowid as number;
  const purchase = db
    .prepare(
      `SELECT p.id, p.memberId, m.name AS memberName, p.note, p.createdAt
       FROM purchases p
       JOIN members m ON p.memberId = m.id
       WHERE p.id = ?`
    )
    .get(id) as unknown as Purchase;

  return purchase;
}

export function deletePurchase(id: number): boolean {
  const result = db.prepare(`DELETE FROM purchases WHERE id = ?`).run(id);
  return result.changes > 0;
}
