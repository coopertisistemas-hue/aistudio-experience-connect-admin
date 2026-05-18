import type { AgendaItem } from '@/mocks/admin-agenda';

interface AgendaGridViewProps {
  items: AgendaItem[];
  onSelect: (item: AgendaItem) => void;
  selectedId?: string;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  scheduled:       { label: 'Agendado',            dot: 'bg-stone-400',  badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  driver_assigned: { label: 'Motorista Atribuído', dot: 'bg-navy-500',   badge: 'bg-navy-50 text-navy-600 border-navy-200' },
  in_progress:     { label: 'Em Andamento',        dot: 'bg-teal-500',   badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  completed:       { label: 'Finalizado',          dot: 'bg-sand-400',   badge: 'bg-sand-100 text-navy-500 border-sand-200' },
  delayed:         { label: 'Atrasado',            dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled:       { label: 'Cancelado',           dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600 border-red-200' },
};

interface TimeSlot {
  label: string;
  from: number;
  to: number;
}

const timeSlots: TimeSlot[] = [
  { label: 'Madrugada', from: 0, to: 6 },
  { label: 'Manhã', from: 6, to: 12 },
  { label: 'Tarde', from: 12, to: 18 },
  { label: 'Noite', from: 18, to: 24 },
];

function AgendaCard({ item, onSelect, isSelected }: { item: AgendaItem; onSelect: (i: AgendaItem) => void; isSelected: boolean }) {
  const s = statusConfig[item.status] ?? statusConfig.scheduled;
  const dt = new Date(item.scheduled_at);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`w-full text-left bg-white border rounded-xl p-4 transition-all cursor-pointer hover:border-sand-300 hover:shadow-sm group
        ${isSelected ? 'border-teal-300 ring-2 ring-teal-100' : 'border-sand-200'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}></span>
            <p className="text-xs font-bold text-navy-800 font-mono">{item.reference}</p>
            {item.booking_type === 'experience' && (
              <span className="text-[9px] font-bold bg-navy-50 border border-navy-200 text-navy-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                Exp
              </span>
            )}
          </div>
          <p className="text-[10px] text-navy-400">
            {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {item.estimated_duration_min}min
          </p>
        </div>
        <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${s.badge}`}>
          {s.label}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center rounded bg-teal-100 flex-shrink-0">
            <i className="ri-map-pin-2-line text-teal-600 text-[9px]"></i>
          </div>
          <p className="text-xs text-navy-700 truncate">{item.pickup_location}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center rounded bg-navy-100 flex-shrink-0">
            <i className="ri-flag-line text-navy-600 text-[9px]"></i>
          </div>
          <p className="text-xs text-navy-600 truncate">{item.dropoff_location}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-sand-100">
        <div className="flex items-center gap-1.5">
          {item.driver ? (
            <>
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 text-white text-[8px] font-bold flex-shrink-0">
                {item.driver.initials}
              </div>
              <p className="text-[10px] text-navy-600 font-medium truncate">{item.driver.name}</p>
            </>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <i className="ri-user-unfollow-line text-xs"></i>
              <p className="text-[10px] font-medium">Não alocado</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-navy-400">
          <i className="ri-group-line text-[10px]"></i>
          <span className="text-[10px]">{item.passenger_count}</span>
        </div>
      </div>
    </button>
  );
}

export default function AgendaGridView({ items, onSelect, selectedId }: AgendaGridViewProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-calendar-schedule-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum agendamento</p>
        <p className="text-navy-400 text-xs mt-1">Não há transfers para este período.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeSlots.map((slot) => {
        const slotItems = items.filter((i) => {
          const h = new Date(i.scheduled_at).getHours();
          return h >= slot.from && h < slot.to;
        });
        if (slotItems.length === 0) return null;

        return (
          <div key={slot.label}>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[11px] font-bold text-navy-400 uppercase tracking-widest">{slot.label}</p>
              <div className="flex-1 h-px bg-sand-200"></div>
              <span className="text-[10px] text-navy-400 font-medium">{slotItems.length} transfer(s)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {slotItems.sort((a, b) =>
                new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
              ).map((item) => (
                <AgendaCard
                  key={item.id}
                  item={item}
                  onSelect={onSelect}
                  isSelected={item.id === selectedId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}