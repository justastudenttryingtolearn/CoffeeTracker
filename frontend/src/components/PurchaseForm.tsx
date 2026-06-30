import { useState } from 'react';
import type { Member, Purchase } from '../types';
import { api } from '../api/client';

interface Props {
  members: Member[];
  onPurchaseAdded: (purchase: Purchase) => void;
}

export function PurchaseForm({ members, onPurchaseAdded }: Props) {
  const [memberId, setMemberId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setError('');
    setSubmitting(true);
    try {
      const purchase = await api.addPurchase(Number(memberId), note.trim() || null);
      onPurchaseAdded(purchase);
      setMemberId('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record purchase.');
    } finally {
      setSubmitting(false);
    }
  }

  if (members.length === 0) {
    return (
      <section className="card">
        <h2>Record Purchase</h2>
        <p className="muted">Add members before recording a purchase.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Record Purchase</h2>
      <form onSubmit={handleSubmit} className="purchase-form">
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          disabled={submitting}
          required
        >
          <option value="">— Select member —</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          disabled={submitting}
          maxLength={200}
        />
        <button type="submit" disabled={submitting || !memberId}>
          {submitting ? 'Saving…' : 'Record'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
