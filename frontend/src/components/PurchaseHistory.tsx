import { useState } from 'react';
import type { Purchase } from '../types';
import { api } from '../api/client';

interface Props {
  purchases: Purchase[];
  total: number;
  loading: boolean;
  onPurchaseDeleted: (id: number) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PurchaseHistory({ purchases, total, loading, onPurchaseDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function handleDelete(p: Purchase) {
    if (!window.confirm(`Delete purchase by ${p.memberName}${p.note ? ` (${p.note})` : ''}?`)) return;
    setError('');
    setDeletingId(p.id);
    try {
      await api.deletePurchase(p.id);
      onPurchaseDeleted(p.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="card">
      <h2>
        Purchase History
        {total > 0 && <span className="badge">{total}</span>}
      </h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : purchases.length === 0 ? (
        <p className="muted">No purchases recorded yet.</p>
      ) : (
        <>
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
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  title="Delete purchase"
                >
                  {deletingId === p.id ? '…' : '✕'}
                </button>
              </li>
            ))}
          </ul>
          {total > purchases.length && (
            <p className="muted pagination-hint">
              Showing {purchases.length} of {total} purchases.
            </p>
          )}
        </>
      )}
    </section>
  );
}
