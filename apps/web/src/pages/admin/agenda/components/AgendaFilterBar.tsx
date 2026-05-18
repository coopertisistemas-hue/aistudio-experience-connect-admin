import { useState } from 'react';
import type { AgendaStatus } from '@/mocks/admin-agenda';
import { mockDrivers } from '@/mocks/admin-agenda';

export interface AgendaFilters {
  search: string;
  status: AgendaStatus | 'all';
  driver_id: string | 'all';
  vehicle_type: string | 'all';
  booking_type: 'transfer' | 'experience' | 'all';
}

interface AgendaFilterBarProps {
  filters: AgendaFilters;
  onChange: (f: AgendaFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const statusTabs: { label: string; value: AgendaStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Agendado', value: 'scheduled' },
  { label: 'Motorista Atribuído', value: 'driver_assigned' },
  { label: 'Em Andamento', value: 'in_progress' },
  { label: 'Finalizado', value: 'completed' },
  { label: 'Atrasado', value: 'delayed' },
  { label: 'Cancelado', value: 'cancelled' },
];

export default function AgendaFilterBar({ filters, onChange, totalCount, filteredCount }: AgendaFilterBarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = (p: Partial<AgendaFilters>) => onChange({ ...filters, ...p });

  const hasActive =
    filters.driver_id !== 'all' || filters.vehicle_type !== 'all' || filters.booking_type !== 'all';

  const clearAll = () =>
    onChange({ search: '', status: 'all', driver_id: 'all', vehicle_type: 'all', booking_type: 'all' });

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
            placeholder="Buscar por referência, passageiro, rota ou motorista..."
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1.5">Motorista</label>
              <select
                value={filters.driver_id}
                onChange={(e) => set({ driver_id: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-sand-50 border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer"
              >
                <option value="all">Todos</option>
                {mockDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1.5">Tipo de Veículo</label>
              <select
                value={filters.vehicle_type}
                onChange={(e) => set({ vehicle_type: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-sand-50 border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="Van Premium">Van Premium</option>
                <option value="Van Executiva">Van Executiva</option>
                <option value="Minibus">Minibus</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1.5">Tipo de Serviço</label>
              <select
                value={filters.booking_type}
                onChange={(e) => set({ booking_type: e.target.value as 'transfer' | 'experience' | 'all' })}
                className="w-full h-9 px-3 text-xs bg-sand-50 border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="transfer">Transfer</option>
                <option value="experience">Experiência</option>
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