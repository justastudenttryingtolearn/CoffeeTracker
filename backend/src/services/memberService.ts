import db from '../db/database';
import { Member } from '../types';

export function getAllMembers(): Member[] {
  return db.prepare(`SELECT id, name, createdAt FROM members ORDER BY name ASC`).all() as unknown as Member[];
}

export function getMemberById(id: number): Member | undefined {
  return db.prepare(`SELECT id, name, createdAt FROM members WHERE id = ?`).get(id) as unknown as Member | undefined;
}

export function createMember(name: string): Member {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Member name cannot be empty.');
  }

  // Check for duplicate ignoring case and surrounding whitespace
  const existing = db
    .prepare(`SELECT id FROM members WHERE TRIM(LOWER(name)) = TRIM(LOWER(?))`)
    .get(trimmed);
  if (existing) {
    throw new Error(`A member named "${trimmed}" already exists.`);
  }

  const createdAt = new Date().toISOString();
  const result = db.prepare(`INSERT INTO members (name, createdAt) VALUES (?, ?)`).run(trimmed, createdAt);
  return { id: result.lastInsertRowid as number, name: trimmed, createdAt };
}

export function deleteMember(id: number): boolean {
  const result = db.prepare(`DELETE FROM members WHERE id = ?`).run(id);
  return result.changes > 0;
}
