import { useEffect, useState, useCallback } from 'react';
import type { Member, Purchase, StatusResponse } from './types';
import { api } from './api/client';
import { MemberList } from './components/MemberList';
import { StatusPanel } from './components/StatusPanel';
import { PurchaseForm } from './components/PurchaseForm';
import { PurchaseHistory } from './components/PurchaseHistory';
import './App.css';

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [globalError, setGlobalError] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const s = await api.getStatus();
      setStatus(s);
    } catch {
      // status errors are non-critical
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [m, p] = await Promise.all([api.getMembers(), api.getPurchases()]);
        setMembers(m);
        setPurchases(p);
      } catch (err) {
        setGlobalError(
          err instanceof Error ? err.message : 'Failed to load data. Is the backend running?'
        );
      } finally {
        setLoadingMembers(false);
        setLoadingPurchases(false);
      }
    }
    init();
    fetchStatus();
  }, [fetchStatus]);

  function handleMemberAdded(member: Member) {
    setMembers(prev => [...prev, member].sort((a, b) => a.name.localeCompare(b.name)));
    fetchStatus();
  }

  function handlePurchaseAdded(purchase: Purchase) {
    setPurchases(prev => [purchase, ...prev]);
    fetchStatus();
  }

  function handlePurchaseDeleted(id: number) {
    setPurchases(prev => prev.filter(p => p.id !== id));
    fetchStatus();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>☕ Coffee Turn Tracker</h1>
        <p className="app-subtitle">Track who bought last and who&apos;s next.</p>
      </header>

      {globalError && <div className="global-error">{globalError}</div>}

      <main className="app-main">
        <div className="column left-column">
          <StatusPanel status={status} loading={loadingStatus} />
          <MemberList
            members={members}
            loading={loadingMembers}
            onMemberAdded={handleMemberAdded}
          />
        </div>
        <div className="column right-column">
          <PurchaseForm members={members} onPurchaseAdded={handlePurchaseAdded} />
          <PurchaseHistory
            purchases={purchases}
            loading={loadingPurchases}
            onPurchaseDeleted={handlePurchaseDeleted}
          />
        </div>
      </main>
    </div>
  );
}
