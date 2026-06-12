interface VehiclesGridProps {
  vehicles: any[];
  onSelect: (v: any) => void;
  selectedId?: string;
  loading?: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string; ring: string }> = {
  available:     { label: 'Disponível',    dot: 'bg-teal-500',  badge: 'bg-teal-50 text-teal-700 border-teal-200',    ring: 'ring-teal-200' },
  in_operation:  { label: 'Em Operação',   dot: 'bg-navy-500',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     ring: 'ring-navy-200' },
  maintenance:   { label: 'Manutenção',    dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200',  ring: 'ring-amber-200' },
  inactive:      { label: 'Inativo',       dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200', ring: 'ring-stone-200' },
  reserved:      { label: 'Reservado',     dot: 'bg-sand-500',  badge: 'bg-sand-100 text-navy-600 border-sand-300',    ring: 'ring-sand-300' },
  attention:     { label: 'Atenção',       dot: 'bg-red-400',   badge: 'bg-red-50 text-red-600 border-red-200',         ring: 'ring-red-200' },
};

const typeIcon: Record<string, string> = {
  van:      'ri-car-line',
  sprinter: 'ri-bus-2-line',
  sedan:    'ri-taxi-line',
  suv:      'ri-car-line',
  bus:      'ri-bus-line',
};

const typeLabel: Record<string, string> = {
  van: 'Van', sprinter: 'Sprinter', sedan: 'Sedã', suv: 'SUV', bus: 'Ônibus',
};

const maintConfig: Record<string, { label: string; color: string; icon: string }> = {
  ok:             { label: 'OK',            color: 'text-teal-600',  icon: 'ri-shield-check-line' },
  due_soon:       { label: 'Revisão próxima', color: 'text-amber-600', icon: 'ri-time-line' },
  overdue:        { label: 'Atrasada',      color: 'text-red-500',   icon: 'ri-alarm-warning-line' },
  in_maintenance: { label: 'Em manutenção', color: 'text-amber-600', icon: 'ri-tools-line' },
};

function OccupancyBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px] text-navy-400">
        <span>Ocupação</span>
        <span className={`font-semibold ${pct >= 90 ? 'text-red-500' : pct >= 70 ? 'text-amber-600' : 'text-teal-600'}`}>
          {current}/{capacity}
        </span>
      </div>
      <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
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
        <div className="h-8 bg-sand-200 rounded-xl mt-3"></div>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, onSelect, isSelected }: { vehicle: any; onSelect: (v: any) => void; isSelected: boolean }) {
  const s = statusConfig[vehicle.status];
  const mc = maintConfig[vehicle.maintenance_status];
  const icon = typeIcon[vehicle.type];
  const lastActivityLabel = vehicle.last_activity ? (() => {
    const diff = Math.round((Date.now() - new Date(vehicle.last_activity!).getTime()) / 60000);
    if (diff < 60) return `${diff}min atrás`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h atrás`;
    return new Date(vehicle.last_activity!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  })() : 'sem registro';

  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle)}
      className={`w-full text-left bg-white border rounded-2xl p-5 transition-all cursor-pointer group hover:border-sand-300
        ${isSelected ? `border-teal-300 ring-2 ${s.ring} ring-offset-1` : 'border-sand-200'}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${
            vehicle.status === 'maintenance' || vehicle.status === 'attention'
              ? 'bg-amber-50 border-amber-100'
              : vehicle.status === 'inactive'
              ? 'bg-stone-50 border-stone-200'
              : 'bg-navy-50 border-navy-100'
          }`}>
            <i className={`${icon} text-xl ${
              vehicle.status === 'maintenance' ? 'text-amber-500' :
              vehicle.status === 'attention' ? 'text-red-400' :
              vehicle.status === 'inactive' ? 'text-stone-400' :
              'text-navy-600'
            }`}></i>
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot} ${vehicle.status === 'in_operation' ? 'animate-pulse' : ''}`}></span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-800 truncate">{vehicle.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[10px] font-mono text-navy-500 bg-sand-100 px-1.5 py-0.5 rounded">{vehicle.plate}</span>
                <span className="text-[10px] text-navy-400">{typeLabel[vehicle.type]}</span>
                <span className="text-[10px] text-navy-400">· {vehicle.year}</span>
              </div>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${s.badge}`}>
              {s.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{vehicle.capacity}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Lugares</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{vehicle.transfers_today}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Hoje</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{vehicle.km_today}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">km hoje</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{vehicle.transfers_total}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">Total</p>
        </div>
      </div>

      {/* Occupancy bar (only when in_operation) */}
      {vehicle.status === 'in_operation' && (
        <div className="mb-4">
          <OccupancyBar current={vehicle.current_occupancy} capacity={vehicle.capacity} />
        </div>
      )}

      {/* Driver */}
      {vehicle.assigned_driver ? (
        <div className="flex items-center gap-2.5 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2.5 mb-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950 text-white text-[9px] font-bold flex-shrink-0">
            {vehicle.assigned_driver_initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-navy-700 truncate">{vehicle.assigned_driver}</p>
            <p className="text-[10px] text-navy-400 mt-0.5">{vehicle.assigned_driver_phone}</p>
          </div>
          <i className="ri-steering-2-line text-navy-300 text-sm flex-shrink-0"></i>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3">
          <i className="ri-steering-2-line text-amber-400 text-sm flex-shrink-0"></i>
          <span className="text-[11px] text-amber-600 font-medium">Sem motorista vinculado</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${mc.color}`}>
          <i className={`${mc.icon} text-xs`}></i>
          <span className="text-[10px] font-medium">{mc.label}</span>
        </div>
        <span className="text-[10px] text-navy-400">{lastActivityLabel}</span>
      </div>

      {/* Maintenance warning */}
      {(vehicle.maintenance_status === 'overdue' || vehicle.maintenance_status === 'due_soon') && vehicle.status !== 'maintenance' && (
        <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-medium ${
          vehicle.maintenance_status === 'overdue'
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <i className={`${vehicle.maintenance_status === 'overdue' ? 'ri-alarm-warning-line' : 'ri-time-line'} text-xs`}></i>
          {vehicle.maintenance_status === 'overdue'
            ? 'Revisão atrasada — agendar imediatamente'
            : `Próxima revisão: ${new Date(vehicle.next_service).toLocaleDateString('pt-BR')}`}
        </div>
      )}
    </button>
  );
}

export default function VehiclesGrid({ vehicles, onSelect, selectedId, loading }: VehiclesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-car-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhum veículo encontrado</p>
        <p className="text-navy-400 text-xs mt-1">Ajuste os filtros ou cadastre um novo veículo na frota.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onSelect={onSelect} isSelected={v.id === selectedId} />
      ))}
    </div>
  );
}