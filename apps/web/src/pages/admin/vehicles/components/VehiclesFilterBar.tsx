import { useState } from 'react';

type VehicleStatus = 'available' | 'in_operation' | 'reserved' | 'attention' | 'maintenance' | 'inactive';
type VehicleType = 'van' | 'sprinter' | 'sedan' | 'suv' | 'bus';

export interface VehiclesFilters {
  search: string;
  status: VehicleStatus | 'all';
  type: VehicleType | 'all';
  hasDriver: 'all' | 'yes' | 'no';
  maintenance: 'all' | 'ok' | 'due_soon' | 'overdue' | 'in_maintenance';
}

interface VehiclesFilterBarProps {
  filters: VehiclesFilters;
  onChange: (f: VehiclesFilters) => void;
  total: number;
  filtered: number;
}

const statusPills: { label: string; value: VehicleStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Disponível', value: 'available' },
  { label: 'Em Operação', value: 'in_operation' },
  { label: 'Reservado', value: 'reserved' },
  { label: 'Atenção', value: 'attention' },
  { label: 'Manutenção', value: 'maintenance' },
  { label: 'Inativo', value: 'inactive' },
];

const typeOptions: { label: string; value: VehicleType | 'all' }[] = [
  { label: 'Todos os tipos', value: 'all' },
  { label: 'Van', value: 'van' },
  { label: 'Sprinter', value: 'sprinter' },
  { label: 'Sedã', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Ônibus', value: 'bus' },
];

const driverOptions: { label: string; value: VehiclesFilters['hasDriver'] }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Com motorista', value: 'yes' },
  { label: 'Sem motorista', value: 'no' },
];

const maintOptions: { label: string; value: VehiclesFilters['maintenance'] }[] = [
  { label: 'Qualquer status', value: 'all' },
  { label: 'OK', value: 'ok' },
  { label: 'Revisão próxima', value: 'due_soon' },
  { label: 'Atrasada', value: 'overdue' },
  { label: 'Em manutenção', value: 'in_maintenance' },
];

export default function VehiclesFilterBar({ filters, onChange, total, filtered }: VehiclesFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    filters.type !== 'all',
    filters.hasDriver !== 'all',
    filters.maintenance !== 'all',
  ].filter(Boolean).length;

  const clear = () =>
    onChange({ search: '', status: 'all', type: 'all', hasDriver: 'all', maintenance: 'all' });

  return (
    <div className="space-y-3 mb-5">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-navy-300 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, placa, modelo..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className={`flex items-center gap-2 h-10 px-3.5 rounded-xl text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
              expanded || activeCount > 0
                ? 'bg-navy-950 text-white border-navy-950'
                : 'bg-white border-sand-200 text-navy-600 hover:border-sand-300'
            }`}
          >
            <i className="ri-equalizer-2-line text-sm"></i>
            Filtros
            {activeCount > 0 && (
              <span className="bg-teal-400 text-navy-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {(filters.search || filters.status !== 'all' || activeCount > 0) && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-medium border border-sand-200 bg-white text-navy-500 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line text-sm"></i>
              Limpar
            </button>
          )}

          <span className="text-[11px] text-navy-400 whitespace-nowrap ml-1">
            {filtered === total ? (
              <>{total} veículos</>
            ) : (
              <><span className="font-semibold text-navy-700">{filtered}</span> de {total}</>
            )}
          </span>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
        {statusPills.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ ...filters, status: p.value })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
              filters.status === p.value
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-sand-200 text-navy-500 hover:border-sand-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Tipo de Veículo
            </label>
            <select
              value={filters.type}
              onChange={(e) => onChange({ ...filters, type: e.target.value as VehicleType | 'all' })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Motorista
            </label>
            <select
              value={filters.hasDriver}
              onChange={(e) => onChange({ ...filters, hasDriver: e.target.value as VehiclesFilters['hasDriver'] })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
            >
              {driverOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Status de Manutenção
            </label>
            <select
              value={filters.maintenance}
              onChange={(e) => onChange({ ...filters, maintenance: e.target.value as VehiclesFilters['maintenance'] })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
            >
              {maintOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}