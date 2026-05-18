import type { MockRoute, RouteStatus, RouteCategory } from '@/mocks/admin-routes';

interface RoutesGridProps {
  routes: MockRoute[];
  onSelect: (r: MockRoute) => void;
  selectedId?: string;
  loading?: boolean;
}

const statusConfig: Record<RouteStatus, { label: string; badge: string; dot: string; ring: string }> = {
  active:       { label: 'Ativa',         badge: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500',  ring: 'ring-teal-200' },
  inactive:     { label: 'Inativa',       badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400', ring: 'ring-stone-200' },
  paused:       { label: 'Pausada',       badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500', ring: 'ring-amber-200' },
  high_demand:  { label: 'Alta Demanda',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     dot: 'bg-navy-500',  ring: 'ring-navy-200' },
  attention:    { label: 'Atenção',       badge: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400',   ring: 'ring-red-200' },
};

const categoryConfig: Record<RouteCategory, { label: string; icon: string; color: string }> = {
  airport:   { label: 'Aeroporto',   icon: 'ri-flight-takeoff-line', color: 'text-navy-500' },
  hotel:     { label: 'Hotel',       icon: 'ri-hotel-line',           color: 'text-teal-600' },
  tourism:   { label: 'Turismo',     icon: 'ri-compass-discover-line', color: 'text-amber-600' },
  corporate: { label: 'Corporativo', icon: 'ri-building-4-line',      color: 'text-navy-600' },
  transfer:  { label: 'Transfer',    icon: 'ri-car-line',             color: 'text-navy-500' },
};

const demandConfig: Record<string, { label: string; bar: string; text: string; pct: number }> = {
  low:    { label: 'Baixa',  bar: 'bg-stone-300', text: 'text-stone-500', pct: 20 },
  medium: { label: 'Média',  bar: 'bg-amber-400', text: 'text-amber-600', pct: 50 },
  high:   { label: 'Alta',   bar: 'bg-teal-500',  text: 'text-teal-600',  pct: 75 },
  peak:   { label: 'Pico',   bar: 'bg-navy-500',  text: 'text-navy-700',  pct: 95 },
};

function RouteVizMini({ origin, destination }: { origin: string; destination: string }) {
  return (
    <div className="flex items-center gap-2 py-3 px-3 bg-sand-50 border border-sand-200 rounded-xl mb-4">
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
        <div className="w-px h-5 bg-sand-300 border-l border-dashed border-sand-400"></div>
        <div className="w-2 h-2 rounded-full bg-navy-400"></div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[10px] font-semibold text-navy-700 truncate">{origin}</p>
        <p className="text-[10px] font-semibold text-navy-700 truncate">{destination}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-sand-200 rounded-lg w-2/3"></div>
        <div className="h-5 bg-sand-200 rounded-lg w-16"></div>
      </div>
      <div className="h-14 bg-sand-100 rounded-xl mb-4"></div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-sand-100 rounded-xl"></div>)}
      </div>
      <div className="h-8 bg-sand-100 rounded-xl"></div>
    </div>
  );
}

function RouteCard({ route, onSelect, isSelected }: { route: MockRoute; onSelect: (r: MockRoute) => void; isSelected: boolean }) {
  const s = statusConfig[route.status];
  const cat = categoryConfig[route.category];
  const dem = demandConfig[route.demand_level];
  const durationLabel = route.duration_min >= 60
    ? `${Math.floor(route.duration_min / 60)}h${route.duration_min % 60 > 0 ? ` ${route.duration_min % 60}min` : ''}`
    : `${route.duration_min}min`;

  return (
    <button
      type="button"
      onClick={() => onSelect(route)}
      className={`w-full text-left bg-white border rounded-2xl p-5 transition-all cursor-pointer group hover:border-sand-300
        ${isSelected ? `border-teal-300 ring-2 ${s.ring} ring-offset-1` : 'border-sand-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0`}>
              <i className={`${cat.icon} text-sm ${cat.color}`}></i>
            </div>
            <p className="text-sm font-semibold text-navy-800 truncate">{route.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-navy-400">{cat.label}</span>
            <span className="text-[10px] text-navy-300">·</span>
            <span className={`text-[10px] font-semibold ${dem.text}`}>{dem.label} demanda</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border whitespace-nowrap ${s.badge}`}>
            {s.label}
          </span>
          {route.status === 'high_demand' && (
            <span className="w-1.5 h-1.5 rounded-full bg-navy-500 animate-pulse"></span>
          )}
          {route.status === 'attention' && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          )}
        </div>
      </div>

      {/* Route visualization */}
      <RouteVizMini origin={route.origin_name} destination={route.destination_name} />

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{route.distance_km}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">km</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{durationLabel}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">duração</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800">{route.transfers_today}</p>
          <p className="text-[9px] text-navy-400 mt-0.5">hoje</p>
        </div>
        <div className="bg-sand-50 border border-sand-100 rounded-xl p-2 text-center">
          <p className="font-serif text-base font-semibold text-navy-800 text-[11px] leading-tight">
            {`R$ ${route.base_price % 1 === 0 ? route.base_price.toFixed(0) : route.base_price.toFixed(0)}`}
          </p>
          <p className="text-[9px] text-navy-400 mt-0.5">base</p>
        </div>
      </div>

      {/* Demand bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-[9px] text-navy-400">
          <span>Ocupação média</span>
          <span className={`font-semibold ${route.avg_occupancy_pct >= 80 ? 'text-amber-600' : 'text-teal-600'}`}>
            {route.avg_occupancy_pct}%
          </span>
        </div>
        <div className="h-1.5 bg-sand-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${route.avg_occupancy_pct >= 80 ? 'bg-amber-400' : 'bg-teal-500'}`}
            style={{ width: `${route.avg_occupancy_pct}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {route.associated_drivers.slice(0, 3).map((d, i) => (
            <div
              key={i}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-navy-950 text-white text-[8px] font-bold border border-white"
              style={{ marginLeft: i > 0 ? '-4px' : '0' }}
              title={d}
            >
              {d.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          ))}
          {route.associated_drivers.length > 3 && (
            <span className="text-[9px] text-navy-400 ml-1">+{route.associated_drivers.length - 3}</span>
          )}
          {route.associated_drivers.length === 0 && (
            <span className="text-[10px] text-amber-600 font-medium">Sem motoristas</span>
          )}
        </div>
        <p className="text-[10px] font-semibold text-teal-600">
          R$ {(route.revenue_this_month / 1000).toFixed(1)}k/mês
        </p>
      </div>
    </button>
  );
}

export default function RoutesGrid({ routes, onSelect, selectedId, loading }: RoutesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-50 border border-sand-200 mb-4">
          <i className="ri-route-line text-navy-300 text-2xl"></i>
        </div>
        <p className="text-navy-600 font-semibold text-sm">Nenhuma rota encontrada</p>
        <p className="text-navy-400 text-xs mt-1">Ajuste os filtros ou cadastre uma nova rota.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {routes.map((r) => (
        <RouteCard key={r.id} route={r} onSelect={onSelect} isSelected={r.id === selectedId} />
      ))}
    </div>
  );
}