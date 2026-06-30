import { useEffect, useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
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
  const [purchaseTotal, setPurchaseTotal] = useState(0);
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
        // getPurchases now returns a paginated envelope
        setPurchases(p.data);
        setPurchaseTotal(p.total);
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
    toast.success(`${member.name} added!`);
    fetchStatus();
  }

  async function handleMemberDeleted(id: number) {
    const member = members.find(m => m.id === id);
    try {
      await api.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      // Also remove their purchases from local state (cascaded on backend)
      setPurchases(prev => prev.filter(p => p.memberId !== id));
      toast.success(`${member?.name ?? 'Member'} removed.`);
      fetchStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member.');
    }
  }

  function handlePurchaseAdded(purchase: Purchase) {
    setPurchases(prev => [purchase, ...prev]);
    setPurchaseTotal(prev => prev + 1);
    toast.success(`Purchase recorded for ${purchase.memberName}!`);
    fetchStatus();
  }

  function handlePurchaseDeleted(id: number) {
    setPurchases(prev => prev.filter(p => p.id !== id));
    setPurchaseTotal(prev => prev - 1);
    toast.success('Purchase deleted.');
    fetchStatus();
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
              onMemberDeleted={handleMemberDeleted}
            />
          </div>
          <div className="column right-column">
            <PurchaseForm members={members} onPurchaseAdded={handlePurchaseAdded} />
            <PurchaseHistory
              purchases={purchases}
              total={purchaseTotal}
              loading={loadingPurchases}
              onPurchaseDeleted={handlePurchaseDeleted}
            />
          </div>
        </main>
      </div>
    </>
  );
}
