import type { MockCategory, DemandLevel, CategoryVisibility } from '@/mocks/admin-experiences';
import { demandLabels } from '@/mocks/admin-experiences';

interface Props {
  categories: MockCategory[];
  onSelect: (c: MockCategory) => void;
  selectedId?: string;
}

const COLOR_MAP: Record<string, { ring: string; bg: string; icon: string; text: string }> = {
  teal:    { ring: 'border-teal-300',   bg: 'bg-teal-500/10',   icon: 'text-teal-600',   text: 'text-teal-700' },
  navy:    { ring: 'border-navy-300',   bg: 'bg-navy-50',       icon: 'text-[#2d4a63]',  text: 'text-[#2d4a63]' },
  emerald: { ring: 'border-emerald-300',bg: 'bg-emerald-500/10',icon: 'text-emerald-600',text: 'text-emerald-700' },
  wine:    { ring: 'border-rose-300',   bg: 'bg-rose-500/10',   icon: 'text-rose-600',   text: 'text-rose-700' },
  slate:   { ring: 'border-slate-300',  bg: 'bg-slate-100',     icon: 'text-slate-600',  text: 'text-slate-700' },
  amber:   { ring: 'border-amber-300',  bg: 'bg-amber-500/10',  icon: 'text-amber-600',  text: 'text-amber-700' },
  sky:     { ring: 'border-sky-300',    bg: 'bg-sky-500/10',    icon: 'text-sky-600',    text: 'text-sky-700' },
};

const DEMAND_STYLES: Record<DemandLevel, { text: string; icon: string; label: string }> = {
  high:   { text: 'text-red-500',   icon: 'ri-arrow-up-line',    label: 'Alta demanda' },
  medium: { text: 'text-amber-500', icon: 'ri-subtract-line',    label: 'Demanda média' },
  low:    { text: 'text-stone-400', icon: 'ri-arrow-down-line',  label: 'Baixa demanda' },
};

const VIS_STYLES: Record<CategoryVisibility, { text: string; bg: string; label: string }> = {
  visible: { text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', label: 'Visível' },
  hidden:  { text: 'text-stone-500',bg: 'bg-stone-100 border-stone-200',label: 'Oculta' },
};

export default function CategoriesGrid({ categories, onSelect, selectedId }: Props) {
  if (!categories.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-4">
          <i className="ri-price-tag-3-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-sm font-semibold text-stone-600 mb-1">Nenhuma categoria encontrada</p>
        <p className="text-xs text-stone-400">Crie categorias para organizar as experiências.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const c = COLOR_MAP[cat.color] ?? COLOR_MAP.teal;
        const d = DEMAND_STYLES[cat.demand];
        const v = VIS_STYLES[cat.visibility];
        const isSelected = selectedId === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat)}
            className={`w-full text-left bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer group
              ${isSelected ? 'border-teal-400 ring-2 ring-teal-300/30' : `${c.ring} hover:shadow-sm`}`}
          >
            {/* Icon + name */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${c.bg} flex-shrink-0`}>
                <i className={`${cat.icon} text-xl ${c.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold group-hover:${c.text} transition-colors truncate font-serif`}>{cat.name}</p>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-stone-800 font-serif">{cat.experiences_count}</p>
                <p className="text-[10px] text-stone-500">Experiências</p>
              </div>
              <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-stone-800 font-serif">{cat.bookings_count}</p>
                <p className="text-[10px] text-stone-500">Reservas</p>
              </div>
            </div>

            {/* Bottom strip */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className={`${d.icon} text-[11px] ${d.text}`}></i>
                </div>
                <span className={`text-[11px] font-medium ${d.text}`}>{d.label}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${v.bg} ${v.text}`}>
                {v.label}
              </span>
            </div>

            {/* Tags */}
            {cat.tags.length > 0 && (
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {cat.tags.map((tag) => (
                  <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.bg} ${c.text} border ${c.ring}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}