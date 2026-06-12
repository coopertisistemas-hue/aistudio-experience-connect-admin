import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import { TableSkeleton, KPISkeleton } from '@/pages/admin/components/ui/LoadingSkeleton';
import EmptyState from '@/pages/admin/components/ui/EmptyState';
import VehiclesSummaryStrip from './components/VehiclesSummaryStrip';
import VehiclesFilterBar from './components/VehiclesFilterBar';
import type { VehiclesFilters } from './components/VehiclesFilterBar';
import VehiclesGrid from './components/VehiclesGrid';
import VehicleDetailDrawer from './components/VehicleDetailDrawer';
import NovoVeiculoForm from './components/NovoVeiculoForm';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning';
}

const INITIAL_FILTERS: VehiclesFilters = {
  search: '',
  status: 'all',
  type: 'all',
  hasDriver: 'all',
  maintenance: 'all',
};

export default function VehiclesPage() {
  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';

  const { data: vehicles = [], isLoading, error } = useVehicles(tenantId);

  const [filters, setFilters] = useState<VehiclesFilters>(INITIAL_FILTERS);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v: any) => {
      if (filters.status !== 'all' && v.status !== filters.status) return false;
      if (filters.type !== 'all' && v.type !== filters.type) return false;
      if (filters.hasDriver === 'yes' && !v.assigned_driver) return false;
      if (filters.hasDriver === 'no' && v.assigned_driver) return false;
      if (filters.maintenance !== 'all' && v.maintenance_status !== filters.maintenance) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !v.name.toLowerCase().includes(q) &&
          !(v.plate || '').toLowerCase().includes(q) &&
          !(v.make || '').toLowerCase().includes(q) &&
          !(v.model || '').toLowerCase().includes(q) &&
          !(v.type || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [vehicles, filters]);

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon="ri-error-warning-line"
          title="Erro ao carregar veículos"
          description="Não foi possível carregar os dados. Tente novamente."
        />
      </div>
    );
  }

  const maintenanceAlerts = vehicles.filter(
    (v: any) => v.maintenance_status === 'overdue' || v.maintenance_status === 'in_maintenance'
  );
  const attentionVehicles = vehicles.filter((v: any) => v.status === 'attention');
  const noDriverVehicles = vehicles.filter(
    (v: any) => !v.assigned_driver && v.status === 'available'
  );

  const handleFilterByMaintenance = () => {
    setFilters((p) => ({ ...p, maintenance: 'overdue', status: 'all' }));
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-car-line"
        title="Veículos"
        subtitle="Gerencie a frota, capacidade e status operacional da operação."
        badge={`${vehicles.filter((v: any) => v.status === 'available').length} disponíveis`}
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
              Novo Veículo
            </button>
          </div>
        }
      />

      {maintenanceAlerts.length > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 flex-shrink-0 mt-0.5">
            <i className="ri-tools-line text-amber-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">
              {maintenanceAlerts.length} veículo{maintenanceAlerts.length > 1 ? 's' : ''} com pendência de manutenção
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              {maintenanceAlerts.map((v: any) => v.name).join(', ')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleFilterByMaintenance}
            className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver pendências
          </button>
        </div>
      )}

      {attentionVehicles.length > 0 && !maintenanceAlerts.some((v: any) => attentionVehicles.includes(v)) && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
            <i className="ri-alert-line text-red-500 text-sm"></i>
          </div>
          <p className="text-xs font-semibold text-red-700 flex-1">
            {attentionVehicles.map((v: any) => v.name).join(', ')} — requer atenção operacional
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

      {noDriverVehicles.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sand-100 flex-shrink-0">
            <i className="ri-steering-2-line text-navy-400 text-sm"></i>
          </div>
          <p className="text-xs text-navy-600 flex-1">
            <span className="font-semibold">{noDriverVehicles.length} veículo{noDriverVehicles.length > 1 ? 's' : ''}</span> disponíveis sem motorista vinculado
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, hasDriver: 'no', status: 'available' }))}
            className="text-[11px] font-semibold text-navy-600 bg-white hover:bg-sand-100 border border-sand-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {isLoading ? <KPISkeleton /> : <VehiclesSummaryStrip vehicles={vehicles} />}

      <VehiclesFilterBar
        filters={filters}
        onChange={setFilters}
        total={vehicles.length}
        filtered={filtered.length}
      />
      <VehiclesGrid
        vehicles={filtered}
        onSelect={setSelectedVehicle}
        selectedId={selectedVehicle?.id}
        loading={isLoading}
      />

      {selectedVehicle && (
        <VehicleDetailDrawer
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {showForm && (
        <NovoVeiculoForm
          onClose={() => setShowForm(false)}
          onSuccess={() => addToast('Veículo criado com sucesso')}
        />
      )}

      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto transition-all ${
              t.type === 'success'
                ? 'bg-navy-950 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
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
