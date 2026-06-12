import type { CustomerStats, CustomerDisplay } from '@/services/customers';

interface Props {
  stats?: CustomerStats;
  customers: CustomerDisplay[];
}

const fmt = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace('.', ',')}k` : `R$ ${v.toLocaleString('pt-BR')}`;

interface KpiCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
  pulse?: boolean;
  bar?: number;
}

export default function CustomersSummaryStrip({ stats, customers }: Props) {
  const ativos = customers.filter((c) => c.status !== 'inactive').length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const novos = customers.filter((c) => new Date(c.created_at) >= thisMonth).length;
  const recorrentes = customers.filter((c) => c.is_recurring).length;
  const vip = customers.filter((c) => c.status === 'vip').length;
  const overdue = customers.filter((c) => c.pending_amount > 0).length;
  const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0);
  const totalBookings = customers.reduce((s, c) => s + c.total_bookings, 0);
  const reservasPorCliente = customers.length > 0 ? Math.round(totalBookings / customers.length) : 0;
  const ticketMedio = customers.filter((c) => c.total_spent > 0).length > 0
    ? Math.round(customers.filter((c) => c.total_spent > 0).reduce((s, c) => s + c.ticket_medio, 0) / Math.max(customers.filter((c) => c.total_spent > 0).length, 1))
    : 0;

  const cards: KpiCard[] = [
    {
      label: 'Clientes Ativos',
      value: ativos,
      sub: `${vip} VIP`,
      icon: 'ri-contacts-book-2-line',
      color: 'teal',
    },
    {
      label: 'Novos Clientes',
      value: novos,
      sub: 'este mês',
      icon: 'ri-user-add-line',
      color: 'navy',
    },
    {
      label: 'Recorrentes',
      value: recorrentes,
      sub: `${ativos > 0 ? Math.round((recorrentes / ativos) * 100) : 0}% da base`,
      icon: 'ri-repeat-line',
      color: 'teal',
      bar: ativos > 0 ? Math.round((recorrentes / ativos) * 100) : 0,
    },
    {
      label: 'Reservas / Cliente',
      value: reservasPorCliente,
      sub: 'média',
      icon: 'ri-calendar-check-line',
      color: 'stone',
    },
    {
      label: 'Ticket Médio',
      value: fmt(ticketMedio),
      sub: 'por cliente',
      icon: 'ri-price-tag-3-line',
      color: 'navy',
    },
    {
      label: 'Valor Total',
      value: fmt(totalSpent),
      sub: `${overdue > 0 ? `${overdue} c/ saldo` : 'sem pendências'}`,
      icon: 'ri-money-dollar-circle-line',
      color: overdue > 0 ? 'amber' : 'teal',
      pulse: overdue > 0,
    },
  ];

  const colorMap = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-600', iconBg: 'bg-teal-100/60', value: 'text-teal-700', dot: 'bg-teal-500' },
    navy: { bg: 'bg-slate-50', border: 'border-slate-100', icon: 'text-slate-600', iconBg: 'bg-slate-100/60', value: 'text-slate-700', dot: 'bg-slate-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', iconBg: 'bg-amber-100/60', value: 'text-amber-700', dot: 'bg-amber-500' },
    red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-600', iconBg: 'bg-red-100/60', value: 'text-red-700', dot: 'bg-red-500' },
    stone: { bg: 'bg-stone-50', border: 'border-stone-100', icon: 'text-stone-500', iconBg: 'bg-stone-100/60', value: 'text-stone-700', dot: 'bg-stone-400' },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const cl = colorMap[c.color];
        return (
          <div key={c.label} className={`rounded-xl border ${cl.border} ${cl.bg} p-4 flex flex-col gap-3`}>
            <div className="flex items-start justify-between">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${cl.iconBg}`}>
                <i className={`${c.icon} text-sm ${cl.icon}`}></i>
              </div>
              {c.pulse && (
                <span className={`w-2 h-2 rounded-full ${cl.dot} animate-pulse`}></span>
              )}
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${cl.value}`}>{c.value}</p>
              {c.bar !== undefined && (
                <div className="mt-2 h-1 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${c.bar}%` }}></div>
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-700 leading-tight">{c.label}</p>
              {c.sub && <p className="text-[10px] text-stone-500 mt-0.5">{c.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
