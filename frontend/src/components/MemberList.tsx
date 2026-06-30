import { useState } from 'react';
import type { Member } from '../types';
import { api } from '../api/client';

interface Props {
  members: Member[];
  loading: boolean;
  onMemberAdded: (member: Member) => void;
}

export function MemberList({ members, loading, onMemberAdded }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const member = await api.addMember(name);
      onMemberAdded(member);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>Members</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          placeholder="Member name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={submitting}
          maxLength={100}
        />
        <button type="submit" disabled={submitting || !name.trim()}>
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : members.length === 0 ? (
        <p className="muted">No members yet. Add one above.</p>
      ) : (
        <ul className="member-list">
          {members.map(m => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
