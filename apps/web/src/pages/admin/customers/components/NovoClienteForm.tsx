import { useState } from 'react';
import { useCreateCustomer } from '@/hooks/useCustomers';
import type { CustomerPreference } from '@/services/customers';
import { preferenceLabels, preferenceIcons } from '@/mocks/admin-customers';

interface NovoClienteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
}

const allPreferences: CustomerPreference[] = [
  'aeroporto', 'hotel', 'executivo', 'turismo', 'familia', 'acessibilidade', 'ingles', 'espanhol', 'bagagem_extra',
];

const prefColors: Record<CustomerPreference, string> = {
  aeroporto: 'border-sky-300 bg-sky-50 text-sky-700',
  hotel: 'border-indigo-300 bg-indigo-50 text-indigo-700',
  executivo: 'border-slate-300 bg-slate-100 text-slate-700',
  turismo: 'border-teal-300 bg-teal-50 text-teal-700',
  familia: 'border-rose-300 bg-rose-50 text-rose-700',
  acessibilidade: 'border-purple-300 bg-purple-50 text-purple-700',
  ingles: 'border-green-300 bg-green-50 text-green-700',
  espanhol: 'border-orange-300 bg-orange-50 text-orange-700',
  bagagem_extra: 'border-stone-300 bg-stone-100 text-stone-600',
};

interface FormState {
  name: string;
  email: string;
  phone: string;
  document: string;
  nationality: string;
  language: string;
  preferences: CustomerPreference[];
  notes: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  document: '',
  nationality: 'Brasileiro',
  language: 'Português',
  preferences: [],
  notes: '',
};

type Section = 'dados' | 'contato' | 'documento' | 'preferencias' | 'observacoes';

const sections: { key: Section; label: string; icon: string }[] = [
  { key: 'dados', label: 'Dados Pessoais', icon: 'ri-user-3-line' },
  { key: 'contato', label: 'Contato', icon: 'ri-phone-line' },
  { key: 'documento', label: 'Documento', icon: 'ri-id-card-line' },
  { key: 'preferencias', label: 'Preferências', icon: 'ri-heart-3-line' },
  { key: 'observacoes', label: 'Observações', icon: 'ri-sticky-note-line' },
];

export default function NovoClienteForm({ onClose, onSuccess, tenantId }: NovoClienteFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { mutate: createCustomer, isPending: saving } = useCreateCustomer();

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const togglePref = (pref: CustomerPreference) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(pref)
        ? f.preferences.filter((p) => p !== pref)
        : [...f.preferences, pref],
    }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.email.trim()) e.email = 'E-mail obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.phone.trim()) e.phone = 'Telefone obrigatório';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    createCustomer({
      id: crypto.randomUUID(),
      email: form.email,
      phone: form.phone,
      full_name: form.name,
      status: 'active',
      preferences: form.preferences,
      metadata: {
        document: form.document || undefined,
        nationality: form.nationality,
        language: form.language,
        notes: form.notes || undefined,
      },
    }, {
      onSuccess: () => onSuccess(),
      onError: () => {},
    });
  };

  const inputCls = (field: keyof FormState) =>
    `w-full bg-stone-50 border rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400 outline-none transition-all focus:bg-white focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-stone-200 focus:border-teal-300 focus:ring-teal-100'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-stone-950/40" onClick={onClose}></div>
      <div className="relative ml-auto w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">Novo Cliente</h2>
            <p className="text-xs text-stone-500 mt-0.5">Cadastro de hóspede / passageiro</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {sections.map((sec) => (
            <div key={sec.key}>
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-md bg-teal-50 border border-teal-100">
                  <i className={`${sec.icon} text-teal-600 text-xs`}></i>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">{sec.label}</span>
                <div className="flex-1 h-px bg-stone-100"></div>
              </div>

              {/* Dados Pessoais */}
              {sec.key === 'dados' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nome completo <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Ex: Eduardo Tavares"
                      className={inputCls('name')}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nacionalidade</label>
                      <input
                        type="text"
                        value={form.nationality}
                        onChange={(e) => update('nationality', e.target.value)}
                        placeholder="Brasileiro"
                        className={inputCls('nationality')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Idioma</label>
                      <select
                        value={form.language}
                        onChange={(e) => update('language', e.target.value)}
                        className={inputCls('language')}
                      >
                        <option>Português</option>
                        <option>Inglês</option>
                        <option>Espanhol</option>
                        <option>Francês</option>
                        <option>Alemão</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Contato */}
              {sec.key === 'contato' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">E-mail <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="nome@email.com"
                      className={inputCls('email')}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    <p className="text-[10px] text-stone-400 mt-1">Usado para comunicação e link de pagamento.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Telefone / WhatsApp <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+55 21 99999-0000"
                      className={inputCls('phone')}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    <p className="text-[10px] text-stone-400 mt-1">Formato internacional recomendado.</p>
                  </div>
                </div>
              )}

              {/* Documento */}
              {sec.key === 'documento' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">CPF / Passaporte</label>
                    <input
                      type="text"
                      value={form.document}
                      onChange={(e) => update('document', e.target.value)}
                      placeholder="000.000.000-00"
                      className={inputCls('document')}
                    />
                    <p className="text-[10px] text-stone-400 mt-1">Opcional — utilizado em contratos e comprovantes.</p>
                  </div>
                </div>
              )}

              {/* Preferências */}
              {sec.key === 'preferencias' && (
                <div>
                  <p className="text-[11px] text-stone-500 mb-3">Selecione as preferências de serviço do hóspede.</p>
                  <div className="flex flex-wrap gap-2">
                    {allPreferences.map((pref) => {
                      const active = form.preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePref(pref)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                            ${active ? prefColors[pref] + ' ring-1 ring-offset-1 ring-teal-300' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'}`}
                        >
                          <i className={`${preferenceIcons[pref]} text-xs`}></i>
                          {preferenceLabels[pref]}
                          {active && <i className="ri-check-line text-xs ml-0.5"></i>}
                        </button>
                      );
                    })}
                  </div>
                  {form.preferences.length > 0 && (
                    <p className="text-[10px] text-teal-600 mt-2">{form.preferences.length} preferência(s) selecionada(s)</p>
                  )}
                </div>
              )}

              {/* Observações */}
              {sec.key === 'observacoes' && (
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Observações</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) update('notes', e.target.value);
                    }}
                    rows={4}
                    placeholder="Informações adicionais sobre o hóspede, preferências especiais, necessidades de acessibilidade…"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400 outline-none resize-none focus:bg-white focus:border-teal-300 focus:ring-1 focus:ring-teal-100 transition-all"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-stone-400">Máximo 500 caracteres.</p>
                    <p className={`text-[10px] ${form.notes.length > 450 ? 'text-amber-500' : 'text-stone-400'}`}>
                      {form.notes.length}/500
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 border-t border-stone-200 px-5 py-4 bg-white flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-stone-200 bg-stone-50 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                Salvando…
              </>
            ) : (
              <>
                <i className="ri-user-add-line text-sm"></i>
                Salvar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
