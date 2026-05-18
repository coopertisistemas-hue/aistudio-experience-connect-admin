import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockExperiences } from '@/mocks/admin-experiences';
import type { MockExperience } from '@/mocks/admin-experiences';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import ExperiencesSummaryStrip from './components/ExperiencesSummaryStrip';
import ExperiencesFilterBar from './components/ExperiencesFilterBar';
import type { ExperiencesFilters } from './components/ExperiencesFilterBar';
import ExperiencesList from './components/ExperiencesList';
import ExperienceDetailDrawer from './components/ExperienceDetailDrawer';
import NovaExperienciaForm from './components/NovaExperienciaForm';

interface Toast { id: number; message: string; type: 'success' | 'info' }

const INITIAL_FILTERS: ExperiencesFilters = {
  search: '',
  status: 'all',
  category: 'all',
  partner: 'all',
  demand: 'all',
};

function applyFilters(items: MockExperience[], f: ExperiencesFilters): MockExperience[] {
  return items.filter((e) => {
    if (f.status !== 'all' && e.status !== f.status) return false;
    if (f.category !== 'all' && e.category_name !== f.category) return false;
    if (f.demand !== 'all' && e.demand !== f.demand) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !e.name.toLowerCase().includes(q) &&
        !e.category_name.toLowerCase().includes(q) &&
        !e.partner_name.toLowerCase().includes(q) &&
        !e.tags.some((t) => t.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });
}

export default function ExperiencesPage() {
  const [filters, setFilters] = useState<ExperiencesFilters>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<MockExperience | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
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

  const filtered = useMemo(() => applyFilters(mockExperiences, filters), [filters]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const highDemand = mockExperiences.filter((e) => e.demand === 'high');
  const drafts = mockExperiences.filter((e) => e.status === 'draft');
  const activeCount = mockExperiences.filter((e) => e.status === 'active').length;

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-compass-discover-line"
        title="Experiências"
        subtitle="Catálogo de experiências turísticas premium vinculadas a parceiros e rotas."
        badge={`${activeCount} ativas`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 h-9 px-3.5 bg-white hover:bg-stone-50 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Nova Experiência
            </button>
          </div>
        }
      />

      {/* Alert banners */}
      {highDemand.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
            <i className="ri-fire-line text-red-500 text-sm"></i>
          </div>
          <p className="text-xs text-red-700 flex-1">
            <span className="font-semibold">{highDemand.length} experiência{highDemand.length > 1 ? 's' : ''} em alta demanda</span>
            {' — '}{highDemand.map((e) => e.name).join(', ')}
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: 'high_demand' }))}
            className="text-[11px] font-semibold text-red-600 bg-red-100 hover:bg-red-200 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
            <i className="ri-draft-line text-indigo-500 text-sm"></i>
          </div>
          <p className="text-xs text-indigo-700 flex-1">
            <span className="font-semibold">{drafts.length} rascunho{drafts.length > 1 ? 's' : ''} pendente{drafts.length > 1 ? 's' : ''}</span>
            {' — pronto para publicação'}
          </p>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: 'draft' }))}
            className="text-[11px] font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Revisar
          </button>
        </div>
      )}

      <ExperiencesSummaryStrip />

      <ExperiencesFilterBar
        filters={filters}
        onChange={setFilters}
        total={mockExperiences.length}
        filtered={filtered.length}
      />

      <ExperiencesList
        experiences={filtered}
        onSelect={setSelected}
        selectedId={selected?.id}
        loading={loading}
      />

      {selected && (
        <ExperienceDetailDrawer
          experience={selected}
          onClose={() => setSelected(null)}
          onNewBooking={() => addToast('Redirecionando para nova reserva...')}
        />
      )}

      {showForm && (
        <NovaExperienciaForm
          onClose={() => setShowForm(false)}
          onSuccess={(draft) => {
            setShowForm(false);
            addToast(draft ? 'Rascunho salvo com sucesso' : 'Experiência criada com sucesso');
          }}
        />
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-12 h-12 flex items-center justify-center bg-navy-950 text-white rounded-full shadow-lg cursor-pointer"
        >
          <i className="ri-add-line text-xl"></i>
        </button>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto ${
              t.type === 'success' ? 'bg-navy-950 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line text-teal-400' : 'ri-information-line text-stone-500'}`}></i>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}