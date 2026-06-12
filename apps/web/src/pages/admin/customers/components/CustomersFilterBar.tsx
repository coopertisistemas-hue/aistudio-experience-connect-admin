import { useState } from 'react';

interface CustomersFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  recurrence: 'all' | 'recurring' | 'new';
  onRecurrenceChange: (v: 'all' | 'recurring' | 'new') => void;
  total: number;
  filtered: number;
  onClear: () => void;
}

const statusPills: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativo' },
  { key: 'vip', label: 'VIP' },
  { key: 'inactive', label: 'Inativo' },
];

export default function CustomersFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  recurrence,
  onRecurrenceChange,
  total,
  filtered,
  onClear,
}: CustomersFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    status !== 'all' ? 1 : 0,
    recurrence !== 'all' ? 1 : 0,
    search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasFilters = activeCount > 0;

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Main bar */}
      <div className="flex items-center gap-3 p-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-stone-400 text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente, e-mail, telefone…"
            className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
          />
          {search && (
            <button type="button" onClick={() => onSearchChange('')} className="w-4 h-4 flex items-center justify-center cursor-pointer">
              <i className="ri-close-line text-stone-400 text-sm"></i>
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusPills.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onStatusChange(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer
                ${status === p.key
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer
            ${expanded ? 'bg-stone-200 border-stone-300 text-stone-700' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}
        >
          <i className="ri-equalizer-line text-sm"></i>
          Filtros
          {activeCount > 0 && (
            <span className="bg-teal-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
            Limpar
          </button>
        )}
      </div>

      {/* Advanced panel */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 bg-stone-50/60 flex flex-wrap gap-4">
          {/* Recorrência */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Recorrência</span>
            <div className="flex items-center gap-1.5">
              {([['all', 'Todos'], ['recurring', 'Recorrentes'], ['new', 'Novos']] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onRecurrenceChange(k)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap cursor-pointer
                    ${recurrence === k
                      ? 'bg-navy-800 bg-[#1e3a4f] text-white border-[#1e3a4f]'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result count */}
      {hasFilters && (
        <div className="border-t border-stone-100 px-4 py-2 bg-stone-50/40 flex items-center gap-2">
          <i className="ri-filter-3-line text-stone-400 text-xs"></i>
          <span className="text-[11px] text-stone-500">
            Exibindo <span className="font-semibold text-stone-700">{filtered}</span> de{' '}
            <span className="font-semibold text-stone-700">{total}</span> clientes
          </span>
        </div>
      )}
    </div>
  );
}
