import { useState } from 'react';
import type { CheckinStatus } from '@/mocks/admin-checkins';

interface CheckinsFilterBarProps {
  total: number;
  filtered: number;
  onSearch: (v: string) => void;
  onStatusChange: (v: CheckinStatus | 'all') => void;
  activeStatus: CheckinStatus | 'all';
  onDriverChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPeriodChange: (v: string) => void;
  activeFiltersCount: number;
  onClear: () => void;
}

const statusPills: { label: string; value: CheckinStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Embarcado', value: 'boarded' },
  { label: 'Em Trânsito', value: 'in_transit' },
  { label: 'Finalizado', value: 'completed' },
  { label: 'Ausente', value: 'absent' },
  { label: 'Cancelado', value: 'cancelled' },
];

export default function CheckinsFilterBar({
  total,
  filtered,
  onSearch,
  onStatusChange,
  activeStatus,
  onDriverChange,
  onCategoryChange,
  onPeriodChange,
  activeFiltersCount,
  onClear,
}: CheckinsFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (v: string) => {
    setSearchVal(v);
    onSearch(v);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 space-y-3">
      {/* Row 1 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por reserva, passageiro ou rota..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer whitespace-nowrap ${
            expanded || activeFiltersCount > 0
              ? 'border-teal-300 bg-teal-50 text-teal-700'
              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <i className="ri-equalizer-2-line text-sm"></i>
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-500 text-white text-[9px] font-bold">
              {activeFiltersCount}
            </span>
          )}
          {expanded ? <i className="ri-arrow-up-s-line text-xs"></i> : <i className="ri-arrow-down-s-line text-xs"></i>}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line text-sm"></i>
            Limpar
          </button>
        )}

        <span className="text-stone-400 text-xs ml-auto whitespace-nowrap">
          Exibindo <span className="font-semibold text-stone-600">{filtered}</span> de{' '}
          <span className="font-semibold text-stone-600">{total}</span>
        </span>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {statusPills.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => onStatusChange(pill.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeStatus === pill.value
                ? 'bg-navy-950 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="pt-1 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Motorista
            </label>
            <select
              onChange={(e) => onDriverChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              <option value="">Todos os motoristas</option>
              <option value="João Silva">João Silva</option>
              <option value="Carlos Mendes">Carlos Mendes</option>
              <option value="Ana Ferreira">Ana Ferreira</option>
              <option value="Pedro Rocha">Pedro Rocha</option>
              <option value="Marcus Vinicius">Marcus Vinicius</option>
              <option value="Roberta Vasconcelos">Roberta Vasconcelos</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              <option value="">Todas as categorias</option>
              <option value="airport">Aeroporto</option>
              <option value="hotel">Hotel</option>
              <option value="tourism">Turismo</option>
              <option value="corporate">Corporativo</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Período
            </label>
            <select
              onChange={(e) => onPeriodChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              <option value="">Hoje</option>
              <option value="tomorrow">Amanhã</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}