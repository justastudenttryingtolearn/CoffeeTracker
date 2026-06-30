import db from '../db/database';
import { Purchase } from '../types';

export function getAllPurchases(): Purchase[] {
  return db
    .prepare(
      `SELECT p.id, p.memberId, m.name AS memberName, p.note, p.createdAt
       FROM purchases p
       JOIN members m ON p.memberId = m.id
       ORDER BY p.createdAt DESC`
    )
    .all() as unknown as Purchase[];
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
