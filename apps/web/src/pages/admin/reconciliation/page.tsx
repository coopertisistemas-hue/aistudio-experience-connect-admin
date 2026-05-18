import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockReconciliations } from '@/mocks/admin-receivables';
import type { MockReconciliation } from '@/mocks/admin-receivables';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import ReconciliationSummaryStrip from './components/ReconciliationSummaryStrip';
import ReconciliationFilterBar from './components/ReconciliationFilterBar';
import type { ReconciliationFilters } from './components/ReconciliationFilterBar';
import ReconciliationList from './components/ReconciliationList';
import ReconciliationDetailDrawer from './components/ReconciliationDetailDrawer';

interface Toast { id: number; message: string; type: 'success' | 'warning' }

const INITIAL_FILTERS: ReconciliationFilters = {
  search: '',
  status: 'all',
  method: 'all',
};

function applyFilters(items: MockReconciliation[], f: ReconciliationFilters): MockReconciliation[] {
  return items.filter((r) => {
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.method !== 'all' && r.method !== f.method) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !r.reference.toLowerCase().includes(q) &&
        !r.booking_ref.toLowerCase().includes(q) &&
        !r.passenger_name.toLowerCase().includes(q) &&
        !r.gateway_ref.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

export default function ReconciliationPage() {
  const [filters, setFilters] = useState<ReconciliationFilters>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<MockReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selected) setSelected(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  const filtered = useMemo(() => applyFilters(mockReconciliations, filters), [filters]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const divergentItems = mockReconciliations.filter((r) => r.status === 'divergent');
  const reviewItems = mockReconciliations.filter((r) => r.status === 'in_review');
  const pendingCount = mockReconciliations.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-file-list-3-line"
        title="Conciliação"
        subtitle="Conciliação financeira entre pagamentos recebidos, reservas e operações."
        badge={`${pendingCount} pendente${pendingCount !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <button type="button"
              className="flex items-center gap-2 h-9 px-3.5 bg-white hover:bg-stone-50 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-download-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button type="button"
              onClick={() => addToast('Conciliação manual iniciada', 'success')}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-refresh-line text-sm"></i>
              Conciliar Tudo
            </button>
          </div>
        }
      />

      {/* Alert banners */}
      {divergentItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
            <i className="ri-error-warning-line text-amber-500 text-sm animate-pulse"></i>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700">
              {divergentItems.length} divergência{divergentItems.length > 1 ? 's' : ''} detectada{divergentItems.length > 1 ? 's' : ''}
            </p>
            <p className="text-[11px] text-amber-600">
              {divergentItems.map((r) => r.reference).join(', ')} — requer revisão
            </p>
          </div>
          <button type="button" onClick={() => setFilters((p) => ({ ...p, status: 'divergent' }))}
            className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">
            Ver
          </button>
        </div>
      )}

      {reviewItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-100 flex-shrink-0">
            <i className="ri-search-eye-line text-sky-500 text-sm animate-pulse"></i>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-sky-700">
              {reviewItems.length} transação{reviewItems.length > 1 ? 'ões' : ''} em análise
            </p>
            <p className="text-[11px] text-sky-600">Aguardando confirmação bancária</p>
          </div>
          <button type="button" onClick={() => setFilters((p) => ({ ...p, status: 'in_review' }))}
            className="text-[11px] font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 border border-sky-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">
            Ver
          </button>
        </div>
      )}

      <ReconciliationSummaryStrip />

      {/* Rate progress card */}
      <div className="mb-5 bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-pie-chart-2-line text-teal-600 text-sm"></i>
            </div>
            <span className="text-sm font-semibold text-stone-800">Taxa de Conciliação — Maio 2026</span>
          </div>
          <span className="text-sm font-bold text-teal-700 font-serif">
            {mockReconciliations.filter((r) => r.status === 'reconciled').length}/{mockReconciliations.length} transações
          </span>
        </div>
        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.round((mockReconciliations.filter((r) => r.status === 'reconciled').length / mockReconciliations.length) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
          <span>{mockReconciliations.filter((r) => r.status === 'reconciled').length} conciliadas</span>
          <span>{Math.round((mockReconciliations.filter((r) => r.status === 'reconciled').length / mockReconciliations.length) * 100)}% conciliado</span>
        </div>
      </div>

      <ReconciliationFilterBar
        filters={filters}
        onChange={setFilters}
        total={mockReconciliations.length}
        filtered={filtered.length}
      />

      <ReconciliationList
        items={filtered}
        onSelect={setSelected}
        selectedId={selected?.id}
        loading={loading}
      />

      {selected && (
        <ReconciliationDetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onReconcile={() => addToast('Transação conciliada com sucesso')}
        />
      )}

      {/* Mobile sticky */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        <button type="button" onClick={() => addToast('Conciliação iniciada')}
          className="w-12 h-12 flex items-center justify-center bg-navy-950 text-white rounded-full shadow-lg cursor-pointer">
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto ${
            t.type === 'success' ? 'bg-navy-950 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line text-teal-400' : 'ri-information-line text-amber-500'}`}></i>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}