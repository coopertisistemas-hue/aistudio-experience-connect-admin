import type { RouteAnalytic } from '@/services/reports';

interface Props { data: RouteAnalytic[] }

const categoryConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  airport:   { label: 'Aeroporto',  bg: 'bg-teal-50',           text: 'text-teal-700',  icon: 'ri-flight-takeoff-line' },
  tourism:   { label: 'Turismo',    bg: 'bg-navy-950/[0.07]',   text: 'text-[#1e3a5f]', icon: 'ri-compass-discover-line' },
  corporate: { label: 'Corporativo',bg: 'bg-amber-50',           text: 'text-amber-700', icon: 'ri-briefcase-line' },
  hotel:     { label: 'Hotel',      bg: 'bg-stone-100',          text: 'text-stone-600', icon: 'ri-hotel-line' },
};

function formatDuration(min: number) {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatRevenue(n: number) {
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(0)}k`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

export default function ReportsRouteAnalytics({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.transfers - a.transfers);
  const maxTransfers = Math.max(...sorted.map((r) => r.transfers), 1);
  const maxRevenue = Math.max(...sorted.map((r) => r.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">Análise de Rotas</h3>
          <p className="text-stone-400 text-xs mt-0.5">Volume, receita e ocupação por rota</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>Crescendo</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-400 inline-block"></span>Estável</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>Queda</span>
        </div>
      </div>

      {/* Route bars chart */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Transfers por Rota</p>
        <div className="space-y-2">
          {sorted.map((route) => {
            const transferPct = (route.transfers / maxTransfers) * 100;
            const cc = categoryConfig[route.category] ?? categoryConfig.hotel;
            const trendColor = route.trend === 'up' ? 'text-teal-600' : route.trend === 'down' ? 'text-red-500' : 'text-stone-400';
            const trendIcon = route.trend === 'up' ? 'ri-arrow-up-line' : route.trend === 'down' ? 'ri-arrow-down-line' : 'ri-subtract-line';

            return (
              <div key={route.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${cc.bg}`}>
                  <i className={`${cc.icon} text-[10px] ${cc.text}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-stone-700 truncate pr-2">{route.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${trendColor}`}>
                        <i className={`${trendIcon} text-[10px]`}></i>
                        {Math.abs(route.trend_pct)}%
                      </span>
                      <span className="text-[11px] font-semibold text-stone-700">{route.transfers}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${transferPct}%`,
                        backgroundColor: route.category === 'airport' ? '#0f766e' : route.category === 'tourism' ? '#1e3a5f' : route.category === 'corporate' ? '#d97706' : '#78716c',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue + details grid */}
      <div className="px-5 pt-3 pb-5">
        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Receita & Ocupação</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.slice(0, 6).map((route) => {
            const revPct = (route.revenue / maxRevenue) * 100;
            const cc = categoryConfig[route.category] ?? categoryConfig.hotel;

            return (
              <div key={route.id} className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 hover:border-stone-200 transition-colors">
                <div className="flex items-start gap-2 mb-2.5">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${cc.bg}`}>
                    <i className={`${cc.icon} text-[10px] ${cc.text}`}></i>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 truncate leading-tight">{route.name}</p>
                </div>

                {/* Revenue bar */}
                <div className="mb-2.5">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-stone-500">Receita</span>
                    <span className="font-semibold text-stone-700">{formatRevenue(route.revenue)}</span>
                  </div>
                  <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${revPct}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Ocupação', value: `${route.avg_occupancy_pct}%` },
                    { label: 'Duração', value: formatDuration(route.avg_duration_min) },
                    { label: 'Transfers', value: route.transfers.toString() },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-xs font-semibold text-stone-700">{stat.value}</p>
                      <p className="text-[10px] text-stone-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}