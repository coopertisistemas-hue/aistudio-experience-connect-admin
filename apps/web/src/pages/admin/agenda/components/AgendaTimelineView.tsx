import type { AgendaItem, AgendaDriver } from '@/mocks/admin-agenda';

interface AgendaTimelineViewProps {
  items: AgendaItem[];
  onSelect: (item: AgendaItem) => void;
  selectedId?: string;
}

const START_HOUR = 5; // 05:00
const END_HOUR = 24; // midnight
const HOUR_WIDTH = 84; // px per hour
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_WIDTH = TOTAL_HOURS * HOUR_WIDTH;

const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  scheduled:       { bg: 'bg-stone-100',    border: 'border-stone-300',    text: 'text-navy-700',  dot: 'bg-stone-400' },
  driver_assigned: { bg: 'bg-navy-50',      border: 'border-navy-200',     text: 'text-navy-700',  dot: 'bg-navy-500' },
  in_progress:     { bg: 'bg-teal-50',      border: 'border-teal-300',     text: 'text-teal-800',  dot: 'bg-teal-500' },
  completed:       { bg: 'bg-sand-100',     border: 'border-sand-300',     text: 'text-navy-500',  dot: 'bg-sand-400' },
  delayed:         { bg: 'bg-amber-50',     border: 'border-amber-300',    text: 'text-amber-800', dot: 'bg-amber-500' },
  cancelled:       { bg: 'bg-red-50',       border: 'border-red-200',      text: 'text-red-500',   dot: 'bg-red-400' },
};

const statusLabel: Record<string, string> = {
  scheduled: 'Agendado',
  driver_assigned: 'Motorista Atribuído',
  in_progress: 'Em Andamento',
  completed: 'Finalizado',
  delayed: 'Atrasado',
  cancelled: 'Cancelado',
};

function getItemLeft(scheduledAt: string): number {
  const d = new Date(scheduledAt);
  const minutesFromStart = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, minutesFromStart * (HOUR_WIDTH / 60));
}

function getItemWidth(durationMin: number): number {
  return Math.max(60, durationMin * (HOUR_WIDTH / 60));
}

function getCurrentTimeLeft(): number | null {
  const now = new Date();
  const h = now.getHours();
  if (h < START_HOUR || h >= END_HOUR) return null;
  const min = (h - START_HOUR) * 60 + now.getMinutes();
  return min * (HOUR_WIDTH / 60);
}

interface DriverLaneProps {
  driver: AgendaDriver;
  items: AgendaItem[];
  onSelect: (item: AgendaItem) => void;
  selectedId?: string;
  nowLeft: number | null;
}

