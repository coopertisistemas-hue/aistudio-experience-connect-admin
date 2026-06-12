import { useMemo } from 'react';

interface RoutesSummaryStripProps {
  routes: any[];
}

export default function RoutesSummaryStrip({ routes }: RoutesSummaryStripProps) {
  const kpis = useMemo(() => {
    const active = routes.filter((r: any) => r.is_active);
    const totalToday = routes.reduce((s: number, r: any) => s + (r.transfers_today || 0), 0);
    const topRoute = [...routes].sort((a: any, b: any) => (b.transfers_total || 0) - (a.transfers_total || 0))[0];
    const avgDuration = active.length
      ? Math.round(active.reduce((s: number, r: any) => s + (r.duration_min || 0), 0) / active.length)
      : 0;
    const totalRevMonth = routes.reduce((s: number, r: any) => s + (r.revenue_this_month || 0), 0);
    const avgOcc = active.length
      ? Math.round(active.reduce((s: number, r: any) => s + (r.avg_occupancy_pct || 0), 0) / active.length)
      : 0;

    return [
      {
        label: 'Rotas Ativas',
        value: active.length,
        sub: `de ${routes.length} cadastradas`,
        icon: 'ri-route-line',
        iconBg: 'bg-navy-50',
        iconColor: 'text-navy-600',
        warn: false,
      },
      {
        label: 'Transfers Hoje',
        value: totalToday,
        sub: 'em todas as rotas',
        icon: 'ri-car-line',
        iconBg: totalToday > 0 ? 'bg-teal-50' : 'bg-sand-50',
        iconColor: totalToday > 0 ? 'text-teal-600' : 'text-navy-400',
        warn: false,
        accent: totalToday > 0,
        accentColor: 'text-teal-600',
      },
      {
        label: 'Mais Usada',
        value: topRoute?.name.split(' → ')[0] ?? '—',
        valueSub: topRoute ? `${topRoute.transfers_total} transferes` : '',
        sub: topRoute?.name ?? '',
        icon: 'ri-star-line',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        warn: false,
        isText: true,
      },
      {
        label: 'Duração Média',
        value: avgDuration >= 60
          ? `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}min`
          : `${avgDuration}min`,
        sub: 'rotas ativas',
        icon: 'ri-time-line',
        iconBg: 'bg-sand-50',
        iconColor: 'text-navy-500',
        warn: false,
        isText: true,
      },
      {
        label: 'Receita do Mês',
        value: `R$ ${(totalRevMonth / 1000).toFixed(0)}k`,
        sub: 'todas as rotas',
        icon: 'ri-money-dollar-circle-line',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
        warn: false,
        accent: true,
        accentColor: 'text-teal-700',
        isText: true,
      },
      {
        label: 'Ocupação Média',
        value: `${avgOcc}%`,
        sub: 'frota em operação',
        icon: 'ri-bar-chart-fill',
        iconBg: avgOcc >= 80 ? 'bg-amber-50' : 'bg-sand-50',
        iconColor: avgOcc >= 80 ? 'text-amber-500' : 'text-navy-500',
        warn: avgOcc >= 80,
        isText: true,
        pct: avgOcc,
      },
    ];
  }, [routes]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-white border border-sand-200 rounded-2xl px-4 py-4 flex flex-col gap-3 hover:border-sand-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${kpi.iconBg}`}>
              <i className={`${kpi.icon} text-sm ${kpi.iconColor}`}></i>
            </div>
            {'pct' in kpi && kpi.pct !== undefined && (
              <div className="h-1 w-12 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${kpi.pct >= 80 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ width: `${kpi.pct}%` }}
                ></div>
              </div>
            )}
          </div>
          <div>
            {'isText' in kpi && kpi.isText ? (
              <p className={`font-serif text-lg font-semibold leading-tight ${'accent' in kpi && kpi.accent ? (kpi.accentColor ?? 'text-navy-800') : 'text-navy-800'}`}>
                {kpi.value}
              </p>
            ) : (
              <p className={`font-serif text-2xl font-semibold ${'accent' in kpi && kpi.accent ? (kpi.accentColor ?? 'text-navy-800') : 'text-navy-800'}`}>
                {kpi.value}
              </p>
            )}
            {'valueSub' in kpi && kpi.valueSub && (
              <p className="text-[10px] text-navy-400 mt-0.5">{kpi.valueSub}</p>
            )}
            <p className="text-[10px] font-semibold text-navy-500 mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-navy-400 mt-0.5 truncate">{kpi.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}