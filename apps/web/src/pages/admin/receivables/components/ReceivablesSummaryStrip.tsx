interface ReceivablesStats {
  total_to_receive: number;
  received_today: number;
  open_count: number;
  overdue_count: number;
  overdue_amount: number;
  avg_ticket: number;
  cashflow_forecast: number;
}

interface Props { stats: ReceivablesStats }

export default function ReceivablesSummaryStrip({ stats }: Props) {
  const s = stats;

  const fmt = (v: number) =>
    v >= 1000
      ? `R$ ${(v / 1000).toFixed(1)}k`
      : `R$ ${v.toLocaleString('pt-BR')}`;

  const cards = [
    {
      label: 'Total a Receber',
      value: fmt(s.total_to_receive),
      sub: 'em aberto + parcial',
      icon: 'ri-money-dollar-circle-line',
      accent: 'bg-navy-950/8',
      textAccent: 'text-[#1a3346]',
      iconColor: 'text-[#2d4a63]',
      pulse: false,
    },
    {
      label: 'Recebimentos Hoje',
      value: s.received_today > 0 ? fmt(s.received_today) : '—',
      sub: 'confirmados hoje',
      icon: 'ri-checkbox-circle-line',
      accent: 'bg-teal-500/10',
      textAccent: 'text-teal-700',
      iconColor: 'text-teal-600',
      pulse: false,
    },
    {
      label: 'Em Aberto',
      value: `${s.open_count}`,
      sub: 'transações pendentes',
      icon: 'ri-time-line',
      accent: 'bg-indigo-50',
      textAccent: 'text-indigo-700',
      iconColor: 'text-indigo-500',
      pulse: false,
    },
    {
      label: 'Atrasados',
      value: s.overdue_count > 0 ? `${s.overdue_count}` : '0',
      sub: s.overdue_count > 0 ? fmt(s.overdue_amount) + ' em risco' : 'sem atrasos',
      icon: 'ri-alarm-warning-line',
      accent: s.overdue_count > 0 ? 'bg-red-50' : 'bg-stone-100',
      textAccent: s.overdue_count > 0 ? 'text-red-600' : 'text-stone-500',
      iconColor: s.overdue_count > 0 ? 'text-red-500' : 'text-stone-400',
      pulse: s.overdue_count > 0,
    },
    {
      label: 'Ticket Médio',
      value: fmt(s.avg_ticket),
      sub: 'por reserva',
      icon: 'ri-line-chart-line',
      accent: 'bg-emerald-50',
      textAccent: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      pulse: false,
    },
    {
      label: 'Previsão de Caixa',
      value: fmt(s.cashflow_forecast),
      sub: 'próximos 30 dias',
      icon: 'ri-funds-line',
      accent: 'bg-amber-50',
      textAccent: 'text-amber-700',
      iconColor: 'text-amber-600',
      pulse: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {cards.map((c) => (
        <div key={c.label} className="relative bg-white border border-stone-200 rounded-xl p-4 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] text-stone-500 font-medium leading-tight pr-2">{c.label}</p>
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${c.accent}`}>
              {c.pulse
                ? <i className={`${c.icon} text-sm ${c.iconColor} animate-pulse`}></i>
                : <i className={`${c.icon} text-sm ${c.iconColor}`}></i>
              }
            </div>
          </div>
          <p className={`text-xl font-bold font-serif tracking-tight ${c.textAccent}`}>{c.value}</p>
          {c.sub && <p className="text-[11px] mt-0.5 text-stone-400">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}