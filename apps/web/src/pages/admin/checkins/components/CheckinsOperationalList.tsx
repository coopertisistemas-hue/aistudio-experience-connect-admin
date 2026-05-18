import type { MockCheckin, CheckinStatus } from '@/mocks/admin-checkins';

interface CheckinsOperationalListProps {
  checkins: MockCheckin[];
  selectedId: string | null;
  onSelect: (checkin: MockCheckin) => void;
}

const statusConfig: Record<CheckinStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: 'Pendente',    bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmado',  bg: 'bg-teal-50',    text: 'text-teal-700',   dot: 'bg-teal-500' },
  boarded:    { label: 'Embarcado',   bg: 'bg-navy-950/[0.07]', text: 'text-[#1e3a5f]', dot: 'bg-[#1e3a5f]' },
  in_transit: { label: 'Em Trânsito', bg: 'bg-teal-50',    text: 'text-teal-800',   dot: 'bg-teal-600 animate-pulse' },
  completed:  { label: 'Finalizado',  bg: 'bg-stone-100',  text: 'text-stone-500',  dot: 'bg-stone-400' },
  absent:     { label: 'Ausente',     bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500' },
  cancelled:  { label: 'Cancelado',   bg: 'bg-stone-100',  text: 'text-stone-400',  dot: 'bg-stone-300' },
};

const categoryIcon: Record<string, string> = {
  airport:   'ri-flight-takeoff-line',
  hotel:     'ri-hotel-line',
  tourism:   'ri-compass-discover-line',
  corporate: 'ri-briefcase-line',
};

function BoardingBar({ confirmed, boarded, total }: { confirmed: number; boarded: number; total: number }) {
  const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
  const boardedPct   = total > 0 ? (boarded / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-teal-200 rounded-full transition-all" style={{ width: `${confirmedPct}%` }} />
        <div className="absolute inset-y-0 left-0 bg-teal-500 rounded-full transition-all" style={{ width: `${boardedPct}%` }} />
      </div>
      <span className="text-[11px] text-stone-500 whitespace-nowrap">{boarded}/{total}</span>
    </div>
  );
}

export default function CheckinsOperationalList({ checkins, selectedId, onSelect }: CheckinsOperationalListProps) {
  if (checkins.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-stone-100">
          <i className="ri-check-double-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-stone-500 font-medium text-sm">Nenhum check-in encontrado</p>
        <p className="text-stone-400 text-xs">Ajuste os filtros ou crie um novo check-in</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {checkins.map((ci) => {
        const sc = statusConfig[ci.status];
        const isSelected = selectedId === ci.id;
        const hasDelay = (ci.delay_minutes ?? 0) > 0;
        const pendingPassengers = ci.passenger_count - ci.confirmed_count;

        return (
          <div
            key={ci.id}
            onClick={() => onSelect(ci)}
            className={`bg-white rounded-xl border transition-all duration-150 cursor-pointer group
              ${isSelected
                ? 'border-teal-400 ring-1 ring-teal-300/50'
                : 'border-stone-200 hover:border-stone-300'
              }`}
          >
            {/* Delay stripe */}
            {hasDelay && (
              <div className="h-0.5 rounded-t-xl bg-amber-400 w-full" />
            )}
            {ci.status === 'absent' && (
              <div className="h-0.5 rounded-t-xl bg-red-400 w-full" />
            )}

            <div className="px-4 py-3.5">
              {/* Top row */}
              <div className="flex items-start gap-3">
                {/* Category icon */}
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${
                  ci.status === 'in_transit' ? 'bg-teal-500/[0.1]' :
                  ci.status === 'completed' ? 'bg-stone-100' :
                  ci.status === 'absent' ? 'bg-red-50' :
                  'bg-navy-950/[0.05]'
                }`}>
                  <i className={`${categoryIcon[ci.category] ?? 'ri-map-pin-line'} text-sm ${
                    ci.status === 'in_transit' ? 'text-teal-600' :
                    ci.status === 'completed' ? 'text-stone-400' :
                    ci.status === 'absent' ? 'text-red-500' :
                    'text-[#1e3a5f]'
                  }`}></i>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[13px] text-stone-800 truncate">{ci.passenger_lead}</span>
                    <span className="text-stone-300 text-xs">·</span>
                    <span className="text-stone-500 text-xs">{ci.booking_reference}</span>
                    {hasDelay && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {ci.delay_minutes}min atraso
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5 truncate">{ci.route_name}</p>
                </div>

                {/* Status badge */}
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`}></span>
                  {sc.label}
                </span>
              </div>

              {/* Detail row */}
              <div className="mt-2.5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <i className="ri-map-pin-line text-stone-400 text-xs"></i>
                  <span className="text-stone-600 text-xs truncate">{ci.origin}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-time-line text-stone-400 text-xs"></i>
                  <span className="text-stone-600 text-xs">{ci.scheduled_time}</span>
                  <span className="text-stone-400 text-xs">{ci.scheduled_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-steering-2-line text-stone-400 text-xs"></i>
                  {ci.driver_name ? (
                    <span className="text-stone-600 text-xs truncate">{ci.driver_name}</span>
                  ) : (
                    <span className="text-amber-600 text-xs">Sem motorista</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-taxi-line text-stone-400 text-xs"></i>
                  {ci.vehicle_name ? (
                    <span className="text-stone-600 text-xs truncate">{ci.vehicle_name}</span>
                  ) : (
                    <span className="text-amber-600 text-xs">Sem veículo</span>
                  )}
                </div>
              </div>

              {/* Boarding bar */}
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-stone-500">
                      Passageiros:{' '}
                      <span className="font-semibold text-stone-700">{ci.confirmed_count} confirmados</span>
                      {pendingPassengers > 0 && (
                        <span className="text-amber-600 ml-1">· {pendingPassengers} pendentes</span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500">{ci.passenger_count} total</span>
                  </div>
                  <BoardingBar
                    confirmed={ci.confirmed_count}
                    boarded={ci.boarded_count}
                    total={ci.passenger_count}
                  />
                </div>

                {/* Boarding status chip */}
                <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                  ci.boarding_status === 'completed' ? 'bg-teal-50 text-teal-700' :
                  ci.boarding_status === 'in_progress' ? 'bg-navy-950/[0.06] text-[#1e3a5f]' :
                  ci.boarding_status === 'delayed' ? 'bg-amber-50 text-amber-700' :
                  'bg-stone-100 text-stone-500'
                }`}>
                  <i className={`text-[10px] ${
                    ci.boarding_status === 'completed' ? 'ri-checkbox-circle-line' :
                    ci.boarding_status === 'in_progress' ? 'ri-loader-line' :
                    ci.boarding_status === 'delayed' ? 'ri-alarm-warning-line' :
                    'ri-time-line'
                  }`}></i>
                  {ci.boarding_status === 'completed' ? 'Embarcado' :
                   ci.boarding_status === 'in_progress' ? 'Embarcando' :
                   ci.boarding_status === 'delayed' ? 'Atrasado' :
                   'Não iniciado'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}