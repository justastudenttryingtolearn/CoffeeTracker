import type { StatusResponse } from '../types';

interface Props {
  status: StatusResponse | null;
  loading: boolean;
}

export function StatusPanel({ status, loading }: Props) {
  if (loading) return <section className="card"><h2>Status</h2><p className="muted">Loading…</p></section>;
  if (!status) return null;

  return (
    <section className="card status-panel">
      <h2>Status</h2>
      <div className="status-row">
        <span className="status-label">Last bought:</span>
        <span className="status-value">
          {status.lastBuyer ? status.lastBuyer.name : <em className="muted">Nobody yet</em>}
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">Next up:</span>
        <span className="status-value next-buyer">
          {status.nextBuyer ? status.nextBuyer.name : <em className="muted">No members</em>}
        </span>
      </div>
    </section>
  );
}
