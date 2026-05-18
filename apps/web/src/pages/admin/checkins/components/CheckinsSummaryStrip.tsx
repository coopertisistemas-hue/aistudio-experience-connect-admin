import { mockCheckinStats, mockCheckins } from '@/mocks/admin-checkins';

interface KpiCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  pulse?: boolean;
  accent?: string;
  bar?: { value: number; color: string };
}

export default function CheckinsSummaryStrip() {
  const stats = mockCheckinStats;
  const inTransitCount = mockCheckins.filter((c) => c.status === 'in_transit').length;
  const completionRate = stats.today_total > 0
    ? Math.round((stats.boarded / stats.today_total) * 100)
    : 0;

  const cards: KpiCard[] = [
    {
      label: 'Check-ins Hoje',
      value: stats.today_total,
      sub: 'operações ativas',
      icon: 'ri-check-double-line',
      iconBg: 'bg-navy-950/[0.06]',
      iconColor: 'text-[#1e3a5f]',
    },
    {
      label: 'Confirmados',
      value: stats.confirmed,
      sub: `${stats.today_total > 0 ? Math.round((stats.confirmed / stats.today_total) * 100) : 0}% do total`,
      icon: 'ri-checkbox-circle-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      accent: 'teal',
    },
    {
      label: 'Pendentes',
      value: stats.pending,
      sub: 'aguardando ação',
      icon: 'ri-time-line',
      iconBg: 'bg-amber-500/[0.08]',
      iconColor: 'text-amber-600',
      accent: stats.pending > 0 ? 'amber' : undefined,
    },
    {
      label: 'Embarcados',
      value: stats.boarded,
      sub: `${completionRate}% taxa de embarque`,
      icon: 'ri-route-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      pulse: inTransitCount > 0,
      bar: { value: completionRate, color: 'bg-teal-500' },
    },
    {
      label: 'Ausentes',
      value: stats.absent,
      sub: stats.absent > 0 ? 'requer atenção' : 'sem ocorrências',
      icon: 'ri-user-unfollow-line',
      iconBg: stats.absent > 0 ? 'bg-red-500/[0.08]' : 'bg-stone-200/60',
      iconColor: stats.absent > 0 ? 'text-red-500' : 'text-stone-400',
      accent: stats.absent > 0 ? 'red' : undefined,
    },
    {
      label: 'Transfers Prontos',
      value: stats.transfers_ready,
      sub: 'aguardando embarque',
      icon: 'ri-car-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      pulse: stats.transfers_ready > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-stone-200 px-4 py-4 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${card.iconBg}`}>
              <i className={`${card.icon} text-sm ${card.iconColor}`}></i>
            </div>
            {card.pulse && (
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            )}
            {card.accent === 'amber' && !card.pulse && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
            {card.accent === 'red' && (
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            )}
          </div>
          <div>
            <p className="font-serif text-2xl font-semibold text-navy-950 leading-none">
              {card.value}
            </p>
            <p className="text-stone-500 text-[11px] mt-1 leading-tight">{card.label}</p>
          </div>
          {card.bar && (
            <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${card.bar.color} transition-all duration-700`}
                style={{ width: `${Math.min(card.bar.value, 100)}%` }}
              />
            </div>
          )}
          {card.sub && !card.bar && (
            <p className={`text-[11px] leading-tight ${
              card.accent === 'amber' ? 'text-amber-600' :
              card.accent === 'red' ? 'text-red-500' :
              card.accent === 'teal' ? 'text-teal-600' :
              'text-stone-400'
            }`}>
              {card.sub}
            </p>
          )}
          {card.sub && card.bar && (
            <p className="text-[11px] text-stone-400 leading-tight">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}