function DriverLane({ driver, items, onSelect, selectedId, nowLeft }: DriverLaneProps) {
  return (
    <div className="flex border-b border-sand-100 last:border-b-0 hover:bg-sand-50/30 transition-colors">
      {/* Driver info — fixed left column */}
      <div className="w-48 flex-shrink-0 border-r border-sand-200 px-3 py-3 flex items-start gap-2.5">
        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-navy-950 text-white text-xs font-bold flex-shrink-0">
          {driver.initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-navy-800 truncate">{driver.name}</p>
          <p className="text-[10px] text-navy-400 truncate mt-0.5">{driver.vehicle_type}</p>
          <span className="inline-block text-[9px] font-mono text-navy-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded mt-1">
            {driver.vehicle_plate}
          </span>
        </div>
      </div>

      {/* Timeline track */}
      <div className="flex-1 overflow-hidden">
        <div className="relative h-[68px]" style={{ width: TOTAL_WIDTH }}>
          {/* Hour grid lines */}
          {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-sand-100"
              style={{ left: i * HOUR_WIDTH }}
            />
          ))}

          {/* Current time indicator */}
          {nowLeft !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-teal-500/60 z-10"
              style={{ left: nowLeft }}
            />
          )}

          {/* Transfer blocks */}
          {items.map((item) => {
            const left = getItemLeft(item.scheduled_at);
            const width = getItemWidth(item.estimated_duration_min);
            const colors = statusColors[item.status] ?? statusColors.scheduled;
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                title={`${item.reference} · ${item.passenger_name} · ${item.pickup_location} → ${item.dropoff_location}`}
                style={{ left, width, top: 8, position: 'absolute' }}
                className={`h-[52px] rounded-xl border px-2.5 py-1.5 text-left transition-all cursor-pointer group
                  ${colors.bg} ${colors.border} ${isSelected ? 'ring-2 ring-teal-400 ring-offset-1' : ''}
                  hover:ring-2 hover:ring-teal-300 hover:ring-offset-1`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}></span>
                  <span className={`text-[10px] font-bold truncate ${colors.text}`}>{item.reference}</span>
                  {item.booking_type === 'experience' && (
                    <span className="text-[8px] bg-white/70 border border-sand-200 text-navy-500 px-1 rounded font-medium flex-shrink-0">EXP</span>
                  )}
                </div>
                <p className={`text-[10px] truncate ${colors.text} opacity-80`}>{item.pickup_location}</p>
                <p className={`text-[9px] truncate ${colors.text} opacity-60 mt-0.5`}>{item.passenger_count} pax · {item.estimated_duration_min}min</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UnassignedLane({ items, onSelect, selectedId, nowLeft }: Omit<DriverLaneProps, 'driver'>) {
  if (items.length === 0) return null;
  return (
    <div className="flex border-b border-sand-100 last:border-b-0 bg-amber-50/30">
      <div className="w-48 flex-shrink-0 border-r border-sand-200 px-3 py-3 flex items-start gap-2.5">
        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
          <i className="ri-user-unfollow-line text-amber-600 text-sm"></i>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-700">Não alocado</p>
          <p className="text-[10px] text-amber-500 mt-0.5">Sem motorista</p>
          <span className="inline-block text-[9px] text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded mt-1 font-medium">
            {items.length} transfer(s)
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="relative h-[68px]" style={{ width: TOTAL_WIDTH }}>
          {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
            <div key={i} className="absolute top-0 bottom-0 border-l border-sand-100" style={{ left: i * HOUR_WIDTH }} />
          ))}
          {nowLeft !== null && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-teal-500/60 z-10" style={{ left: nowLeft }} />
          )}
          {items.map((item) => {
            const left = getItemLeft(item.scheduled_at);
            const width = getItemWidth(item.estimated_duration_min);
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                title={`${item.reference} · ${item.passenger_name}`}
                style={{ left, width, top: 8, position: 'absolute' }}
                className={`h-[52px] rounded-xl border px-2.5 py-1.5 text-left transition-all cursor-pointer
                  bg-amber-50 border-amber-300
                  ${isSelected ? 'ring-2 ring-teal-400 ring-offset-1' : ''}
                  hover:ring-2 hover:ring-amber-400 hover:ring-offset-1`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <span className="text-[10px] font-bold truncate text-amber-800">{item.reference}</span>
                </div>
                <p className="text-[10px] truncate text-amber-700 opacity-80">{item.pickup_location}</p>
                <p className="text-[9px] truncate text-amber-600 opacity-60 mt-0.5">{item.passenger_count} pax</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AgendaTimelineView({ items, onSelect, selectedId }: AgendaTimelineViewProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
  const nowLeft = getCurrentTimeLeft();

  // Group by driver
  const driverMap = new Map<string, { driver: AgendaDriver; items: AgendaItem[] }>();
  const unassigned: AgendaItem[] = [];

  items.forEach((item) => {
    if (!item.driver) {
      unassigned.push(item);
    } else {
      if (!driverMap.has(item.driver.id)) {
        driverMap.set(item.driver.id, { driver: item.driver, items: [] });
      }
      driverMap.get(item.driver.id)!.items.push(item);
    }
  });

  if (items.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-calendar-schedule-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum agendamento encontrado</p>
        <p className="text-navy-400 text-xs mt-1">Não há transfers para este período ou filtro selecionado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        {/* Time axis header */}
        <div className="flex border-b border-sand-200 bg-sand-50/60 sticky top-0 z-10">
          <div className="w-48 flex-shrink-0 border-r border-sand-200 px-3 py-2.5">
            <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Motorista / Frota</p>
          </div>
          <div style={{ width: TOTAL_WIDTH }} className="relative flex-shrink-0">
            <div className="flex">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ width: HOUR_WIDTH }}
                  className="flex-shrink-0 border-r border-sand-100 px-2 py-2.5"
                >
                  <span className="text-[10px] font-semibold text-navy-400">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
            {/* Now indicator on header */}
            {nowLeft !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-teal-500 z-10"
                style={{ left: nowLeft }}
              >
                <div className="absolute -top-0.5 -left-[3px] w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Driver lanes */}
        <div>
          {[...driverMap.values()].map(({ driver, items: laneItems }) => (
            <DriverLane
              key={driver.id}
              driver={driver}
              items={laneItems}
              onSelect={onSelect}
              selectedId={selectedId}
              nowLeft={nowLeft}
            />
          ))}
          <UnassignedLane
            items={unassigned}
            onSelect={onSelect}
            selectedId={selectedId}
            nowLeft={nowLeft}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-sand-100 flex items-center gap-5 flex-wrap">
        {Object.entries(statusLabel).map(([key, label]) => {
          const c = statusColors[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
              <span className="text-[10px] text-navy-500">{label}</span>
            </div>
          );
        })}
        {nowLeft !== null && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-3 h-0.5 bg-teal-500/60 rounded-full"></span>
            <span className="text-[10px] text-teal-600 font-medium">Agora</span>
          </div>
        )}
      </div>
    </div>
  );
}