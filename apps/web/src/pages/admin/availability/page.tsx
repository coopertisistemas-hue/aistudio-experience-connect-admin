import { useState, useMemo } from 'react';
import type { AvailabilityDriver, AvailabilityVehicle } from '@/mocks/admin-availability';
import {
  mockAvailabilityDrivers,
  mockAvailabilityVehicles,
  mockConflicts,
} from '@/mocks/admin-availability';
import AvailabilitySummaryStrip from './components/AvailabilitySummaryStrip';
import AvailabilityFilterBar from './components/AvailabilityFilterBar';
import type { AvailView, ShiftFilter, StatusFilter } from './components/AvailabilityFilterBar';
import AvailabilityWeekTimeline from './components/AvailabilityWeekTimeline';
import AvailabilityConflicts from './components/AvailabilityConflicts';
import AvailabilityDetailDrawer from './components/AvailabilityDetailDrawer';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const toastColors = {
  success: 'bg-teal-600 text-white',
  info: 'bg-slate-600 text-white',
  warning: 'bg-amber-500 text-white',
};

export default function AvailabilityPage() {
  // Drawer state
  const [selectedDriver, setSelectedDriver] = useState<AvailabilityDriver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<AvailabilityVehicle | null>(null);

  // Filter state
  const [view, setView] = useState<AvailView>('all');
  const [shift, setShift] = useState<ShiftFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // Week label
  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return '12–18 Mai 2026';
    if (weekOffset === -1) return '05–11 Mai 2026';
    if (weekOffset === 1) return '19–25 Mai 2026';
    return `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  }, [weekOffset]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return mockAvailabilityDrivers.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return mockAvailabilityVehicles.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.plate.toLowerCase().includes(q) &&
          !v.model.toLowerCase().includes(q) &&
          !v.type.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [search]);

  const handleClear = () => {
    setSearch('');
    setShift('all');
    setStatus('all');
  };

  const drawerResource = selectedDriver ?? selectedVehicle ?? null;
  const drawerType = selectedDriver ? 'driver' : selectedVehicle ? 'vehicle' : null;

  const closeDrawer = () => {
    setSelectedDriver(null);
    setSelectedVehicle(null);
  };

  const conflictCount = mockConflicts.filter((c) => c.severity === 'high').length;

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${toastColors[t.type]}`}
            >
              <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line' : t.type === 'warning' ? 'ri-alert-line' : 'ri-information-line'}`}></i>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Critical conflict banner */}
      {conflictCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
          <p className="text-xs text-red-800 flex-1">
            <span className="font-semibold">{conflictCount} conflito{conflictCount > 1 ? 's' : ''} crítico{conflictCount > 1 ? 's' : ''}</span>{' '}
            detectado{conflictCount > 1 ? 's' : ''} esta semana — requer atenção operacional imediata.
          </p>
          <button
            type="button"
            className="text-xs font-semibold text-red-700 underline cursor-pointer whitespace-nowrap"
            onClick={() => document.getElementById('conflicts-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver conflitos
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Disponibilidade</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Escalonamento operacional de motoristas e veículos
            <span className="ml-2 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold border border-stone-200">
              {mockAvailabilityDrivers.length} motoristas · {mockAvailabilityVehicles.length} veículos
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => addToast('Exportação de agenda disponível em breve.', 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line text-sm"></i>
            Exportar
          </button>
          <button
            type="button"
            onClick={() => addToast('Editor de escala em desenvolvimento.', 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-calendar-check-line text-sm"></i>
            Nova Escala
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <AvailabilitySummaryStrip />

      {/* Filters */}
      <AvailabilityFilterBar
        view={view}
        onViewChange={setView}
        shift={shift}
        onShiftChange={setShift}
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        onClear={handleClear}
        weekLabel={weekLabel}
        onPrevWeek={() => setWeekOffset((o) => o - 1)}
        onNextWeek={() => setWeekOffset((o) => o + 1)}
        onToday={() => setWeekOffset(0)}
      />

      {/* Weekly timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <AvailabilityWeekTimeline
            drivers={filteredDrivers}
            vehicles={filteredVehicles}
            view={view}
            onSelectDriver={(d) => { setSelectedDriver(d); setSelectedVehicle(null); }}
            onSelectVehicle={(v) => { setSelectedVehicle(v); setSelectedDriver(null); }}
          />
        </div>
      </div>

      {/* Conflicts section */}
      <div id="conflicts-section">
        <AvailabilityConflicts
          conflicts={mockConflicts}
          onFocus={(id) => addToast(`Focando no conflito ${id}…`, 'info')}
        />
      </div>

      {/* Detail drawer */}
      <AvailabilityDetailDrawer
        resource={drawerResource}
        resourceType={drawerType}
        onClose={closeDrawer}
        onAddToast={addToast}
      />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          type="button"
          onClick={() => addToast('Editor de escala em desenvolvimento.', 'info')}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-full cursor-pointer whitespace-nowrap"
        >
          <i className="ri-calendar-check-line text-sm"></i>
          Nova Escala
        </button>
      </div>
    </div>
  );
}