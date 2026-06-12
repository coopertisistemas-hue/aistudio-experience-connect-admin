import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoutes, useCreateRoute } from '@/hooks/useRoutes';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import { TableSkeleton, KPISkeleton } from '@/pages/admin/components/ui/LoadingSkeleton';
import EmptyState from '@/pages/admin/components/ui/EmptyState';
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

export default function RoutesPage() {
  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';

  const { data: routes = [], isLoading, error } = useRoutes(tenantId);
  const createRoute = useCreateRoute();

  const [filters, setFilters] = useState<RoutesFilters>(INITIAL_FILTERS);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const filtered = useMemo(() => {
    return routes.filter((r: any) => {
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.category !== 'all' && r.category_name !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !(r.origin || '').toLowerCase().includes(q) &&
          !(r.destination || '').toLowerCase().includes(q) &&
          !(r.category_name || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [routes, filters]);

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon="ri-error-warning-line"
          title="Erro ao carregar rotas"
          description="Não foi possível carregar os dados. Tente novamente."
        />
      </div>
    );
  }

  const activeRoutes = routes.filter((r: any) => r.is_active);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-route-line"
        title="Rotas"
        subtitle="Catálogo operacional de rotas, destinos e planejamento de transfers."
        badge={`${activeRoutes.length} ativas`}
        action={
          <div className="flex items-center gap-2">
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

      {isLoading ? <KPISkeleton /> : <RoutesSummaryStrip routes={routes} />}

      <RoutesFilterBar
        filters={filters}
        onChange={setFilters}
        total={routes.length}
        filtered={filtered.length}
      />

      <RoutesGrid
        routes={filtered}
        onSelect={setSelectedRoute}
        selectedId={selectedRoute?.id}
        loading={isLoading}
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
