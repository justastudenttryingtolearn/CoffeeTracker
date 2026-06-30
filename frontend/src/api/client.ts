import type { Member, Purchase, StatusResponse } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  getMembers: () => request<Member[]>('/members'),

  addMember: (name: string) =>
    request<Member>('/members', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getPurchases: () => request<Purchase[]>('/purchases'),

  addPurchase: (memberId: number, note: string | null) =>
    request<Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify({ memberId, note }),
    }),

  deletePurchase: (id: number) =>
    request<void>(`/purchases/${id}`, { method: 'DELETE' }),

  getStatus: () => request<StatusResponse>('/status'),
};
