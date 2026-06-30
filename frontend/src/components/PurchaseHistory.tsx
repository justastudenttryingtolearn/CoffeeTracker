import { useState } from 'react';
import type { Purchase } from '../types';
import { api } from '../api/client';

interface Props {
  purchases: Purchase[];
  loading: boolean;
  onPurchaseDeleted: (id: number) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PurchaseHistory({ purchases, loading, onPurchaseDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function handleDelete(id: number) {
    setError('');
    setDeletingId(id);
    try {
      await api.deletePurchase(id);
      onPurchaseDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="card">
      <h2>Purchase History</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : purchases.length === 0 ? (
        <p className="muted">No purchases recorded yet.</p>
      ) : (
        <ul className="purchase-list">
          {purchases.map(p => (
            <li key={p.id} className="purchase-item">
              <div className="purchase-info">
                <strong>{p.memberName}</strong>
                {p.note && <span className="purchase-note"> — {p.note}</span>}
                <span className="purchase-date">{formatDate(p.createdAt)}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                title="Delete purchase"
              >
                {deletingId === p.id ? '…' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
