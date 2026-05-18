import { useState, useEffect, useMemo } from 'react';
import { mockCheckins, mockCheckinStats } from '@/mocks/admin-checkins';
import type { MockCheckin, CheckinStatus } from '@/mocks/admin-checkins';
import CheckinsSummaryStrip from './components/CheckinsSummaryStrip';
import CheckinsFilterBar from './components/CheckinsFilterBar';
import CheckinsOperationalList from './components/CheckinsOperationalList';
import CheckinDetailDrawer from './components/CheckinDetailDrawer';
import NovoCheckinForm from './components/NovoCheckinForm';

type ToastType = 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-stone-200 rounded-xl h-24" />
        ))}
      </div>
      <div className="bg-stone-200 rounded-xl h-16" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-stone-200 rounded-xl h-28" />
        ))}
      </div>
    </div>
  );
}

export default function CheckinsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState<MockCheckin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<CheckinStatus | 'all'>('all');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCheckin) setSelectedCheckin(null);
        if (showForm) setShowForm(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedCheckin, showForm]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const filtered = useMemo(() => {
    return mockCheckins.filter((ci) => {
      if (activeStatus !== 'all' && ci.status !== activeStatus) return false;
      if (filterDriver && ci.driver_name !== filterDriver) return false;
      if (filterCategory && ci.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          ci.passenger_lead.toLowerCase().includes(q) ||
          ci.booking_reference.toLowerCase().includes(q) ||
          ci.route_name.toLowerCase().includes(q) ||
          ci.origin.toLowerCase().includes(q) ||
          ci.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, activeStatus, filterDriver, filterCategory]);

  const activeFiltersCount = [
    activeStatus !== 'all',
    !!filterDriver,
    !!filterCategory,
    !!filterPeriod,
  ].filter(Boolean).length;

  const handleClear = () => {
    setSearch('');
    setActiveStatus('all');
    setFilterDriver('');
    setFilterCategory('');
    setFilterPeriod('');
  };

  const absentCount = mockCheckins.filter((c) => c.status === 'absent').length;
  const pendingNoDriver = mockCheckins.filter((c) => c.status === 'pending' && !c.driver_name).length;
  const inTransitCount = mockCheckins.filter((c) => c.status === 'in_transit').length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Alert banners */}
      {absentCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-user-unfollow-line flex-shrink-0"></i>
          <span className="flex-1">
            <strong>{absentCount} passageiro{absentCount !== 1 ? 's' : ''} marcado{absentCount !== 1 ? 's' : ''} como ausente</strong>{' '}
            — Verifique as operações afetadas e registre ocorrências se necessário.
          </span>
          <button type="button" onClick={() => setActiveStatus('absent')} className="text-red-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver ausentes
          </button>
        </div>
      )}
      {pendingNoDriver > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <i className="ri-steering-2-line flex-shrink-0"></i>
          <span className="flex-1">
            <strong>{pendingNoDriver} check-in{pendingNoDriver !== 1 ? 's' : ''} sem motorista atribuído</strong>{' '}
            — Atribua motoristas para garantir a operação.
          </span>
          <button type="button" onClick={() => setActiveStatus('pending')} className="text-amber-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver pendentes
          </button>
        </div>
      )}
      {inTransitCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm">
          <i className="ri-navigation-line flex-shrink-0 animate-pulse"></i>
          <span className="flex-1">
            <strong>{inTransitCount} transfer{inTransitCount !== 1 ? 's' : ''} em trânsito agora</strong>{' '}
            — Acompanhe o status dos passageiros em tempo real.
          </span>
          <button type="button" onClick={() => setActiveStatus('in_transit')} className="text-teal-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver em trânsito
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Check-ins</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Controle de embarque e passageiros — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            {mockCheckinStats.today_total} operações hoje
          </div>
          <button
            type="button"
            onClick={() => addToast('Exportação iniciada. O arquivo estará disponível em instantes.', 'info')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-2-line text-sm"></i>
            Exportar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Novo Check-in
          </button>
        </div>
      </div>

      {/* KPIs */}
      <CheckinsSummaryStrip />

      {/* Filters */}
      <CheckinsFilterBar
        total={mockCheckins.length}
        filtered={filtered.length}
        onSearch={setSearch}
        onStatusChange={setActiveStatus}
        activeStatus={activeStatus}
        onDriverChange={setFilterDriver}
        onCategoryChange={setFilterCategory}
        onPeriodChange={setFilterPeriod}
        activeFiltersCount={activeFiltersCount}
        onClear={handleClear}
      />

      {/* Operational list */}
      <CheckinsOperationalList
        checkins={filtered}
        selectedId={selectedCheckin?.id ?? null}
        onSelect={setSelectedCheckin}
      />

      {/* Detail Drawer */}
      {selectedCheckin && (
        <CheckinDetailDrawer
          checkin={selectedCheckin}
          onClose={() => setSelectedCheckin(null)}
          onToast={(msg) => addToast(msg)}
        />
      )}

      {/* New check-in form */}
      {showForm && (
        <NovoCheckinForm
          onClose={() => setShowForm(false)}
          onSave={(confirmed) => {
            setShowForm(false);
            addToast(confirmed ? 'Check-in criado e confirmado com sucesso.' : 'Check-in salvo como pendente.');
          }}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#0f2a40] text-white'
                : 'bg-stone-800 text-white'
            }`}
          >
            <i className={`${toast.type === 'success' ? 'ri-checkbox-circle-line text-teal-400' : 'ri-information-line text-stone-400'}`}></i>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}