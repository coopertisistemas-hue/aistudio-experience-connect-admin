import type { ExecutiveSummary } from '@/services/reports';

interface Props { data: ExecutiveSummary }

interface SummaryCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; label: string };
  bar?: { pct: number; color: string };
  accent?: 'teal' | 'navy' | 'amber' | 'stone';
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

export default function ReportsExecutiveSummary({ data }: Props) {
  const s = data;

  const cards: SummaryCard[] = [
    {
      label: 'Receita Total',
      value: formatCurrency(s.receita_total),
      sub: `${formatCurrency(s.receita_mes)} este mês`,
      icon: 'ri-money-dollar-circle-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      trend: { value: s.crescimento_receita_pct, label: 'vs mês ant.' },
      accent: 'teal',
    },
    {
      label: 'Transfers Realizados',
      value: s.transfers_realizados.toLocaleString('pt-BR'),
      sub: `${s.transfers_mes} este mês`,
      icon: 'ri-car-line',
      iconBg: 'bg-navy-950/[0.06]',
      iconColor: 'text-[#1e3a5f]',
      trend: { value: s.crescimento_transfers_pct, label: 'vs mês ant.' },
      accent: 'navy',
    },
    {
      label: 'Taxa de Ocupação',
      value: `${s.taxa_ocupacao_pct}%`,
      sub: 'média operacional',
      icon: 'ri-group-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      bar: { pct: s.taxa_ocupacao_pct, color: s.taxa_ocupacao_pct >= 80 ? 'bg-teal-500' : 'bg-amber-400' },
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${s.ticket_medio.toLocaleString('pt-BR')}`,
      sub: 'por transfer',
      icon: 'ri-receipt-line',
      iconBg: 'bg-amber-500/[0.08]',
      iconColor: 'text-amber-600',
      accent: 'amber',
    },
    {
      label: 'Motoristas Ativos',
      value: s.motoristas_ativos.toString(),
      sub: 'na operação',
      icon: 'ri-steering-2-line',
      iconBg: 'bg-navy-950/[0.06]',
      iconColor: 'text-[#1e3a5f]',
      accent: 'navy',
    },
    {
      label: 'Check-ins Confirmados',
      value: s.checkins_confirmados.toLocaleString('pt-BR'),
      sub: `${formatCurrency(s.pagamentos_pendentes)} pendentes`,
      icon: 'ri-check-double-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      accent: 'stone',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-stone-200 px-4 py-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${card.iconBg}`}>
              <i className={`${card.icon} text-sm ${card.iconColor}`}></i>
            </div>
            {card.trend && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                card.trend.value >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-500'
              }`}>
                {card.trend.value >= 0 ? '+' : ''}{card.trend.value}%
              </span>
            )}
          </div>
          <div>
            <p className="font-serif text-2xl font-semibold text-stone-900 leading-none">{card.value}</p>
            <p className="text-stone-500 text-[11px] mt-1 leading-tight">{card.label}</p>
          </div>
          {card.bar && (
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${card.bar.color} transition-all duration-700`} style={{ width: `${Math.min(card.bar.pct, 100)}%` }} />
            </div>
          )}
          <p className={`text-[11px] leading-tight ${
            card.accent === 'teal' ? 'text-teal-600' :
            card.accent === 'amber' ? 'text-amber-600' :
            'text-stone-400'
          }`}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}