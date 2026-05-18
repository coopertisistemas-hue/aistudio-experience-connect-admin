import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockPartners } from '@/mocks/admin-experiences';
import type { MockPartner, PartnerStatus } from '@/mocks/admin-experiences';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import PartnersList from './components/PartnersList';
import PartnerDetailDrawer from './components/PartnerDetailDrawer';
import NovoParceiroForm from './components/NovoParceiroForm';

interface Toast { id: number; message: string; type: 'success' | 'info' }

interface Filters {
  search: string;
  status: PartnerStatus | 'all';
}

export default function PartnersPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: 'all' });
  const [selected, setSelected] = useState<MockPartner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
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

  const filtered = useMemo(() => mockPartners.filter((p) => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q) && !p.contact_name.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const activeCount = mockPartners.filter((p) => p.status === 'active').length;

  const STATUS_PILLS: { value: PartnerStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'paused', label: 'Pausados' },
    { value: 'inactive', label: 'Inativos' },
  ];

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        icon="ri-hand-heart-line"
        title="Parceiros"
        subtitle="Hotéis, agências, guias e operadores do ecossistema de experiências."
        badge={`${activeCount} ativos`}
        action={
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-2 h-9 px-3.5 bg-white hover:bg-stone-50 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-download-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button type="button" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-9 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-add-line text-sm"></i>
              Novo Parceiro
            </button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Parceiros ativos', value: mockPartners.filter((p) => p.status === 'active').length, icon: 'ri-hand-heart-line', color: 'text-teal-600', bg: 'bg-teal-500/10' },
          { label: 'Experiências vinculadas', value: mockPartners.reduce((s, p) => s + p.experiences_count, 0), icon: 'ri-compass-discover-line', color: 'text-navy-700', bg: 'bg-navy-50' },
          { label: 'Reservas geradas', value: mockPartners.reduce((s, p) => s + p.bookings_generated, 0), icon: 'ri-calendar-check-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Receita total', value: `R$ ${(mockPartners.reduce((s, p) => s + p.revenue_generated, 0) / 1000).toFixed(0)}k`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-stone-500 font-medium">{c.label}</p>
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${c.bg}`}>
                <i className={`${c.icon} text-sm ${c.color}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-bold font-serif ${c.color}`}>{c.value}</p>
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
            <input type="text" placeholder="Buscar parceiros, cidades, responsáveis..."
              value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
          </div>
          {filters.search && (
            <button type="button" onClick={() => setFilters((p) => ({ ...p, search: '' }))}
              className="h-9 px-3 text-xs text-stone-500 bg-white border border-stone-200 rounded-xl cursor-pointer whitespace-nowrap">
              Limpar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_PILLS.map((pill) => (
            <button key={pill.value} type="button"
              onClick={() => setFilters((p) => ({ ...p, status: pill.value }))}
              className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap
                ${filters.status === pill.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {pill.label}
            </button>
          ))}
        </div>
        {(filters.search || filters.status !== 'all') && (
          <p className="text-[12px] text-stone-500">
            Exibindo <span className="font-semibold text-stone-700">{filtered.length}</span> de {mockPartners.length} parceiros
          </p>
        )}
      </div>

      <PartnersList partners={filtered} onSelect={setSelected} selectedId={selected?.id} loading={loading} />

      {selected && <PartnerDetailDrawer partner={selected} onClose={() => setSelected(null)} />}
      {showForm && (
        <NovoParceiroForm
          onClose={() => setShowForm(false)}
          onSuccess={(draft) => {
            setShowForm(false);
            addToast(draft ? 'Rascunho salvo' : 'Parceiro cadastrado com sucesso');
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