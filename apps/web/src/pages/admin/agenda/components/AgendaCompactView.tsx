import type { AgendaItem } from '@/mocks/admin-agenda';

interface AgendaCompactViewProps {
  items: AgendaItem[];
  onSelect: (item: AgendaItem) => void;
  selectedId?: string;
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  scheduled:       { label: 'Agendado',            dot: 'bg-stone-400',  text: 'text-stone-600' },
  driver_assigned: { label: 'Motorista Atribuído', dot: 'bg-navy-500',   text: 'text-navy-600' },
  in_progress:     { label: 'Em Andamento',        dot: 'bg-teal-500',   text: 'text-teal-700' },
  completed:       { label: 'Finalizado',          dot: 'bg-sand-400',   text: 'text-navy-400' },
  delayed:         { label: 'Atrasado',            dot: 'bg-amber-500',  text: 'text-amber-700' },
  cancelled:       { label: 'Cancelado',           dot: 'bg-red-400',    text: 'text-red-500' },
};

export default function AgendaCompactView({ items, onSelect, selectedId }: AgendaCompactViewProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-calendar-schedule-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum agendamento</p>
        <p className="text-navy-400 text-xs mt-1">Agenda limpa para este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[80px_1fr_1fr_160px_120px_80px_80px] gap-4 px-5 py-3 border-b border-sand-200 bg-sand-50/60">
        {['Hora', 'Referência / Passageiro', 'Rota', 'Motorista', 'Status', 'Pax', ''].map((h) => (
          <p key={h} className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div>
        {sorted.map((item) => {
          const s = statusConfig[item.status] ?? statusConfig.scheduled;
          const dt = new Date(item.scheduled_at);
          const isSelected = item.id === selectedId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full text-left transition-all cursor-pointer border-b border-sand-100 last:border-b-0
                ${isSelected ? 'bg-teal-50/60' : 'hover:bg-sand-50'}`}
            >
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-[80px_1fr_1fr_160px_120px_80px_80px] gap-4 px-5 py-3.5 items-center">
                {/* Time */}
                <div>
                  <p className="text-sm font-bold text-navy-800">
                    {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-navy-400">{item.estimated_duration_min}min</p>
                </div>

                {/* Reference */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-bold text-navy-800 font-mono">{item.reference}</p>
                    {item.booking_type === 'experience' && (
                      <span className="text-[8px] font-bold bg-navy-50 border border-navy-200 text-navy-500 px-1 py-0.5 rounded uppercase">Exp</span>
                    )}
                  </div>
                  <p className="text-[11px] text-navy-500 truncate">{item.passenger_name}</p>
                </div>

                {/* Route */}
                <div className="min-w-0">
                  <p className="text-xs text-navy-700 truncate">{item.pickup_location}</p>
                  <p className="text-[10px] text-navy-400 truncate mt-0.5">→ {item.dropoff_location}</p>
                </div>

                {/* Driver */}
                <div>
                  {item.driver ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950 text-white text-[9px] font-bold flex-shrink-0">
                        {item.driver.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-navy-700 truncate">{item.driver.name}</p>
                        <p className="text-[9px] font-mono text-navy-400 truncate">{item.driver.vehicle_plate}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                      <i className="ri-user-unfollow-line text-xs"></i>
                      Não alocado
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot} ${item.status === 'in_progress' ? 'animate-pulse' : ''}`}></span>
                  <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
                </div>

                {/* Pax */}
                <div className="flex items-center gap-1 text-navy-500">
                  <i className="ri-group-line text-xs"></i>
                  <span className="text-xs font-medium">{item.passenger_count}</span>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <i className="ri-arrow-right-s-line text-navy-300 text-base group-hover:text-navy-500 transition-colors"></i>
                </div>
              </div>

              {/* Mobile row */}
              <div className="md:hidden px-4 py-3.5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      <p className="text-xs font-bold text-navy-800 font-mono">{item.reference}</p>
                      <p className="text-xs font-bold text-navy-800">
                        {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-[11px] text-navy-500">{item.passenger_name} · {item.passenger_count} pax</p>
                  </div>
                  <span className={`text-[9px] font-semibold whitespace-nowrap ${s.text}`}>{s.label}</span>
                </div>
                <p className="text-xs text-navy-600 truncate">{item.pickup_location} → {item.dropoff_location}</p>
                {item.driver && (
                  <p className="text-[10px] text-navy-400 mt-1">{item.driver.name} · {item.driver.vehicle_plate}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}