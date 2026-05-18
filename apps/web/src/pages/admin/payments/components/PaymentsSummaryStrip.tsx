import { mockPaymentStats } from '@/mocks/admin-payments';

function fmt(n: number) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

export default function PaymentsSummaryStrip() {
  const s = mockPaymentStats;

  const cards = [
    {
      label: 'Receita Confirmada',
      value: fmt(s.receita_confirmada),
      sub: 'pagamentos confirmados',
      icon: 'ri-checkbox-circle-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      accent: 'teal' as const,
    },
    {
      label: 'Pendentes',
      value: fmt(s.pendentes),
      sub: `${s.pending_count} pagamento${s.pending_count !== 1 ? 's' : ''} aguardando`,
      icon: 'ri-time-line',
      iconBg: 'bg-amber-500/[0.08]',
      iconColor: 'text-amber-600',
      accent: s.pending_count > 0 ? 'amber' as const : 'stone' as const,
      pulse: s.pending_count > 0,
    },
    {
      label: 'Atrasados',
      value: fmt(s.atrasados),
      sub: `${s.overdue_count} em atraso`,
      icon: 'ri-alarm-warning-line',
      iconBg: s.overdue_count > 0 ? 'bg-red-500/[0.08]' : 'bg-stone-100',
      iconColor: s.overdue_count > 0 ? 'text-red-500' : 'text-stone-400',
      accent: s.overdue_count > 0 ? 'red' as const : 'stone' as const,
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${s.ticket_medio.toLocaleString('pt-BR')}`,
      sub: 'por reserva paga',
      icon: 'ri-receipt-line',
      iconBg: 'bg-navy-950/[0.06]',
      iconColor: 'text-[#1e3a5f]',
      accent: 'navy' as const,
    },
    {
      label: 'Reembolsos',
      value: fmt(s.reembolsos),
      sub: 'estornos processados',
      icon: 'ri-refund-2-line',
      iconBg: 'bg-stone-100',
      iconColor: 'text-stone-500',
      accent: 'stone' as const,
    },
    {
      label: 'Taxa de Conversão',
      value: `${s.taxa_conversao}%`,
      sub: 'reservas pagas',
      icon: 'ri-pie-chart-line',
      iconBg: 'bg-teal-500/[0.08]',
      iconColor: 'text-teal-600',
      accent: 'teal' as const,
      bar: { pct: s.taxa_conversao, color: s.taxa_conversao >= 70 ? 'bg-teal-500' : 'bg-amber-400' },
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
            {'pulse' in card && card.pulse && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
            {card.accent === 'red' && <span className="w-2 h-2 rounded-full bg-red-400"></span>}
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-stone-900 leading-none">{card.value}</p>
            <p className="text-stone-500 text-[11px] mt-1 leading-tight">{card.label}</p>
          </div>
          {'bar' in card && card.bar && (
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${card.bar.color} transition-all duration-700`} style={{ width: `${Math.min(card.bar.pct, 100)}%` }} />
            </div>
          )}
          <p className={`text-[11px] leading-tight ${
            card.accent === 'teal' ? 'text-teal-600' :
            card.accent === 'amber' ? 'text-amber-600' :
            card.accent === 'red' ? 'text-red-500' :
            card.accent === 'navy' ? 'text-[#1e3a5f]' :
            'text-stone-400'
          }`}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}