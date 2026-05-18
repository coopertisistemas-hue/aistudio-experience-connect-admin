import { useState, useEffect } from 'react';
import { mockAgendaItems, mockConflicts, type AgendaItem, type AgendaStatus } from '@/mocks/admin-agenda';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import AgendaSummaryStrip from './components/AgendaSummaryStrip';
import AgendaFilterBar, { type AgendaFilters } from './components/AgendaFilterBar';
import AgendaConflictAlerts from './components/AgendaConflictAlerts';
import AgendaTimelineView from './components/AgendaTimelineView';
import AgendaGridView from './components/AgendaGridView';
import AgendaCompactView from './components/AgendaCompactView';
import AgendaMapPlaceholder from './components/AgendaMapPlaceholder';
import AgendaTransferDrawer from './components/AgendaTransferDrawer';

type ViewMode = 'timeline' | 'grid' | 'compact';

const VIEW_LABELS: Record<ViewMode, { label: string; icon: string }> = {
  timeline: { label: 'Timeline', icon: 'ri-time-line' },
  grid: { label: 'Grade', icon: 'ri-layout-grid-line' },
  compact: { label: 'Compacto', icon: 'ri-list-unordered' },
};

const defaultFilters: AgendaFilters = {
  search: '',
  status: 'all',
  driver_id: 'all',
  vehicle_type: 'all',
  booking_type: 'all',
};

function formatDateHeader(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, tomorrow)) return 'Amanhã';
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-05-17'));
  const [view, setView] = useState<ViewMode>('timeline');
  const [filters, setFilters] = useState<AgendaFilters>(defaultFilters);
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const goToToday = () => setCurrentDate(new Date('2026-05-17'));
  const goToPrev = () => setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; });
  const goToNext = () => setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; });

  const dayItems = mockAgendaItems.filter((item) =>
    isSameDay(new Date(item.scheduled_at), currentDate)
  );

  const filtered = dayItems.filter((item) => {
    if (filters.status !== 'all' && item.status !== (filters.status as AgendaStatus)) return false;
    if (filters.driver_id !== 'all' && item.driver?.id !== filters.driver_id) return false;
    if (filters.vehicle_type !== 'all' && item.driver?.vehicle_type !== filters.vehicle_type) return false;
    if (filters.booking_type !== 'all' && item.booking_type !== filters.booking_type) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        item.reference.toLowerCase().includes(q) ||
        item.passenger_name.toLowerCase().includes(q) ||
        item.pickup_location.toLowerCase().includes(q) ||
        item.dropoff_location.toLowerCase().includes(q) ||
        (item.driver?.name.toLowerCase().includes(q) ?? false) ||
        (item.route_name?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const handleConflictItemClick = (id: string) => {
    const found = mockAgendaItems.find((i) => i.id === id);
    if (found) setSelectedItem(found);
  };

  const isToday = isSameDay(currentDate, new Date('2026-05-17'));

  return (
    <div className="p-6 max-w-[1600px]">
      <PageHeader
        icon="ri-calendar-schedule-line"
        title="Agenda Operacional"
        subtitle="Centro de coordenação e controle de transfers, motoristas e frota."
        badge={`${dayItems.length} agendamentos`}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className={`h-10 flex items-center gap-2 px-4 text-sm font-medium rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                showMap
                  ? 'bg-navy-950 text-white border-navy-950'
                  : 'bg-white border-sand-200 text-navy-600 hover:border-sand-300'
              }`}
            >
              <i className="ri-map-2-line text-sm"></i>
              <span className="hidden sm:inline">Mapa</span>
            </button>

            <button
              type="button"
              className="h-10 flex items-center gap-2 px-4 bg-white border border-sand-200 hover:border-sand-300 text-navy-600 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        }
      />

      {/* Date navigation + view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Date nav */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrev}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-sand-200 text-navy-600 hover:border-sand-300 hover:text-navy-800 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-base"></i>
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-sand-200 rounded-xl min-w-[200px] justify-center">
            <i className="ri-calendar-event-line text-teal-600 text-sm"></i>
            <div className="text-center">
              <p className="text-sm font-bold text-navy-800">{formatDateHeader(currentDate)}</p>
              <p className="text-[10px] text-navy-400">
                {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-sand-200 text-navy-600 hover:border-sand-300 hover:text-navy-800 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-right-s-line text-base"></i>
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={goToToday}
              className="h-9 flex items-center gap-1.5 px-3 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-focus-3-line text-sm"></i>
              Hoje
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1 gap-0.5">
          {(Object.entries(VIEW_LABELS) as [ViewMode, { label: string; icon: string }][]).map(([key, v]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                view === key
                  ? 'bg-white text-navy-800 shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:text-navy-700'
              }`}
            >
              <i className={`${v.icon} text-sm`}></i>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary strip */}
      <AgendaSummaryStrip items={dayItems} allConflicts={mockConflicts} />

      {/* Conflict alerts (only for today) */}
      {isToday && (
        <AgendaConflictAlerts
          conflicts={mockConflicts}
          onItemClick={handleConflictItemClick}
        />
      )}

      {/* Map placeholder */}
      {showMap && (
        <AgendaMapPlaceholder
          items={dayItems}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Filter bar */}
      <AgendaFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={dayItems.length}
        filteredCount={filtered.length}
      />

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-sand-200 rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-navy-500">Carregando agenda...</p>
        </div>
      )}

      {/* Content views */}
      {!loading && (
        <>
          {view === 'timeline' && (
            <AgendaTimelineView
              items={filtered}
              onSelect={setSelectedItem}
              selectedId={selectedItem?.id}
            />
          )}
          {view === 'grid' && (
            <AgendaGridView
              items={filtered}
              onSelect={setSelectedItem}
              selectedId={selectedItem?.id}
            />
          )}
          {view === 'compact' && (
            <AgendaCompactView
              items={filtered}
              onSelect={setSelectedItem}
              selectedId={selectedItem?.id}
            />
          )}
        </>
      )}

      {/* Empty state — no items for this date */}
      {!loading && dayItems.length === 0 && (
        <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-20 mt-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-5">
            <i className="ri-calendar-schedule-line text-navy-300 text-3xl"></i>
          </div>
          <p className="text-navy-700 font-semibold text-base">Agenda vazia</p>
          <p className="text-navy-400 text-sm mt-1.5 max-w-xs text-center">
            Não há transfers ou experiências agendados para{' '}
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.
          </p>
          <button
            type="button"
            onClick={goToToday}
            className="mt-5 h-9 flex items-center gap-2 px-4 bg-navy-950 text-white text-xs font-semibold rounded-xl hover:bg-navy-900 transition-colors cursor-pointer"
          >
            <i className="ri-focus-3-line text-sm"></i>
            Voltar a Hoje
          </button>
        </div>
      )}

      {/* Transfer detail drawer */}
      {selectedItem && (
        <AgendaTransferDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}