import type { MockExperience, ExperienceStatus, DemandLevel } from '@/mocks/admin-experiences';
import { statusLabels, demandLabels } from '@/mocks/admin-experiences';

interface Props {
  experiences: MockExperience[];
  onSelect: (exp: MockExperience) => void;
  selectedId?: string;
  loading?: boolean;
}

const STATUS_STYLES: Record<ExperienceStatus, { bg: string; text: string; dot: string }> = {
  active:       { bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',  dot: 'bg-teal-500' },
  high_demand:  { bg: 'bg-red-50 border-red-200',     text: 'text-red-600',   dot: 'bg-red-500 animate-pulse' },
  paused:       { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  unavailable:  { bg: 'bg-stone-100 border-stone-200',text: 'text-stone-500', dot: 'bg-stone-400' },
  draft:        { bg: 'bg-indigo-50 border-indigo-200',text:'text-indigo-600', dot: 'bg-indigo-400' },
};

const DEMAND_STYLES: Record<DemandLevel, { text: string; icon: string }> = {
  high:   { text: 'text-red-500',   icon: 'ri-arrow-up-line' },
  medium: { text: 'text-amber-500', icon: 'ri-subtract-line' },
  low:    { text: 'text-stone-400', icon: 'ri-arrow-down-line' },
};

const TAG_COLORS = [
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-stone-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-2/3" />
          <div className="h-3 bg-stone-100 rounded w-1/3" />
        </div>
        <div className="w-20 h-6 bg-stone-100 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-stone-100 rounded-lg" />)}
      </div>
    </div>
  );
}

export default function ExperiencesList({ experiences, onSelect, selectedId, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!experiences.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-4">
          <i className="ri-compass-discover-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-sm font-semibold text-stone-600 mb-1">Nenhuma experiência encontrada</p>
        <p className="text-xs text-stone-400">Tente ajustar os filtros ou crie uma nova experiência.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {experiences.map((exp) => {
        const s = STATUS_STYLES[exp.status];
        const d = DEMAND_STYLES[exp.demand];
        const isSelected = selectedId === exp.id;

        return (
          <button
            key={exp.id}
            type="button"
            onClick={() => onSelect(exp)}
            className={`w-full text-left bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer group
              ${isSelected ? 'border-teal-400 ring-2 ring-teal-300/30' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'}`}
          >
            {/* Top row */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-teal-500/10 border border-teal-200/50 flex-shrink-0">
                <i className="ri-compass-discover-line text-teal-600 text-xl"></i>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-stone-800 group-hover:text-teal-700 transition-colors truncate">
                    {exp.name}
                  </span>
                  {exp.status === 'high_demand' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                      <i className="ri-fire-line text-xs"></i> Alta demanda
                    </span>
                  )}
                  {exp.status === 'draft' && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Rascunho
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="ri-price-tag-3-line text-stone-400"></i>
                    {exp.category_name}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="flex items-center gap-1">
                    <i className="ri-hand-heart-line text-stone-400"></i>
                    {exp.partner_name}
                  </span>
                  {exp.route_name && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span className="flex items-center gap-1">
                        <i className="ri-route-line text-stone-400"></i>
                        {exp.route_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}></span>
                {statusLabels[exp.status]}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Preço base</p>
                <p className="text-sm font-bold text-stone-800">R$ {exp.base_price.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-stone-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Duração</p>
                <p className="text-sm font-bold text-stone-800">{exp.duration_hours}h</p>
              </div>
              <div className="bg-stone-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Reservas</p>
                <p className="text-sm font-bold text-stone-800">{exp.bookings_count}</p>
              </div>
              <div className="bg-stone-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Demanda</p>
                <p className={`text-sm font-bold flex items-center gap-1 ${d.text}`}>
                  <i className={`${d.icon} text-xs`}></i>
                  {demandLabels[exp.demand]}
                </p>
              </div>
            </div>

            {/* Bottom row: tags + rating */}
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {exp.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </span>
                ))}
                {exp.tags.length > 3 && (
                  <span className="text-[11px] text-stone-400">+{exp.tags.length - 3}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-400 flex-shrink-0">
                {exp.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <i className="ri-star-fill text-xs"></i>
                    {exp.rating}
                  </span>
                )}
                <span>Cap. {exp.capacity} pax</span>
                {exp.bookings_this_month > 0 && (
                  <span className="text-teal-600 font-medium">
                    {exp.bookings_this_month} este mês
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}