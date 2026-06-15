import type { TransferItem } from '@/services/transfers';

interface Props {
  transfers: TransferItem[];
  onSelect: (t: TransferItem) => void;
  selectedId?: string;
  loading?: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  confirmed:       { label: 'Confirmado',          dot: 'bg-teal-400',   badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  in_progress:     { label: 'Em Andamento',        dot: 'bg-teal-500',   badge: 'bg-teal-50 text-teal-800 border-teal-300' },
  completed:       { label: 'Finalizado',          dot: 'bg-sand-400',   badge: 'bg-sand-100 text-navy-500 border-sand-200' },
  cancelled:       { label: 'Cancelado',           dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600 border-red-200' },
  no_show:         { label: 'No Show',             dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-300' },
  refunded:        { label: 'Reembolsado',         dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-600 border-purple-200' },
  draft:           { label: 'Rascunho',            dot: 'bg-stone-400',  badge: 'bg-stone-100 text-stone-600 border-stone-200' },
};

function OccupancyBar({ current, max }: { current: number; max: number }) {
  if (max === 0) return <span className="text-[10px] text-navy-400 italic">—</span>;
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-sand-200 rounded-full overflow-hidden" style={{ minWidth: 40 }}>
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="text-[10px] text-navy-500 whitespace-nowrap font-medium">{current}/{max}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-sand-100 animate-pulse">
      <div className="w-20 h-4 bg-sand-200 rounded-lg"></div>
      <div className="flex-1 h-4 bg-sand-200 rounded-lg"></div>
      <div className="w-24 h-4 bg-sand-200 rounded-lg"></div>
      <div className="w-24 h-4 bg-sand-200 rounded-lg"></div>
      <div className="w-16 h-4 bg-sand-200 rounded-lg"></div>
    </div>
  );
}

export default function TransfersOperationalList({
  transfers,
  onSelect,
  selectedId,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-car-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum transfer encontrado</p>
        <p className="text-navy-400 text-xs mt-1">Ajuste os filtros ou crie um novo transfer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Desktop table header */}
      <div className="hidden lg:grid grid-cols-[90px_160px_1fr_140px_140px_90px_100px_32px] gap-3 px-5 py-3 border-b border-sand-200 bg-sand-50/60">
        {['Código', 'Horário', 'Rota', 'Motorista', 'Veículo', 'Pax', 'Status', ''].map((h) => (
          <p key={h} className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {/* Rows */}
      {transfers.map((t) => {
        const s = statusConfig[t.status] ?? statusConfig.scheduled;
        const dt = new Date(t.scheduled_at);
        const isSelected = t.id === selectedId;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            className={`w-full text-left border-b border-sand-100 last:border-b-0 transition-all cursor-pointer group
              ${isSelected ? 'bg-teal-50/60' : 'hover:bg-sand-50/60'}`}
          >
            {/* Desktop row */}
            <div className="hidden lg:grid grid-cols-[90px_160px_1fr_140px_140px_90px_100px_32px] gap-3 px-5 py-4 items-center">
              {/* Code */}
              <div>
                <p className="text-xs font-bold text-navy-800 font-mono">{t.reference}</p>
                {t.booking_reference && (
                  <p className="text-[9px] text-navy-400 mt-0.5 font-mono">{t.booking_reference}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <p className="text-sm font-bold text-navy-800">
                  {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] text-navy-400">
                  {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} · {t.duration_min}min
                </p>
              </div>

              {/* Route */}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-navy-800 truncate">{t.route_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <i className="ri-map-pin-2-line text-teal-500 text-[9px] flex-shrink-0"></i>
                  <p className="text-[10px] text-navy-500 truncate">{t.origin}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <i className="ri-flag-line text-navy-400 text-[9px] flex-shrink-0"></i>
                  <p className="text-[10px] text-navy-400 truncate">{t.destination}</p>
                </div>
              </div>

              {/* Driver */}
              <div>
                {t.driver_name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950 text-white text-[9px] font-bold flex-shrink-0">
                      {t.driver_initials}
                    </div>
                    <p className="text-xs font-medium text-navy-700 truncate">{t.driver_name}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <i className="ri-user-unfollow-line text-xs flex-shrink-0"></i>
                    <span className="text-[11px] font-medium">Não alocado</span>
                  </div>
                )}
              </div>

              {/* Vehicle */}
              <div>
                {t.vehicle_plate !== '—' ? (
                  <div>
                    <p className="text-xs font-medium text-navy-700 truncate">{t.vehicle_name}</p>
                    <span className="text-[9px] font-mono text-navy-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      {t.vehicle_plate}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-navy-400 italic">A definir</span>
                )}
              </div>

              {/* Pax + occupancy */}
              <div>
                <p className="text-xs font-semibold text-navy-800 mb-1">{t.passenger_count} pax</p>
                <OccupancyBar current={t.passenger_count} max={t.capacity} />
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot} ${t.status === 'in_progress' ? 'animate-pulse' : ''}`}></span>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${s.badge} whitespace-nowrap`}>
                  {s.label}
                </span>
              </div>

              {/* Chevron */}
              <div className="flex justify-end">
                <i className="ri-arrow-right-s-line text-navy-300 text-base group-hover:text-teal-500 transition-colors"></i>
              </div>
            </div>

            {/* Mobile card */}
            <div className="lg:hidden px-4 py-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}></span>
                    <p className="text-xs font-bold text-navy-800 font-mono">{t.reference}</p>
                    <p className="text-xs font-bold text-navy-700">
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-navy-700 mt-0.5">{t.route_name}</p>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border flex-shrink-0 ${s.badge}`}>
                  {s.label}
                </span>
              </div>

              <p className="text-[11px] text-navy-500 truncate mb-2">
                {t.origin} → {t.destination}
              </p>

              <div className="flex items-center justify-between">
                {t.driver_name ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 flex items-center justify-center rounded-md bg-navy-950 text-white text-[8px] font-bold flex-shrink-0">
                      {t.driver_initials}
                    </div>
                    <span className="text-[10px] text-navy-600">{t.driver_name}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <i className="ri-user-unfollow-line text-xs"></i>
                    Não alocado
                  </span>
                )}
                <OccupancyBar current={t.passenger_count} max={t.capacity} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}