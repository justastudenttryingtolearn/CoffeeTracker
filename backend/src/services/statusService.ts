import { Member, Purchase, StatusResponse } from '../types';

/**
 * Compute who bought last and who should buy next.
 *
 * Next buyer rules:
 * - If no members, return null.
 * - If members but no purchases, suggest the first member alphabetically.
 * - Otherwise, choose the member whose most recent purchase is the oldest.
 *   Members who have never bought are prioritised over those who have.
 */
export function computeStatus(members: Member[], purchases: Purchase[]): StatusResponse {
  if (members.length === 0) {
    return { lastBuyer: null, nextBuyer: null };
  }

  // Last buyer: member associated with the most recent purchase
  let lastBuyer: Member | null = null;
  if (purchases.length > 0) {
    const latestPurchase = purchases.reduce((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );
    lastBuyer = members.find(m => m.id === latestPurchase.memberId) ?? null;
  }

  // Next buyer
  let nextBuyer: Member | null = null;

  if (purchases.length === 0) {
    // No purchases yet — suggest first member alphabetically
    nextBuyer = [...members].sort((a, b) => a.name.localeCompare(b.name))[0];
  } else {
    // Build a map: memberId -> most recent purchase date
    const lastPurchaseByMember = new Map<number, Date>();
    for (const p of purchases) {
      const date = new Date(p.createdAt);
      const existing = lastPurchaseByMember.get(p.memberId);
      if (!existing || date > existing) {
        lastPurchaseByMember.set(p.memberId, date);
      }
    }

    // Sort members: those who never bought first (alphabetically among ties),
    // then by oldest last purchase date
    const sorted = [...members].sort((a, b) => {
      const aDate = lastPurchaseByMember.get(a.id);
      const bDate = lastPurchaseByMember.get(b.id);

      if (!aDate && !bDate) return a.name.localeCompare(b.name);
      if (!aDate) return -1; // a never bought, prioritise
      if (!bDate) return 1;  // b never bought, prioritise
      // Both have bought; the one who bought longest ago goes first
      if (aDate < bDate) return -1;
      if (aDate > bDate) return 1;
      return a.name.localeCompare(b.name);
    });

    nextBuyer = sorted[0];
  }

  return { lastBuyer, nextBuyer };
}
