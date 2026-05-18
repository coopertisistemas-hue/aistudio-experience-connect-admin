interface StripCard {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

interface NotificationsSummaryStripProps {
  unread: number;
  critical: number;
  warning: number;
  resolvedToday: number;
  paymentAlerts: number;
  opConflicts: number;
}

export default function NotificationsSummaryStrip({
  unread,
  critical,
  warning,
  resolvedToday,
  paymentAlerts,
  opConflicts,
}: NotificationsSummaryStripProps) {
  const cards: StripCard[] = [
    {
      label: 'Não lidas',
      value: unread,
      icon: 'ri-notification-3-line',
      colorClass: 'text-navy-700',
      bgClass: 'bg-navy-50',
      borderClass: 'border-navy-100',
    },
    {
      label: 'Críticas',
      value: critical,
      icon: 'ri-alarm-warning-line',
      colorClass: 'text-red-600',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-100',
    },
    {
      label: 'Em atenção',
      value: warning,
      icon: 'ri-alert-line',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-100',
    },
    {
      label: 'Resolvidas hoje',
      value: resolvedToday,
      icon: 'ri-checkbox-circle-line',
      colorClass: 'text-teal-600',
      bgClass: 'bg-teal-50',
      borderClass: 'border-teal-100',
    },
    {
      label: 'Alertas de pag.',
      value: paymentAlerts,
      icon: 'ri-secure-payment-line',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-100',
    },
    {
      label: 'Conflitos oper.',
      value: opConflicts,
      icon: 'ri-tools-line',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-stone-200 rounded-2xl px-4 py-3.5 hover:border-stone-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${card.bgClass} border ${card.borderClass}`}>
              <i className={`${card.icon} text-sm ${card.colorClass}`}></i>
            </div>
            <span className={`text-2xl font-semibold ${card.value === 0 ? 'text-stone-300' : card.colorClass}`}>
              {card.value}
            </span>
          </div>
          <p className="text-stone-400 text-[11px] font-medium leading-tight">{card.label}</p>
        </div>
      ))}
    </div>
  );
}