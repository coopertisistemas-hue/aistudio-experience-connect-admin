import { mockExperienceStats } from '@/mocks/admin-experiences';

interface KPICard {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent: string;
  bgAccent: string;
  borderAccent: string;
  textAccent: string;
  subAccent?: string;
}

export default function ExperiencesSummaryStrip() {
  const s = mockExperienceStats;

  const cards: KPICard[] = [
    {
      label: 'Experiências Ativas',
      value: s.active_experiences,
      sub: `de ${s.total_experiences} total`,
      icon: 'ri-compass-discover-line',
      accent: 'bg-teal-500/10',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-teal-600',
      subAccent: 'text-stone-500',
    },
    {
      label: 'Alta Demanda',
      value: s.high_demand,
      sub: 'experiências',
      icon: 'ri-fire-line',
      accent: 'bg-red-50',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-red-500',
      subAccent: 'text-stone-500',
    },
    {
      label: 'Parceiros Ativos',
      value: s.active_partners,
      sub: `de ${s.total_partners} parceiros`,
      icon: 'ri-hand-heart-line',
      accent: 'bg-navy-50',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-[#2d4a63]',
      subAccent: 'text-stone-500',
    },
    {
      label: 'Categorias',
      value: s.total_categories,
      sub: 'configuradas',
      icon: 'ri-price-tag-3-line',
      accent: 'bg-indigo-50',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-indigo-600',
      subAccent: 'text-stone-500',
    },
    {
      label: 'Reservas este Mês',
      value: s.bookings_this_month,
      sub: `${s.total_bookings} total`,
      icon: 'ri-calendar-check-line',
      accent: 'bg-emerald-50',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-emerald-600',
      subAccent: 'text-stone-500',
    },
    {
      label: 'Avaliação Média',
      value: `${s.avg_rating} ★`,
      sub: 'das experiências',
      icon: 'ri-star-line',
      accent: 'bg-amber-50',
      bgAccent: 'bg-white',
      borderAccent: 'border-stone-200',
      textAccent: 'text-amber-600',
      subAccent: 'text-stone-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative overflow-hidden rounded-xl border ${c.borderAccent} ${c.bgAccent} p-4`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] text-stone-500 font-medium leading-tight pr-2">{c.label}</p>
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${c.accent}`}>
              <i className={`${c.icon} text-sm ${c.textAccent}`}></i>
            </div>
          </div>
          <p className={`text-2xl font-bold font-serif tracking-tight ${c.textAccent}`}>{c.value}</p>
          {c.sub && (
            <p className={`text-[11px] mt-0.5 ${c.subAccent ?? 'text-stone-400'}`}>{c.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}