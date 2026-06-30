import { computeStatus } from '../src/services/statusService';
import { Member, Purchase } from '../src/types';

const makeDate = (offsetDays: number): string => {
  const d = new Date('2024-01-01T00:00:00.000Z');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

const alice: Member = { id: 1, name: 'Alice', createdAt: makeDate(0) };
const bob: Member = { id: 2, name: 'Bob', createdAt: makeDate(1) };
const charlie: Member = { id: 3, name: 'Charlie', createdAt: makeDate(2) };

const purchase = (id: number, memberId: number, daysOffset: number): Purchase => ({
  id,
  memberId,
  note: null,
  createdAt: makeDate(daysOffset),
});

describe('computeStatus', () => {
  test('returns nulls when there are no members', () => {
    const result = computeStatus([], []);
    expect(result.lastBuyer).toBeNull();
    expect(result.nextBuyer).toBeNull();
  });

  test('suggests first member alphabetically when there are members but no purchases', () => {
    const result = computeStatus([charlie, alice, bob], []);
    expect(result.lastBuyer).toBeNull();
    expect(result.nextBuyer?.name).toBe('Alice');
  });

  test('identifies the last buyer from the most recent purchase', () => {
    const purchases = [
      purchase(1, alice.id, 10),
      purchase(2, bob.id, 20), // most recent
    ];
    const result = computeStatus([alice, bob], purchases);
    expect(result.lastBuyer?.name).toBe('Bob');
  });

  test('prioritises member who has never bought over someone who has', () => {
    const purchases = [purchase(1, alice.id, 5)];
    const result = computeStatus([alice, bob], purchases); // bob never bought
    expect(result.nextBuyer?.name).toBe('Bob');
  });

  test('among members who never bought, suggests first alphabetically', () => {
    const purchases = [purchase(1, charlie.id, 5)];
    // alice and bob have never bought
    const result = computeStatus([alice, bob, charlie], purchases);
    expect(result.nextBuyer?.name).toBe('Alice');
  });

  test('chooses member with the oldest last purchase when all have bought', () => {
    const purchases = [
      purchase(1, alice.id, 30), // alice bought most recently
      purchase(2, bob.id, 10),   // bob bought oldest
      purchase(3, charlie.id, 20),
    ];
    const result = computeStatus([alice, bob, charlie], purchases);
    expect(result.nextBuyer?.name).toBe('Bob');
  });

  test('handles a single member correctly', () => {
    const result = computeStatus([alice], []);
    expect(result.lastBuyer).toBeNull();
    expect(result.nextBuyer?.name).toBe('Alice');
  });

  test('handles a single member with purchases', () => {
    const purchases = [purchase(1, alice.id, 5)];
    const result = computeStatus([alice], purchases);
    expect(result.lastBuyer?.name).toBe('Alice');
    expect(result.nextBuyer?.name).toBe('Alice');
  });
});
