import { useState } from 'react';

export type AvailView = 'all' | 'drivers' | 'vehicles';
export type ShiftFilter = 'all' | 'morning' | 'afternoon' | 'evening';
export type StatusFilter = 'all' | 'available' | 'reserved' | 'blocked' | 'maintenance' | 'off';

interface AvailabilityFilterBarProps {
  view: AvailView;
  onViewChange: (v: AvailView) => void;
  shift: ShiftFilter;
  onShiftChange: (s: ShiftFilter) => void;
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onClear: () => void;
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

const viewOptions: { id: AvailView; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'ri-layout-grid-line' },
  { id: 'drivers', label: 'Motoristas', icon: 'ri-steering-2-line' },
  { id: 'vehicles', label: 'Veículos', icon: 'ri-taxi-line' },
];

const shiftOptions: { id: ShiftFilter; label: string; time: string }[] = [
  { id: 'all', label: 'Todos os turnos', time: '' },
  { id: 'morning', label: 'Manhã', time: '06–12h' },
  { id: 'afternoon', label: 'Tarde', time: '12–18h' },
  { id: 'evening', label: 'Noite', time: '18–23h' },
];

const statusOptions: { id: StatusFilter; label: string; dot: string }[] = [
  { id: 'all', label: 'Todos status', dot: 'bg-stone-400' },
  { id: 'available', label: 'Disponível', dot: 'bg-teal-500' },
  { id: 'reserved', label: 'Reservado', dot: 'bg-sky-500' },
  { id: 'blocked', label: 'Bloqueado', dot: 'bg-red-400' },
  { id: 'maintenance', label: 'Manutenção', dot: 'bg-amber-500' },
  { id: 'off', label: 'Folga', dot: 'bg-stone-400' },
];

export default function AvailabilityFilterBar({
  view, onViewChange, shift, onShiftChange, status, onStatusChange,
  search, onSearchChange, onClear, weekLabel, onPrevWeek, onNextWeek, onToday,
}: AvailabilityFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = [
    shift !== 'all' ? 1 : 0,
    status !== 'all' ? 1 : 0,
    search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Week navigation */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl overflow-hidden flex-shrink-0">
          <button
            type="button"
            onClick={onPrevWeek}
            className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-stone-600 text-sm"></i>
          </button>
          <span className="px-3 text-xs font-semibold text-stone-800 whitespace-nowrap">{weekLabel}</span>
          <button
            type="button"
            onClick={onNextWeek}
            className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-right-s-line text-stone-600 text-sm"></i>
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          Hoje
        </button>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-xl p-1">
          {viewOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onViewChange(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                view === opt.id
                  ? 'bg-white text-stone-900 border border-stone-200'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <i className={`${opt.icon} text-xs`}></i>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 py-2">
          <i className="ri-search-line text-stone-400 text-sm flex-shrink-0"></i>
          <input
            type="text"
            placeholder="Buscar motorista ou veículo…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none text-stone-800 placeholder-stone-400 min-w-0"
          />
          {search && (
            <button type="button" onClick={() => onSearchChange('')} className="flex-shrink-0 cursor-pointer">
              <i className="ri-close-line text-stone-400 text-sm"></i>
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            showFilters || activeCount > 0
              ? 'bg-teal-50 border-teal-200 text-teal-700'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <i className="ri-equalizer-3-line text-sm"></i>
          Filtros
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-stone-500 hover:text-stone-700 cursor-pointer whitespace-nowrap underline"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Turno</label>
            <div className="flex gap-1.5 flex-wrap">
              {shiftOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onShiftChange(opt.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    shift === opt.id
                      ? 'bg-teal-500/[0.10] border-teal-300/60 text-teal-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                  {opt.time && <span className="text-[10px] text-stone-400">{opt.time}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-8 bg-stone-200 hidden sm:block flex-shrink-0"></div>
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</label>
            <div className="flex gap-1.5 flex-wrap">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusChange(opt.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    status === opt.id
                      ? 'bg-teal-500/[0.10] border-teal-300/60 text-teal-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.dot}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}