import { partnerTypeLabels } from '@/services/partners';
import type { PartnerDisplay } from '@/services/partners';

interface Props {
  partners: PartnerDisplay[];
  onSelect: (p: PartnerDisplay) => void;
  selectedId?: string;
  loading?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active:   { bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',  dot: 'bg-teal-500' },
  paused:   { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  inactive: { bg: 'bg-stone-100 border-stone-200',text: 'text-stone-500', dot: 'bg-stone-400' },
};

const TYPE_ICONS: Record<string, string> = {
  hotel:               'ri-hotel-line',
  pousada:             'ri-home-heart-line',
  agencia:             'ri-building-2-line',
  guia:                'ri-user-star-line',
  experiencia:         'ri-compass-discover-line',
  operador_turistico:  'ri-map-pin-2-line',
};

const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-navy-600',
  'bg-indigo-500',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-rose-500',
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-stone-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-2/3" />
          <div className="h-3 bg-stone-100 rounded w-1/3" />
        </div>
        <div className="w-16 h-6 bg-stone-100 rounded-full" />
      </div>
    </div>
  );
}

export default function PartnersList({ partners, onSelect, selectedId, loading }: Props) {
  if (loading) return <div className="space-y-3">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>;

  if (!partners.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-4">
          <i className="ri-hand-heart-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-sm font-semibold text-stone-600 mb-1">Nenhum parceiro encontrado</p>
        <p className="text-xs text-stone-400">Ajuste os filtros ou cadastre um novo parceiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {partners.map((p, idx) => {
        const s = STATUS_STYLES[p.status] || STATUS_STYLES.inactive;
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
        const initials = p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
        const isSelected = selectedId === p.id;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={`w-full text-left bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer group
              ${isSelected ? 'border-teal-400 ring-2 ring-teal-300/30' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'}`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${avatarColor} text-white font-bold text-sm flex-shrink-0`}>
                {initials}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800 group-hover:text-teal-700 transition-colors truncate">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${TYPE_ICONS[p.type] || 'ri-building-line'} text-[10px]`}></i>
                    </div>
                    {partnerTypeLabels[p.type] || p.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line text-stone-400"></i>
                    {p.city}, {p.state}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span>{p.contact_name}</span>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                {p.status === 'active' ? 'Ativo' : p.status === 'paused' ? 'Pausado' : 'Inativo'}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-stone-50 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Experiências</p>
                <p className="text-sm font-bold text-stone-800">{p.experiences_count}</p>
              </div>
              <div className="bg-stone-50 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-0.5">Reservas</p>
                <p className="text-sm font-bold text-stone-800">{p.bookings_generated}</p>
              </div>
              <div className="bg-teal-50 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-teal-600 uppercase tracking-wide font-medium mb-0.5">Receita</p>
                <p className="text-sm font-bold text-teal-700">
                  {p.revenue_generated > 0 ? `R$ ${(p.revenue_generated / 1000).toFixed(0)}k` : '—'}
                </p>
              </div>
            </div>

            {/* Tags + contact strip */}
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {p.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 text-[11px] font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <i className="ri-mail-line text-xs"></i>
                  {p.contact_email}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
