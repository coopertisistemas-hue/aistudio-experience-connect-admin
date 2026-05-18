import { mockReconciliationStats } from '@/mocks/admin-receivables';

export default function ReconciliationSummaryStrip() {
  const s = mockReconciliationStats;

  const cards = [
    {
      label: 'Conciliadas',
      value: s.reconciled,
      sub: `de ${s.total} transações`,
      icon: 'ri-checkbox-circle-line',
      accent: 'bg-teal-500/10',
      textAccent: 'text-teal-700',
      iconColor: 'text-teal-600',
      bar: { pct: Math.round((s.reconciled / s.total) * 100), color: 'bg-teal-500' },
    },
    {
      label: 'Pendentes',
      value: s.pending,
      sub: 'aguardando liquidação',
      icon: 'ri-time-line',
      accent: 'bg-indigo-50',
      textAccent: 'text-indigo-700',
      iconColor: 'text-indigo-500',
      bar: null,
    },
    {
      label: 'Divergências',
      value: s.divergent,
      sub: s.divergent > 0 ? `R$ ${(s.total_divergence).toLocaleString('pt-BR')} em risco` : 'sem divergências',
      icon: 'ri-error-warning-line',
      accent: s.divergent > 0 ? 'bg-amber-50' : 'bg-stone-100',
      textAccent: s.divergent > 0 ? 'text-amber-700' : 'text-stone-500',
      iconColor: s.divergent > 0 ? 'text-amber-500' : 'text-stone-400',
      bar: null,
    },
    {
      label: 'Estornos',
      value: s.reversed,
      sub: 'processados',
      icon: 'ri-arrow-go-back-line',
      accent: 'bg-red-50',
      textAccent: 'text-red-600',
      iconColor: 'text-red-500',
      bar: null,
    },
    {
      label: 'Processamento',
      value: `${s.avg_processing_hours}h`,
      sub: 'tempo médio',
      icon: 'ri-timer-line',
      accent: 'bg-sky-50',
      textAccent: 'text-sky-700',
      iconColor: 'text-sky-500',
      bar: null,
    },
    {
      label: 'Taxa de Conciliação',
      value: `${s.rate}%`,
      sub: 'do período',
      icon: 'ri-pie-chart-2-line',
      accent: s.rate >= 80 ? 'bg-emerald-50' : 'bg-amber-50',
      textAccent: s.rate >= 80 ? 'text-emerald-700' : 'text-amber-700',
      iconColor: s.rate >= 80 ? 'text-emerald-600' : 'text-amber-500',
      bar: { pct: s.rate, color: s.rate >= 80 ? 'bg-emerald-500' : 'bg-amber-500' },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] text-stone-500 font-medium leading-tight pr-2">{c.label}</p>
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${c.accent}`}>
              <i className={`${c.icon} text-sm ${c.iconColor}`}></i>
            </div>
          </div>
          <p className={`text-xl font-bold font-serif tracking-tight ${c.textAccent}`}>{c.value}</p>
          {c.sub && <p className="text-[11px] mt-0.5 text-stone-400">{c.sub}</p>}
          {c.bar && (
            <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full ${c.bar.color} rounded-full transition-all duration-700`} style={{ width: `${c.bar.pct}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}