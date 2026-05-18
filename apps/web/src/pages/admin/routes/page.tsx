import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockRoutes } from '@/mocks/admin-routes';
import type { MockRoute, RouteStatus } from '@/mocks/admin-routes';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import RoutesSummaryStrip from './components/RoutesSummaryStrip';
import RoutesFilterBar from './components/RoutesFilterBar';
import type { RoutesFilters } from './components/RoutesFilterBar';
import RoutesGrid from './components/RoutesGrid';
import RouteDetailDrawer from './components/RouteDetailDrawer';
import NovaRotaForm from './components/NovaRotaForm';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning';
}

const INITIAL_FILTERS: RoutesFilters = {
  search: '',
  status: 'all',
  category: 'all',
  demand: 'all',
  priceMin: '',
  priceMax: '',
};

function applyFilters(routes: MockRoute[], f: RoutesFilters): MockRoute[] {
  return routes.filter((r) => {
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.category !== 'all' && r.category !== f.category) return false;
    if (f.demand !== 'all' && r.demand_level !== f.demand) return false;
    if (f.priceMin && r.base_price < Number(f.priceMin)) return false;
    if (f.priceMax && r.base_price > Number(f.priceMax)) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !r.name.toLowerCase().includes(q) &&
        !r.origin_name.toLowerCase().includes(q) &&
        !r.destination_name.toLowerCase().includes(q) &&
        !r.category.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

export default function RoutesPage() {
  const [filters, setFilters] = useState<RoutesFilters>(INITIAL_FILTERS);
  const [selectedRoute, setSelectedRoute] = useState<MockRoute | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) { setShowForm(false); return; }
        if (selectedRoute) setSelectedRoute(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm, selectedRoute]);

  const filtered = useMemo(() => applyFilters(mockRoutes, filters), [filters]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // Alerts
  const attentionRoutes = mockRoutes.filter((r) => r.status === 'attention');
  const pausedRoutes = mockRoutes.filter((r) => r.status === 'paused');
  const highDemandRoutes = mockRoutes.filter((r) => r.status === 'high_demand');

  const totalTransfersToday = mockRoutes.reduce((s, r) => s + r.transfers_today, 0);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-route-line"
        title="Rotas"
        subtitle="Catálogo operacional de rotas, destinos e planejamento de transfers."
        badge={`${mockRoutes.filter((r) => r.is_active).length} ativas`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 h-9 px-3.5 bg-white hover:bg-sand-50 text-navy-600 text-sm font-medium rounded-xl border border-sand-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Nova Rota
            </button>
          </div>
        }
      />

      {/* Alerts */}
      {attentionRoutes.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
            <i className="ri-alert-line text-red-500 text-sm"></i>
          </div>
          <p className="text-xs font-semibold text-red-700 flex-1">
            {attentionRoutes.map((r) => r.name).join(', ')} — requer atenção operacional
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: 'attention' }))}
            className="text-[11px] font-semibold text-red-600 bg-red-100 hover:bg-red-200 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {highDemandRoutes.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0">
            <i className="ri-fire-line text-navy-600 text-sm"></i>
          </div>
          <p className="text-xs text-navy-700 flex-1">
            <span className="font-semibold">{highDemandRoutes.length} rota{highDemandRoutes.length > 1 ? 's' : ''} em alta demanda</span>
            {' — '}{highDemandRoutes.map((r) => r.name).join(', ')}
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: 'high_demand' }))}
            className="text-[11px] font-semibold text-navy-700 bg-navy-100 hover:bg-navy-200 border border-navy-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {pausedRoutes.length > 0 && !attentionRoutes.length && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
            <i className="ri-pause-circle-line text-amber-500 text-sm"></i>
          </div>
          <p className="text-xs text-amber-700 flex-1">
            <span className="font-semibold">{pausedRoutes.length} rota{pausedRoutes.length > 1 ? 's' : ''} pausada{pausedRoutes.length > 1 ? 's' : ''}</span>
            {' — '}{pausedRoutes.map((r) => r.name).join(', ')}
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: 'paused' }))}
            className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {/* Today summary chip */}
      {totalTransfersToday > 0 && (
        <div className="mb-5 flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
          <i className="ri-car-line text-teal-500 text-sm flex-shrink-0"></i>
          <p className="text-xs text-teal-700">
            <span className="font-bold">{totalTransfersToday} transfers</span> em andamento hoje em todas as rotas
          </p>
        </div>
      )}

      {/* KPI Strip */}
      <RoutesSummaryStrip routes={mockRoutes} />

      {/* Filters */}
      <RoutesFilterBar
        filters={filters}
        onChange={setFilters}
        total={mockRoutes.length}
        filtered={filtered.length}
      />

      {/* Grid */}
      <RoutesGrid
        routes={filtered}
        onSelect={setSelectedRoute}
        selectedId={selectedRoute?.id}
        loading={loading}
      />

      {/* Detail Drawer */}
      {selectedRoute && (
        <RouteDetailDrawer
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onCreateTransfer={() => addToast('Redirecionando para criar transfer...')}
        />
      )}

      {/* New Route Form */}
      {showForm && (
        <NovaRotaForm
          onClose={() => setShowForm(false)}
          onSuccess={() => addToast('Rota criada com sucesso')}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto ${
              t.type === 'success' ? 'bg-navy-950 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line text-teal-400' : 'ri-alert-line text-amber-500'}`}></i>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}