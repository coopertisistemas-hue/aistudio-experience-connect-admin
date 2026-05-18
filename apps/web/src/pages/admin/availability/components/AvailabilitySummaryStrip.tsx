import { mockAvailabilitySummary } from '@/mocks/admin-availability';

export default function AvailabilitySummaryStrip() {
  const s = mockAvailabilitySummary;

  const cards = [
    {
      label: 'Motoristas Disponíveis',
      value: `${s.drivers_available}`,
      sub: `de ${s.drivers_total} total`,
      icon: 'ri-steering-2-line',
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      bar: { pct: (s.drivers_available / s.drivers_total) * 100, color: 'bg-teal-500' },
    },
    {
      label: 'Veículos Disponíveis',
      value: `${s.vehicles_available}`,
      sub: `de ${s.vehicles_total} total`,
      icon: 'ri-taxi-line',
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-100',
      bar: { pct: (s.vehicles_available / s.vehicles_total) * 100, color: 'bg-sky-500' },
    },
    {
      label: 'Conflitos Detectados',
      value: `${s.conflicts_detected}`,
      sub: 'requer atenção',
      icon: 'ri-error-warning-line',
      color: s.conflicts_detected > 0 ? 'text-red-600' : 'text-stone-500',
      bg: s.conflicts_detected > 0 ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-100',
      pulse: s.conflicts_detected > 0,
    },
    {
      label: 'Bloqueios Ativos',
      value: `${s.active_blocks}`,
      sub: 'esta semana',
      icon: 'ri-forbid-2-line',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      label: 'Capacidade Operacional',
      value: `${s.operational_capacity_pct}%`,
      sub: 'frota disponível',
      icon: 'ri-bar-chart-grouped-line',
      color: s.operational_capacity_pct >= 80 ? 'text-teal-600' : s.operational_capacity_pct >= 60 ? 'text-amber-600' : 'text-red-600',
      bg: 'bg-stone-50 border-stone-100',
      bar: {
        pct: s.operational_capacity_pct,
        color: s.operational_capacity_pct >= 80 ? 'bg-teal-500' : s.operational_capacity_pct >= 60 ? 'bg-amber-500' : 'bg-red-500',
      },
    },
    {
      label: 'Escalas Hoje',
      value: `${s.shifts_today}`,
      sub: 'transfers ativos',
      icon: 'ri-calendar-schedule-line',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`border rounded-2xl px-4 py-3.5 flex flex-col gap-2 ${card.bg}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <i className={`${card.icon} ${card.color} text-base`}></i>
            </div>
            {card.pulse && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
            )}
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none ${card.color}`}>{card.value}</p>
            <p className="text-[11px] text-stone-500 mt-1 leading-tight">{card.label}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{card.sub}</p>
          </div>
          {card.bar && (
            <div className="h-1 rounded-full bg-stone-200 overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-700 ${card.bar.color}`}
                style={{ width: `${Math.min(card.bar.pct, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}