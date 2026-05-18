import { useState } from 'react';
import { mockPartners, mockCategories } from '@/mocks/admin-experiences';

interface Props {
  onClose: () => void;
  onSuccess: (draft?: boolean) => void;
}

interface FormData {
  name: string;
  category_id: string;
  partner_id: string;
  description: string;
  duration_hours: string;
  base_price: string;
  capacity: string;
  tags: string;
  notes: string;
}

const PREFERENCE_TAGS = ['executivo', 'aeroporto', 'premium', 'guia', 'gastronomia', 'natureza', 'família', 'acessibilidade', 'bilíngue', 'privativo'];

const EMPTY: FormData = {
  name: '',
  category_id: '',
  partner_id: '',
  description: '',
  duration_hours: '',
  base_price: '',
  capacity: '',
  tags: '',
  notes: '',
};

export default function NovaExperienciaForm({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'draft'>('idle');

  const set = (k: keyof FormData, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.category_id) e.category_id = 'Selecione uma categoria';
    if (!form.partner_id) e.partner_id = 'Selecione um parceiro';
    if (!form.base_price || isNaN(Number(form.base_price))) e.base_price = 'Preço inválido';
    if (!form.duration_hours || isNaN(Number(form.duration_hours))) e.duration_hours = 'Duração inválida';
    if (!form.capacity || isNaN(Number(form.capacity))) e.capacity = 'Capacidade inválida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (draft = false) => {
    if (!draft && !validate()) return;
    setSaving(draft ? 'draft' : 'saving');
    await new Promise((r) => setTimeout(r, 900));
    setSaving('idle');
    onSuccess(draft);
  };

  const activePartners = mockPartners.filter((p) => p.status === 'active');

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-stone-800 font-serif">Nova Experiência</h2>
            <p className="text-xs text-stone-500">Criar nova experiência no catálogo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Dados Principais */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Dados Principais</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Nome da experiência *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ex: Transfer Aeroporto Premium"
                  className={`w-full h-9 px-3.5 text-sm bg-white border rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-teal-400'}`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="Descreva a experiência para os hóspedes..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
                />
                <p className="text-[11px] text-stone-400 mt-0.5">{form.description.length}/500</p>
              </div>
            </div>
          </section>

          {/* Categoria & Parceiro */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Classificação</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Categoria *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className={`w-full h-9 px-3 text-sm bg-white border rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 cursor-pointer ${errors.category_id ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                >
                  <option value="">Selecionar categoria</option>
                  {mockCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-[11px] text-red-500 mt-0.5">{errors.category_id}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Parceiro *</label>
                <select
                  value={form.partner_id}
                  onChange={(e) => set('partner_id', e.target.value)}
                  className={`w-full h-9 px-3 text-sm bg-white border rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 cursor-pointer ${errors.partner_id ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                >
                  <option value="">Selecionar parceiro</option>
                  {activePartners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.partner_id && <p className="text-[11px] text-red-500 mt-0.5">{errors.partner_id}</p>}
              </div>
            </div>
          </section>

          {/* Operação */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Operação</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Preço base *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">R$</span>
                  <input
                    type="number"
                    value={form.base_price}
                    onChange={(e) => set('base_price', e.target.value)}
                    placeholder="0"
                    className={`w-full h-9 pl-8 pr-2 text-sm bg-white border rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.base_price ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                  />
                </div>
                {errors.base_price && <p className="text-[11px] text-red-500 mt-0.5">{errors.base_price}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Duração (h) *</label>
                <input
                  type="number"
                  value={form.duration_hours}
                  onChange={(e) => set('duration_hours', e.target.value)}
                  placeholder="Ex: 2"
                  className={`w-full h-9 px-3 text-sm bg-white border rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.duration_hours ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                />
                {errors.duration_hours && <p className="text-[11px] text-red-500 mt-0.5">{errors.duration_hours}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Capacidade *</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                  placeholder="Pax"
                  className={`w-full h-9 px-3 text-sm bg-white border rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.capacity ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                />
                {errors.capacity && <p className="text-[11px] text-red-500 mt-0.5">{errors.capacity}</p>}
              </div>
            </div>
          </section>

          {/* Tags/Preferências */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Características</h3>
            <div className="flex flex-wrap gap-2">
              {PREFERENCE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap
                    ${selectedTags.includes(tag)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-2">{selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selecionada{selectedTags.length !== 1 ? 's' : ''}</p>
          </section>

          {/* Observações */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Observações</h3>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Notas internas, instruções para motoristas, informações de contato..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
            />
            <p className="text-[11px] text-stone-400 mt-0.5">{form.notes.length}/500</p>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-white hover:bg-stone-100 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving !== 'idle'}
            className="h-9 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {saving === 'draft' ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving !== 'idle'}
            className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {saving === 'saving' ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </aside>
    </>
  );
}