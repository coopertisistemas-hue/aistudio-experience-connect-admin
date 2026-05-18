import { useState } from 'react';
import type { RouteStatus, RouteCategory } from '@/mocks/admin-routes';

export interface RoutesFilters {
  search: string;
  status: RouteStatus | 'all';
  category: RouteCategory | 'all';
  demand: 'all' | 'low' | 'medium' | 'high' | 'peak';
  priceMin: string;
  priceMax: string;
}

interface RoutesFilterBarProps {
  filters: RoutesFilters;
  onChange: (f: RoutesFilters) => void;
  total: number;
  filtered: number;
}

const statusPills: { label: string; value: RouteStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativa', value: 'active' },
  { label: 'Alta Demanda', value: 'high_demand' },
  { label: 'Atenção', value: 'attention' },
  { label: 'Pausada', value: 'paused' },
  { label: 'Inativa', value: 'inactive' },
];

const categoryOptions: { label: string; value: RouteCategory | 'all' }[] = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Aeroporto', value: 'airport' },
  { label: 'Turismo', value: 'tourism' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Corporativo', value: 'corporate' },
  { label: 'Transfer', value: 'transfer' },
];

const demandOptions: { label: string; value: RoutesFilters['demand'] }[] = [
  { label: 'Qualquer demanda', value: 'all' },
  { label: 'Baixa', value: 'low' },
  { label: 'Média', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Pico', value: 'peak' },
];

export default function RoutesFilterBar({ filters, onChange, total, filtered }: RoutesFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    filters.category !== 'all',
    filters.demand !== 'all',
    !!filters.priceMin,
    !!filters.priceMax,
  ].filter(Boolean).length;

  const clear = () =>
    onChange({ search: '', status: 'all', category: 'all', demand: 'all', priceMin: '', priceMax: '' });

  return (
    <div className="space-y-3 mb-5">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-navy-300 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, origem, destino..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
          />
        </div>
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
              <>{total} rotas</>
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
        <div className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => onChange({ ...filters, category: e.target.value as RouteCategory | 'all' })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Demanda
            </label>
            <select
              value={filters.demand}
              onChange={(e) => onChange({ ...filters, demand: e.target.value as RoutesFilters['demand'] })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
            >
              {demandOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Preço Mínimo
            </label>
            <input
              type="number"
              placeholder="R$ 0"
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
              Preço Máximo
            </label>
            <input
              type="number"
              placeholder="R$ 9999"
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
              className="w-full h-9 px-3 text-sm bg-white border border-sand-200 rounded-lg text-navy-700 focus:outline-none focus:border-teal-300 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}