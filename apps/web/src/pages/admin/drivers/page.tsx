import { useState, useEffect } from 'react';
import { mockDrivers, type MockDriver, type DriverStatus } from '@/mocks/admin-drivers';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import DriversSummaryStrip from './components/DriversSummaryStrip';
import DriversFilterBar, { type DriversFilters } from './components/DriversFilterBar';
import DriversGrid from './components/DriversGrid';
import DriverDetailDrawer from './components/DriverDetailDrawer';
import NovoMotoristaForm from './components/NovoMotoristaForm';

const defaultFilters: DriversFilters = {
  search: '',
  status: 'all',
  vehicle: 'all',
  availability: 'all',
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function DriversPage() {
  const [filters, setFilters] = useState<DriversFilters>(defaultFilters);
  const [selectedDriver, setSelectedDriver] = useState<MockDriver | null>(null);
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
        else if (selectedDriver) setSelectedDriver(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedDriver, showNewForm]);

  const filtered = mockDrivers.filter((d) => {
    if (filters.status !== 'all' && d.status !== (filters.status as DriverStatus)) return false;
    if (filters.vehicle === 'assigned' && !d.assigned_vehicle) return false;
    if (filters.vehicle === 'unassigned' && d.assigned_vehicle) return false;
    if (filters.availability === 'today') {
      const today = d.availability[0];
      if (!today || today.status === 'off' || today.status === 'blocked') return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        d.full_name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        (d.assigned_vehicle?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const availableCount = mockDrivers.filter((d) => d.status === 'available').length;
  const pendingCount = mockDrivers.filter((d) => d.status === 'pending').length;

  return (
    <div className="p-6 max-w-[1600px]">
      <PageHeader
        icon="ri-steering-2-line"
        title="Motoristas"
        subtitle="Gerencie a equipe de motoristas, disponibilidade, alocações e acesso ao App."
        badge={`${availableCount} disponíveis`}
        action={
          <div className="flex items-center gap-2.5">
            {/* Pending invite alert */}
            {pendingCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 h-10 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                <i className="ri-user-add-line text-amber-600 text-sm"></i>
                <span className="text-xs font-semibold text-amber-700">
                  {pendingCount} convite{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''}
                </span>
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

            {/* Novo Motorista */}
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="h-10 flex items-center gap-2 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Novo Motorista
            </button>
          </div>
        }
      />

      {/* Summary strip */}
      <DriversSummaryStrip drivers={mockDrivers} />

      {/* Operational alerts */}
      {mockDrivers.some((d) => d.performance.incidents > 0) && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 border border-amber-200 flex-shrink-0">
            <i className="ri-alert-line text-amber-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">
              {mockDrivers.filter((d) => d.performance.incidents > 0).length} motorista(s) com ocorrências registradas
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Verifique os perfis e tome as ações necessárias para manter a qualidade da operação.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, status: 'on_trip' }))}
            className="text-[10px] font-semibold text-amber-700 bg-white border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Ver detalhes
          </button>
        </div>
      )}

      {/* Filter bar */}
      <DriversFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={mockDrivers.length}
        filteredCount={filtered.length}
      />

      {/* Driver grid */}
      <DriversGrid
        drivers={filtered}
        onSelect={(d) => {
          setShowNewForm(false);
          setSelectedDriver(d);
        }}
        selectedId={selectedDriver?.id}
        loading={loading}
      />

      {/* Detail drawer */}
      {selectedDriver && (
        <DriverDetailDrawer
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {/* Novo motorista form */}
      {showNewForm && (
        <NovoMotoristaForm
          onClose={() => setShowNewForm(false)}
          onSave={(sendInvite) => {
            setShowNewForm(false);
            addToast(
              sendInvite
                ? 'Motorista cadastrado! Convite de acesso enviado por e-mail.'
                : 'Motorista cadastrado com sucesso!'
            );
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