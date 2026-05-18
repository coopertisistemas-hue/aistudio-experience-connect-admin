import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockReceivables } from '@/mocks/admin-receivables';
import type { MockReceivable } from '@/mocks/admin-receivables';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import ReceivablesSummaryStrip from './components/ReceivablesSummaryStrip';
import ReceivablesFilterBar from './components/ReceivablesFilterBar';
import type { ReceivablesFilters } from './components/ReceivablesFilterBar';
import ReceivablesList from './components/ReceivablesList';
import ReceivableDetailDrawer from './components/ReceivableDetailDrawer';
import CashflowForecast from './components/CashflowForecast';

interface Toast { id: number; message: string; type: 'success' | 'warning' }

const INITIAL_FILTERS: ReceivablesFilters = {
  search: '',
  status: 'all',
  method: 'all',
  period: 'all',
};

function applyFilters(items: MockReceivable[], f: ReceivablesFilters): MockReceivable[] {
  return items.filter((r) => {
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.method !== 'all' && r.method !== f.method) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !r.passenger_name.toLowerCase().includes(q) &&
        !r.booking_ref.toLowerCase().includes(q) &&
        !r.route_name.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

export default function ReceivablesPage() {
  const [filters, setFilters] = useState<ReceivablesFilters>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<MockReceivable | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForecast, setShowForecast] = useState(true);

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

  const filtered = useMemo(() => applyFilters(mockReceivables, filters), [filters]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const overdueItems = mockReceivables.filter((r) => r.status === 'overdue');
  const openCount = mockReceivables.filter((r) => r.status === 'open').length;

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-money-dollar-circle-line"
        title="Recebíveis"
        subtitle="Contas a receber, vencimentos e gestão do fluxo de caixa operacional."
        badge={`${openCount} em aberto`}
        action={
          <div className="flex items-center gap-2">
            <button type="button"
              className="flex items-center gap-2 h-9 px-3.5 bg-white hover:bg-stone-50 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-download-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button type="button"
              onClick={() => addToast('Funcionalidade em desenvolvimento', 'warning')}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-add-line text-sm"></i>
              Novo Recebível
            </button>
          </div>
        }
      />

      {/* Overdue alert */}
      {overdueItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
            <i className="ri-alarm-warning-line text-red-500 text-sm animate-pulse"></i>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-700">
              {overdueItems.length} recebível{overdueItems.length > 1 ? 's' : ''} em atraso
            </p>
            <p className="text-[11px] text-red-600">
              {overdueItems.map((r) => r.passenger_name.split(' ')[0]).join(', ')} — ação recomendada
            </p>
          </div>
          <button type="button" onClick={() => setFilters((p) => ({ ...p, status: 'overdue' }))}
            className="text-[11px] font-semibold text-red-600 bg-red-100 hover:bg-red-200 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">
            Ver
          </button>
        </div>
      )}

      <ReceivablesSummaryStrip />

      {/* Cashflow toggle */}
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={() => setShowForecast((p) => !p)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap
            ${showForecast ? 'bg-navy-950 text-white border-navy-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
          <i className="ri-funds-line text-xs"></i>
          Previsão de Caixa
        </button>
      </div>

      {showForecast && <CashflowForecast />}

      <ReceivablesFilterBar
        filters={filters}
        onChange={setFilters}
        total={mockReceivables.length}
        filtered={filtered.length}
      />

      <ReceivablesList
        receivables={filtered}
        onSelect={setSelected}
        selectedId={selected?.id}
        loading={loading}
      />

      {selected && (
        <ReceivableDetailDrawer
          receivable={selected}
          onClose={() => setSelected(null)}
          onConfirm={() => addToast('Recebimento confirmado com sucesso')}
        />
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        <button type="button" className="w-12 h-12 flex items-center justify-center bg-navy-950 text-white rounded-full shadow-lg cursor-pointer">
          <i className="ri-add-line text-xl"></i>
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