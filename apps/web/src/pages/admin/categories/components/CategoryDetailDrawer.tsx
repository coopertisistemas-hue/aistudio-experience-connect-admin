import { useState } from 'react';
import type { MockCategory } from '@/mocks/admin-experiences';
import { mockExperiences } from '@/mocks/admin-experiences';

interface Props {
  category: MockCategory;
  onClose: () => void;
}

type Tab = 'perfil' | 'vinculos' | 'observacoes';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'perfil',      label: 'Perfil',      icon: 'ri-information-line' },
  { id: 'vinculos',    label: 'Vínculos',    icon: 'ri-links-line' },
  { id: 'observacoes', label: 'Observações', icon: 'ri-sticky-note-line' },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; text: string; border: string }> = {
  teal:    { bg: 'bg-teal-500/10',   icon: 'text-teal-600',   text: 'text-teal-700',   border: 'border-teal-200' },
  navy:    { bg: 'bg-navy-50',       icon: 'text-[#2d4a63]',  text: 'text-[#2d4a63]',  border: 'border-navy-200' },
  emerald: { bg: 'bg-emerald-500/10',icon: 'text-emerald-600',text: 'text-emerald-700',border: 'border-emerald-200' },
  wine:    { bg: 'bg-rose-500/10',   icon: 'text-rose-600',   text: 'text-rose-700',   border: 'border-rose-200' },
  slate:   { bg: 'bg-slate-100',     icon: 'text-slate-600',  text: 'text-slate-700',  border: 'border-slate-200' },
  amber:   { bg: 'bg-amber-500/10',  icon: 'text-amber-600',  text: 'text-amber-700',  border: 'border-amber-200' },
  sky:     { bg: 'bg-sky-500/10',    icon: 'text-sky-600',    text: 'text-sky-700',    border: 'border-sky-200' },
};

function PerfilTab({ cat }: { cat: MockCategory }) {
  const c = COLOR_MAP[cat.color] ?? COLOR_MAP.teal;
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
        <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-white border ${c.border} mb-3`}>
          <i className={`${cat.icon} text-2xl ${c.icon}`}></i>
        </div>
        <h3 className={`text-base font-bold font-serif mb-1 ${c.text}`}>{cat.name}</h3>
        <p className="text-sm text-stone-600 leading-relaxed">{cat.description}</p>
      </div>

      {/* Details */}
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Slug', value: cat.slug, icon: 'ri-link-m' },
          { label: 'Demanda', value: cat.demand === 'high' ? 'Alta' : cat.demand === 'medium' ? 'Média' : 'Baixa', icon: 'ri-bar-chart-grouped-line' },
          { label: 'Visibilidade', value: cat.visibility === 'visible' ? 'Visível' : 'Oculta', icon: 'ri-eye-line' },
          { label: 'Ordem', value: `#${cat.sort_order}`, icon: 'ri-sort-desc' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-24 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl border ${c.border} ${c.bg} p-4 text-center`}>
          <p className={`text-2xl font-bold font-serif ${c.text}`}>{cat.experiences_count}</p>
          <p className="text-xs text-stone-500 mt-0.5">Experiências</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-serif text-stone-800">{cat.bookings_count}</p>
          <p className="text-xs text-stone-500 mt-0.5">Reservas</p>
        </div>
      </div>
    </div>
  );
}

function VinculosTab({ cat }: { cat: MockCategory }) {
  const linked = mockExperiences.filter((e) => e.category_id === cat.id);
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Experiências nesta categoria
          <span className="ml-2 bg-teal-100 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{linked.length}</span>
        </p>
        {linked.length === 0 ? (
          <p className="text-sm text-stone-400">Nenhuma experiência vinculada ainda.</p>
        ) : (
          <div className="space-y-2">
            {linked.map((exp) => (
              <div key={exp.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-teal-50 flex-shrink-0">
                  <i className="ri-compass-discover-line text-teal-600 text-xs"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{exp.name}</p>
                  <p className="text-[11px] text-stone-500">{exp.partner_name} · R$ {exp.base_price.toLocaleString('pt-BR')}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  exp.status === 'active' ? 'bg-teal-50 text-teal-700' :
                  exp.status === 'high_demand' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'
                }`}>
                  {exp.status === 'active' ? 'Ativa' : exp.status === 'high_demand' ? 'Alta demanda' : exp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Tags da categoria</p>
        <div className="flex flex-wrap gap-2">
          {cat.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ObservacoesTab() {
  const [note, setNote] = useState('');
  return (
    <div className="space-y-4">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <p className="text-xs text-stone-500 leading-relaxed">Use este espaço para registrar diretrizes operacionais, instruções para criação de experiências nesta categoria ou critérios de seleção de parceiros.</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Observação</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={4}
          placeholder="Notas operacionais desta categoria..."
          className="w-full px-3.5 py-3 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400">{note.length}/500</span>
          <button type="button" className="h-8 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetailDrawer({ category, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('perfil');
  const c = COLOR_MAP[category.color] ?? COLOR_MAP.teal;

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${c.bg} border ${c.border} flex-shrink-0`}>
              <i className={`${category.icon} ${c.icon} text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{category.name}</p>
              <p className="text-[11px] text-stone-500">{category.experiences_count} experiências</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-stone-200 flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap
                ${tab === t.id ? 'text-teal-700 border-teal-500' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
              <i className={`${t.icon} text-xs`}></i>{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'perfil'      && <PerfilTab cat={category} />}
          {tab === 'vinculos'    && <VinculosTab cat={category} />}
          {tab === 'observacoes' && <ObservacoesTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button type="button" className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
            <i className="ri-compass-discover-line text-sm"></i>
            Nova Experiência
          </button>
          <button type="button" className={`h-9 px-3 ${c.bg} border ${c.border} ${c.text} text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap`}>
            <i className="ri-eye-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-navy-950 hover:bg-navy-900 text-white text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-edit-line text-sm"></i>
          </button>
        </div>
      </aside>
    </>
  );
}