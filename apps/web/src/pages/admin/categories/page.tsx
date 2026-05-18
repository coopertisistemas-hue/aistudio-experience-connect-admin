import { useState, useEffect, useCallback } from 'react';
import { mockCategories } from '@/mocks/admin-experiences';
import type { MockCategory, DemandLevel, CategoryVisibility } from '@/mocks/admin-experiences';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import CategoriesGrid from './components/CategoriesGrid';
import CategoryDetailDrawer from './components/CategoryDetailDrawer';
import NovaCategoriaForm from './components/NovaCategoriaForm';

interface Toast { id: number; message: string }

type DemandFilter = DemandLevel | 'all';
type VisFilter = CategoryVisibility | 'all';

export default function CategoriesPage() {
  const [selected, setSelected] = useState<MockCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [demandFilter, setDemandFilter] = useState<DemandFilter>('all');
  const [visFilter, setVisFilter] = useState<VisFilter>('all');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) { setShowForm(false); return; }
        if (selected) setSelected(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm, selected]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const filtered = mockCategories.filter((c) => {
    if (demandFilter !== 'all' && c.demand !== demandFilter) return false;
    if (visFilter !== 'all' && c.visibility !== visFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.tags.some((t) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const visibleCount = mockCategories.filter((c) => c.visibility === 'visible').length;
  const totalExps = mockCategories.reduce((s, c) => s + c.experiences_count, 0);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-price-tag-3-line"
        title="Categorias"
        subtitle="Organize experiências e serviços por categorias operacionais e de demanda."
        badge={`${visibleCount} visíveis`}
        action={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-add-line text-sm"></i>
              Nova Categoria
            </button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total de categorias', value: mockCategories.length, icon: 'ri-price-tag-3-line', color: 'text-teal-600', bg: 'bg-teal-500/10' },
          { label: 'Visíveis', value: visibleCount, icon: 'ri-eye-line', color: 'text-navy-700', bg: 'bg-navy-50' },
          { label: 'Experiências vinculadas', value: totalExps, icon: 'ri-compass-discover-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Alta demanda', value: mockCategories.filter((c) => c.demand === 'high').length, icon: 'ri-fire-line', color: 'text-red-500', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-stone-500 font-medium">{item.label}</p>
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${item.bg}`}>
                <i className={`${item.icon} text-sm ${item.color}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-bold font-serif ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <i className="ri-search-line text-stone-400 text-sm"></i>
            </div>
            <input type="text" placeholder="Buscar categorias..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Demand */}
          {([['all', 'Todas'], ['high', 'Alta demanda'], ['medium', 'Média demanda'], ['low', 'Baixa demanda']] as [DemandFilter, string][]).map(([v, label]) => (
            <button key={v} type="button" onClick={() => setDemandFilter(v)}
              className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap
                ${demandFilter === v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {label}
            </button>
          ))}
          <span className="text-stone-300 text-xs">|</span>
          {([['all', 'Qualquer visibilidade'], ['visible', 'Visíveis'], ['hidden', 'Ocultas']] as [VisFilter, string][]).map(([v, label]) => (
            <button key={v} type="button" onClick={() => setVisFilter(v)}
              className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap
                ${visFilter === v ? 'bg-navy-950 text-white border-navy-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse h-44" />
          ))}
        </div>
      ) : (
        <CategoriesGrid categories={filtered} onSelect={setSelected} selectedId={selected?.id} />
      )}

      {selected && (
        <CategoryDetailDrawer category={selected} onClose={() => setSelected(null)} />
      )}

      {showForm && (
        <NovaCategoriaForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            addToast('Categoria criada com sucesso');
          }}
        />
      )}

      {/* Mobile CTA */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        <button type="button" onClick={() => setShowForm(true)} className="w-12 h-12 flex items-center justify-center bg-navy-950 text-white rounded-full shadow-lg cursor-pointer">
          <i className="ri-add-line text-xl"></i>
        </button>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-navy-950 text-white shadow-lg pointer-events-auto">
            <i className="ri-checkbox-circle-line text-teal-400 text-base"></i>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}