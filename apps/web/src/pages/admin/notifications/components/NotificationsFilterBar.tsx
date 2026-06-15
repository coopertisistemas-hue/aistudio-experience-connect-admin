import { useState } from 'react';

const ALL_CATEGORIES = ['Reservas', 'Pagamentos', 'Transfers', 'Motoristas', 'Veículos', 'Sistema'];
const SEVERITY_LABELS: Record<string, string> = { critical: 'Crítico', warning: 'Atenção', success: 'Sucesso', info: 'Informativo' };

export interface NotificationsFilters {
  search: string;
  category: string;
  severity: string | '';
  readState: 'all' | 'unread' | 'read';
  period: 'all' | 'today' | 'yesterday' | 'week';
}

interface NotificationsFilterBarProps {
  filters: NotificationsFilters;
  onChange: (f: NotificationsFilters) => void;
  totalResults: number;
  onMarkAllRead: () => void;
}

const SEVERITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'critical', label: 'Crítica' },
  { value: 'warning', label: 'Atenção' },
  { value: 'info', label: 'Informativa' },
  { value: 'success', label: 'Sucesso' },
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'week', label: 'Esta semana' },
];

const READ_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
  { value: 'read', label: 'Lidas' },
];

function activeCount(f: NotificationsFilters): number {
  let n = 0;
  if (f.search) n++;
  if (f.category) n++;
  if (f.severity) n++;
  if (f.readState !== 'all') n++;
  if (f.period !== 'all') n++;
  return n;
}

export default function NotificationsFilterBar({
  filters,
  onChange,
  totalResults,
  onMarkAllRead,
}: NotificationsFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const count = activeCount(filters);

  const set = (patch: Partial<NotificationsFilters>) => onChange({ ...filters, ...patch });

  const clear = () =>
    onChange({ search: '', category: '', severity: '', readState: 'all', period: 'all' });

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-5">
      {/* Main bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-stone-400 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Buscar notificações…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full h-8 pl-8 pr-3 text-xs bg-stone-50 border border-stone-200 rounded-xl text-navy-700 placeholder-stone-400 focus:outline-none focus:border-teal-400/60 focus:bg-white transition-all"
          />
        </div>

        {/* Read state pills */}
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-xl p-0.5">
          {READ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ readState: opt.value as NotificationsFilters['readState'] })}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filters.readState === opt.value
                  ? 'bg-white text-navy-800 border border-stone-200'
                  : 'text-stone-500 hover:text-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Period pills */}
        <div className="hidden md:flex items-center gap-0.5 bg-stone-100 rounded-xl p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ period: opt.value as NotificationsFilters['period'] })}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filters.period === opt.value
                  ? 'bg-white text-navy-800 border border-stone-200'
                  : 'text-stone-500 hover:text-navy-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
            expanded || count > 0
              ? 'bg-navy-50 border-navy-100 text-navy-700'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-navy-700'
          }`}
        >
          <i className="ri-filter-3-line text-sm"></i>
          Filtros
          {count > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold">
              {count}
            </span>
          )}
        </button>

        {/* Mark all read */}
        <button
          type="button"
          onClick={onMarkAllRead}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-check-double-line text-sm"></i>
          Marcar todas lidas
        </button>

        {/* Results count */}
        <span className="text-[11px] text-stone-400 whitespace-nowrap ml-auto">
          {totalResults} resultado{totalResults !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Expanded advanced filters */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 flex flex-wrap gap-4 bg-stone-50/60">
          {/* Category */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => set({ category: e.target.value })}
              className="w-full h-8 text-xs bg-white border border-stone-200 rounded-xl px-2.5 text-navy-700 focus:outline-none focus:border-teal-400/60 cursor-pointer"
            >
              <option value="">Todas as categorias</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Severidade
            </label>
            <select
              value={filters.severity}
              onChange={(e) => set({ severity: e.target.value as string })}
              className="w-full h-8 text-xs bg-white border border-stone-200 rounded-xl px-2.5 text-navy-700 focus:outline-none focus:border-teal-400/60 cursor-pointer"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value ? SEVERITY_LABELS[opt.value] : 'Todas as severidades'}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile period */}
          <div className="flex md:hidden flex-1 min-w-[180px]">
            <div className="w-full">
              <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Período
              </label>
              <select
                value={filters.period}
                onChange={(e) => set({ period: e.target.value as NotificationsFilters['period'] })}
                className="w-full h-8 text-xs bg-white border border-stone-200 rounded-xl px-2.5 text-navy-700 focus:outline-none focus:border-teal-400/60 cursor-pointer"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear button */}
          {count > 0 && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-500 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-sm"></i>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}