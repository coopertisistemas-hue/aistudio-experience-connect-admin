import { useState, useEffect } from 'react';
import { mockTransfers, type MockTransfer, type TransferStatus } from '@/mocks/admin-transfers';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import TransfersSummaryStrip from './components/TransfersSummaryStrip';
import TransfersFilterBar, { type TransfersFilters } from './components/TransfersFilterBar';
import TransfersOperationalList from './components/TransfersOperationalList';
import TransferDetailDrawer from './components/TransferDetailDrawer';
import NovoTransferForm from './components/NovoTransferForm';

const defaultFilters: TransfersFilters = {
  search: '',
  status: 'all',
  driver: 'all',
  vehicleType: 'all',
  dateFrom: '',
  dateTo: '',
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function TransfersPage() {
  const [filters, setFilters] = useState<TransfersFilters>(defaultFilters);
  const [selectedTransfer, setSelectedTransfer] = useState<MockTransfer | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNewForm) setShowNewForm(false);
        else if (selectedTransfer) setSelectedTransfer(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedTransfer, showNewForm]);

  const filtered = mockTransfers.filter((t) => {
    if (filters.status !== 'all' && t.status !== (filters.status as TransferStatus)) return false;
    if (filters.driver !== 'all' && t.driver_name !== filters.driver) return false;
    if (filters.vehicleType !== 'all' && t.vehicle_type !== filters.vehicleType) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(t.scheduled_at) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59);
      if (new Date(t.scheduled_at) > to) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        t.reference.toLowerCase().includes(q) ||
        t.route_name.toLowerCase().includes(q) ||
        t.passenger_name.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        (t.driver_name?.toLowerCase().includes(q) ?? false) ||
        t.vehicle_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = mockTransfers.filter((t) =>
    ['in_progress', 'driver_assigned', 'confirmed'].includes(t.status)
  ).length;

  const unassigned = mockTransfers.filter((t) => !t.driver_name && t.status !== 'cancelled').length;

  return (
    <div className="p-6 max-w-[1600px]">
      <PageHeader
        icon="ri-car-line"
        title="Transfers"
        subtitle="Centro de coordenação e despacho de transfers operacionais."
        badge={`${activeCount} ativos`}
        action={
          <div className="flex items-center gap-2.5">
            {/* Unassigned warning */}
            {unassigned > 0 && (
              <div className="hidden sm:flex items-center gap-2 h-10 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                <i className="ri-user-unfollow-line text-amber-600 text-sm"></i>
                <span className="text-xs font-semibold text-amber-700">{unassigned} sem motorista</span>
              </div>
            )}

            {/* Export */}
            <button
              type="button"
              className="h-10 flex items-center gap-2 px-4 bg-white border border-sand-200 hover:border-sand-300 text-navy-600 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Novo Transfer */}
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="h-10 flex items-center gap-2 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Novo Transfer
            </button>
          </div>
        }
      />

      {/* Summary strip */}
      <TransfersSummaryStrip transfers={mockTransfers} />

      {/* Operational alert strip — delayed/unassigned */}
      {mockTransfers.some((t) => t.status === 'delayed') && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 border border-amber-200 flex-shrink-0">
            <i className="ri-alarm-warning-line text-amber-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">
              {mockTransfers.filter((t) => t.status === 'delayed').length} transfer(s) com atraso operacional
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Verifique os transfers atrasados e notifique os passageiros afetados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, status: 'delayed' }))}
            className="text-[10px] font-semibold text-amber-700 bg-white border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Ver atrasados
          </button>
        </div>
      )}

      {/* Filters */}
      <TransfersFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={mockTransfers.length}
        filteredCount={filtered.length}
      />

      {/* Operational list */}
      <TransfersOperationalList
        transfers={filtered}
        onSelect={(t) => {
          setShowNewForm(false);
          setSelectedTransfer(t);
        }}
        selectedId={selectedTransfer?.id}
        loading={loading}
      />

      {/* Detail drawer */}
      {selectedTransfer && (
        <TransferDetailDrawer
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}

      {/* Novo transfer form */}
      {showNewForm && (
        <NovoTransferForm
          onClose={() => setShowNewForm(false)}
          onSave={() => {
            setShowNewForm(false);
            addToast('Transfer criado com sucesso!');
          }}
        />
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto animate-fade-in-up ${
              t.type === 'success'
                ? 'bg-white border-teal-200 text-navy-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${
              t.type === 'success' ? 'bg-teal-50' : 'bg-red-100'
            }`}>
              <i className={`${t.type === 'success' ? 'ri-checkbox-circle-line text-teal-600' : 'ri-error-warning-line text-red-500'} text-sm`}></i>
            </div>
            <p className="text-sm font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}