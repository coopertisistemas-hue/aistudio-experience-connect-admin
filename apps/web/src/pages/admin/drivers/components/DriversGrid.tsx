import type { MockDriver, DriverStatus } from '@/mocks/admin-drivers';

interface DriversGridProps {
  drivers: MockDriver[];
  onSelect: (d: MockDriver) => void;
  selectedId?: string;
  loading?: boolean;
}

const statusConfig: Record<DriverStatus, { label: string; dot: string; badge: string; ring: string }> = {
  available:   { label: 'Disponível',   dot: 'bg-teal-500',  badge: 'bg-teal-50 text-teal-700 border-teal-200',    ring: 'ring-teal-300' },
  on_trip:     { label: 'Em Transfer',  dot: 'bg-navy-500',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     ring: 'ring-navy-300' },
  off_duty:    { label: 'Offline',      dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200', ring: 'ring-stone-300' },
  paused:      { label: 'Pausado',      dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200',  ring: 'ring-amber-300' },
  unavailable: { label: 'Indisponível', dot: 'bg-red-400',   badge: 'bg-red-50 text-red-600 border-red-200',        ring: 'ring-red-200' },
  pending:     { label: 'Pendente',     dot: 'bg-sand-400',  badge: 'bg-sand-100 text-navy-500 border-sand-300',    ring: 'ring-sand-300' },
};

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) return <span className="text-[10px] text-navy-300 italic">Novo</span>;
  return (
    <div className="flex items-center gap-1">
      <i className="ri-star-fill text-amber-400 text-xs"></i>
      <span className="text-xs font-bold text-navy-800">{rating.toFixed(1)}</span>
    </div>
  );
}

function PerformanceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }}></div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-sand-200 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-sand-200 rounded-lg w-3/4"></div>
          <div className="h-3 bg-sand-200 rounded-lg w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-sand-200 rounded-lg"></div>
        <div className="h-3 bg-sand-200 rounded-lg w-5/6"></div>
      </div>
    </div>
  );
}

function DriverCard({ driver, onSelect, isSelected }: { driver: MockDriver; onSelect: (d: MockDriver) => void; isSelected: boolean }) {
  const s = statusConfig[driver.status];
  const lastSeen = driver.last_activity ? (() => {
    const diff = Math.round((Date.now() - new Date(driver.last_activity!).getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff}min atrás`;
    const h = Math.round(diff / 60);
    return `${h}h atrás`;
  })() : 'nunca';

  return (
    <button
      type="button"
      onClick={() => onSelect(driver)}
      className={`w-full text-left bg-white border rounded-2xl p-5 transition-all cursor-pointer group hover:border-sand-300
        ${isSelected ? `border-teal-300 ring-2 ${s.ring} ring-offset-1` : 'border-sand-200'}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-navy-950 text-white text-sm font-bold">
            {driver.initials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot} ${driver.status === 'on_trip' || driver.status === 'available' ? 'animate-pulse' : ''}`}></span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-800 truncate">{driver.full_name}</p>
              <p className="text-[11px] text-navy-400 truncate mt-0.5">{driver.email}</p>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${s.badge}`}>
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <i className="ri-phone-line text-navy-300 text-xs flex-shrink-0"></i>
            <span className="text-[10px] text-navy-500">{driver.phone}</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{driver.transfers_today}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Hoje</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{driver.performance.transfers_this_week}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Semana</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{driver.transfers_total}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Total</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center"><StarRating rating={driver.performance.avg_rating} /></div>
          <p className="text-[9px] text-navy-400 mt-0.5">Rating</p>
        </div>
      </div>

      {/* Performance bars */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-navy-400 w-16 flex-shrink-0">Pontual.</span>
          <PerformanceBar value={driver.performance.on_time_rate} color="bg-teal-500" />
          <span className="text-[9px] text-navy-500 font-medium w-8 text-right">{driver.performance.on_time_rate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-navy-400 w-16 flex-shrink-0">Conclusão</span>
          <PerformanceBar value={driver.performance.completion_rate} color="bg-navy-400" />
          <span className="text-[9px] text-navy-500 font-medium w-8 text-right">{driver.performance.completion_rate}%</span>
        </div>
      </div>

      {/* Vehicle */}
      {driver.assigned_vehicle ? (
        <div className="flex items-center gap-2.5 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2.5 mb-3">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-navy-100 flex-shrink-0">
            <i className="ri-car-line text-navy-500 text-[10px]"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-navy-700 truncate">{driver.assigned_vehicle}</p>
            <p className="text-[10px] font-mono text-navy-400 mt-0.5">{driver.assigned_vehicle_plate}</p>
          </div>
          {driver.vehicle_capacity && (
            <span className="text-[9px] text-navy-400 flex-shrink-0 flex items-center gap-0.5">
              <i className="ri-group-line text-[9px]"></i>{driver.vehicle_capacity}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3">
          <i className="ri-car-line text-amber-400 text-sm flex-shrink-0"></i>
          <span className="text-[11px] text-amber-600 font-medium">Sem veículo vinculado</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {driver.app_installed ? (
            <div className="flex items-center gap-1 text-teal-600">
              <i className="ri-smartphone-line text-xs"></i>
              <span className="text-[10px] font-medium">App ativo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-500">
              <i className="ri-smartphone-line text-xs"></i>
              <span className="text-[10px] font-medium">Sem app</span>
            </div>
          )}
          {driver.performance.incidents > 0 && (
            <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full ml-1">
              {driver.performance.incidents} ocorr.
            </span>
          )}
        </div>
        <span className="text-[10px] text-navy-400">{lastSeen}</span>
      </div>
    </button>
  );
}

export default function DriversGrid({ drivers, onSelect, selectedId, loading }: DriversGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-steering-2-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum motorista encontrado</p>
        <p className="text-navy-400 text-xs mt-1">Ajuste os filtros ou cadastre um novo motorista.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {drivers.map((d) => (
        <DriverCard key={d.id} driver={d} onSelect={onSelect} isSelected={d.id === selectedId} />
      ))}
    </div>
  );
}