import { useState } from 'react';
import type { DriverStatus } from '@/mocks/admin-drivers';

export interface DriversFilters {
  search: string;
  status: DriverStatus | 'all';
  vehicle: string;
  availability: string;
}

interface DriversFilterBarProps {
  filters: DriversFilters;
  onChange: (f: DriversFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const statusTabs: { label: string; value: DriverStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Disponível', value: 'available' },
  { label: 'Em Transfer', value: 'on_trip' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Offline', value: 'off_duty' },
  { label: 'Indisponível', value: 'unavailable' },
  { label: 'Pendente', value: 'pending' },
];

const vehicleOptions = [
  { value: 'all', label: 'Todos os veículos' },
  { value: 'assigned', label: 'Com veículo' },
  { value: 'unassigned', label: 'Sem veículo' },
];

const availabilityOptions = [
  { value: 'all', label: 'Qualquer disponibilidade' },
  { value: 'today', label: 'Disponível hoje' },
  { value: 'week', label: 'Disponível esta semana' },
];

export default function DriversFilterBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: DriversFilterBarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = (p: Partial<DriversFilters>) => onChange({ ...filters, ...p });

  const hasActive = filters.vehicle !== 'all' || filters.availability !== 'all';

  const clearAll = () =>
    onChange({ search: '', status: 'all', vehicle: 'all', availability: 'all' });

  return (
    <div className="space-y-3 mb-5">
      {/* Search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-navy-400 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Buscar motorista por nome, e-mail ou telefone..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-sand-200 rounded-xl text-navy-800 placeholder-navy-300 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-teal-100 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => set({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-navy-300 hover:text-navy-600 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className={`h-10 flex items-center gap-2 px-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
              advancedOpen || hasActive
                ? 'bg-navy-950 text-white border-navy-950'
                : 'bg-white border-sand-200 text-navy-600 hover:border-sand-300'
            }`}
          >
            <i className="ri-equalizer-2-line text-sm"></i>
            Filtros
            {hasActive && (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-400 text-navy-950 text-[9px] font-bold">!</span>
            )}
          </button>

          {(hasActive || filters.search) && (
            <button
              type="button"
              onClick={clearAll}
              className="h-10 flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line text-sm"></i>
              Limpar
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-50 border border-sand-200">
            <span className="text-navy-400 text-xs">Exibindo</span>
            <span className="text-navy-800 text-xs font-semibold">{filteredCount}</span>
            <span className="text-navy-400 text-xs">de {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {advancedOpen && (
        <div className="bg-white border border-sand-200 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1.5">
                Veículo
              </label>
              <select
                value={filters.vehicle}
                onChange={(e) => set({ vehicle: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-sand-50 border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer"
              >
                {vehicleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1.5">
                Disponibilidade
              </label>
              <select
                value={filters.availability}
                onChange={(e) => set({ availability: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-sand-50 border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer"
              >
                {availabilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Status pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => set({ status: tab.value })}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
              filters.status === tab.value
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-sand-200 text-navy-500 hover:border-stone-300 hover:text-navy-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}