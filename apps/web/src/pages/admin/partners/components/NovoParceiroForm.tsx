import { useState } from 'react';
import { partnerTypeLabels } from '@/services/partners';
import { useCreatePartner } from '@/hooks/usePartners';

interface Props {
  onClose: () => void;
  onSuccess: (draft?: boolean) => void;
  tenantId: string;
}

interface FormData {
  name: string;
  type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  notes: string;
}

const EMPTY: FormData = {
  name: '',
  type: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  city: '',
  state: '',
  notes: '',
};

const PARTNER_TYPES = ['hotel', 'pousada', 'agencia', 'guia', 'experiencia', 'operador_turistico'];

export default function NovoParceiroForm({ onClose, onSuccess, tenantId }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { mutate: createPartner, isPending: saving } = useCreatePartner();

  const set = (k: keyof FormData, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.type) e.type = 'Selecione um tipo';
    if (!form.contact_email.includes('@')) e.contact_email = 'E-mail inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (draft = false) => {
    if (!draft && !validate()) return;

    createPartner({
      tenant_id: tenantId,
      name: form.name,
      partner_type: form.type,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email,
      phone: form.contact_phone || null,
      city: form.city || null,
      state: form.state || null,
      notes: form.notes || null,
      status: draft ? 'inactive' : 'active',
    }, {
      onSuccess: () => onSuccess(draft),
      onError: () => {},
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-stone-800 font-serif">Novo Parceiro</h2>
            <p className="text-xs text-stone-500">Cadastrar parceiro no ecossistema</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Dados */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Dados do Parceiro</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Nome do parceiro *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ex: Hotel Fasano São Paulo"
                  className={`w-full h-9 px-3.5 text-sm bg-white border rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-teal-400'}`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Tipo de parceiro *</label>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className={`w-full h-9 px-3 text-sm bg-white border rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.type ? 'border-red-300' : 'border-stone-200 focus:border-teal-400'}`}
                >
                  <option value="">Selecionar tipo</option>
                  {PARTNER_TYPES.map((t) => (
                    <option key={t} value={t}>{partnerTypeLabels[t]}</option>
                  ))}
                </select>
                {errors.type && <p className="text-[11px] text-red-500 mt-0.5">{errors.type}</p>}
              </div>
            </div>
          </section>

          {/* Contato */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Contato</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Nome do responsável</label>
                <input type="text" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)}
                  placeholder="Nome completo"
                  className="w-full h-9 px-3.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">E-mail *</label>
                <input type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)}
                  placeholder="contato@parceiro.com"
                  className={`w-full h-9 px-3.5 text-sm bg-white border rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.contact_email ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-teal-400'}`} />
                {errors.contact_email && <p className="text-[11px] text-red-500 mt-0.5">{errors.contact_email}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Telefone</label>
                <input type="tel" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="w-full h-9 px-3.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              </div>
            </div>
          </section>

          {/* Localização */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Localização</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Cidade</label>
                <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full h-9 px-3.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Estado</label>
                <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)}
                  placeholder="Ex: SP"
                  className="w-full h-9 px-3.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              </div>
            </div>
          </section>

          {/* Observações */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Observações</h3>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value.slice(0, 500))} rows={3}
              placeholder="Termos da parceria, instruções especiais, contexto..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none" />
            <p className="text-[11px] text-stone-400 mt-0.5">{form.notes.length}/500</p>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button type="button" onClick={onClose} className="h-9 px-4 bg-white hover:bg-stone-100 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            Cancelar
          </button>
          <button type="button" onClick={() => handleSave(true)} disabled={saving}
            className="h-9 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button type="button" onClick={() => handleSave(false)} disabled={saving}
            className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </aside>
    </>
  );
}
