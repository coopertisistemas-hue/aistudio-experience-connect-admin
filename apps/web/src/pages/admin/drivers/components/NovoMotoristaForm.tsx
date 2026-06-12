import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateDriver } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';

interface NovoMotoristaFormProps {
  onClose: () => void;
  onSave: (sendInvite?: boolean) => void;
}

type FormSection = 'pessoal' | 'contato' | 'acesso' | 'veiculo';

const sections: { id: FormSection; label: string; icon: string }[] = [
  { id: 'pessoal', label: 'Dados Pessoais', icon: 'ri-user-line' },
  { id: 'contato', label: 'Contato',        icon: 'ri-phone-line' },
  { id: 'acesso',  label: 'Acesso App',     icon: 'ri-smartphone-line' },
  { id: 'veiculo', label: 'Veículo',        icon: 'ri-car-line' },
];

const licenseTypes = ['B', 'C', 'D', 'E', 'AB', 'AD'];

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  licenseType?: string;
}

export default function NovoMotoristaForm({ onClose, onSave }: NovoMotoristaFormProps) {
  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';
  const createDriver = useCreateDriver();
  const { data: vehicles = [] } = useVehicles(tenantId);

  const [activeSection, setActiveSection] = useState<FormSection>('pessoal');
  const [saving, setSaving] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notes, setNotes] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseType: 'D',
    vehicle: '',
    notes: '',
  });

  const vehicleOptions = [
    { value: '', label: 'Nenhum (vincular depois)' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.name} — ${v.plate || 's/ placa'} (${v.type})`,
    })),
  ];

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Nome obrigatório';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'E-mail válido obrigatório';
    if (!form.phone.trim()) errs.phone = 'Telefone obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (withInvite: boolean) => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createDriver.mutateAsync({
        tenant_id: tenantId,
        name: form.fullName,
        email: form.email || null,
        phone: form.phone || null,
        license_type: form.licenseType,
        default_vehicle_id: form.vehicle || null,
        notes: notes || null,
        status: 'pending',
      });
      setSaving(false);
      onSave(withInvite);
    } catch (err) {
      setSaving(false);
      setSaveError('Erro ao salvar motorista. Tente novamente.');
    }
  };

  const notesMax = 500;

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Novo Motorista</h2>
            <p className="text-[11px] text-navy-400 mt-0.5">Cadastrar e convidar um novo motorista para a operação</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Section pills */}
        <div className="flex gap-0.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveSection(s.id);
                const el = document.getElementById(`nmf-${s.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeSection === s.id
                  ? 'bg-navy-950 text-white'
                  : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <i className={`${s.icon} text-xs`}></i>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* ── Dados Pessoais ── */}
          <div id="nmf-pessoal">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-user-line"></i> Dados Pessoais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do motorista"
                  value={form.fullName}
                  onChange={(e) => { set('fullName', e.target.value); setErrors((r) => ({ ...r, fullName: undefined })); }}
                  className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all ${errors.fullName ? 'border-red-300' : 'border-sand-200'}`}
                />
                {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Tipo de CNH <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {licenseTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('licenseType', type)}
                      className={`w-12 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        form.licenseType === type
                          ? 'bg-navy-950 text-white border-navy-950'
                          : 'bg-sand-50 text-navy-700 border-sand-200 hover:border-sand-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-navy-400 mt-1.5">Para vans e ônibus, exige-se no mínimo CNH tipo D.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">Observações</label>
                <textarea
                  rows={3}
                  maxLength={notesMax}
                  placeholder="Especialidades, restrições, informações relevantes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-navy-400">{notes.length}/{notesMax}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Contato ── */}
          <div id="nmf-contato">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-phone-line"></i> Informações de Contato
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="motorista@email.com"
                  value={form.email}
                  onChange={(e) => { set('email', e.target.value); setErrors((r) => ({ ...r, email: undefined })); }}
                  className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all ${errors.email ? 'border-red-300' : 'border-sand-200'}`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                <p className="text-[10px] text-navy-400 mt-1">Usado para envio do convite de acesso ao App.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Telefone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+55 21 99999-9999"
                  value={form.phone}
                  onChange={(e) => { set('phone', e.target.value); setErrors((r) => ({ ...r, phone: undefined })); }}
                  className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all ${errors.phone ? 'border-red-300' : 'border-sand-200'}`}
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* ── Acesso App ── */}
          <div id="nmf-acesso">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-smartphone-line"></i> Acesso ao App do Motorista
            </h3>

            <div className="bg-navy-50 border border-navy-100 rounded-xl px-4 py-4 mb-4 flex items-start gap-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-navy-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-800 mb-1">Motoristas operam exclusivamente pelo App</p>
                <p className="text-[11px] text-navy-500 leading-relaxed">
                  O painel web gerencia o cadastro, disponibilidade e atribuições. As operações diárias — aceitar transfers, confirmar chegadas e registrar finalizações — são feitas pelo App do Motorista.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSendInvite((v) => !v)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                sendInvite
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-sand-50 border-sand-200'
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded border-2 flex-shrink-0 transition-all ${
                sendInvite
                  ? 'bg-teal-500 border-teal-500'
                  : 'border-sand-300 bg-white'
              }`}>
                {sendInvite && <i className="ri-check-line text-white text-xs"></i>}
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold ${sendInvite ? 'text-teal-800' : 'text-navy-700'}`}>
                  Enviar convite de acesso após salvar
                </p>
                <p className="text-[10px] text-navy-400 mt-0.5">
                  O motorista receberá um e-mail com link para instalar e acessar o App.
                </p>
              </div>
            </button>
          </div>

          {/* ── Veículo ── */}
          <div id="nmf-veiculo">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-car-line"></i> Veículo Vinculado
            </h3>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">Veículo</label>
              <select
                value={form.vehicle}
                onChange={(e) => set('vehicle', e.target.value)}
                className="w-full h-10 px-3 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer transition-all"
              >
                {vehicleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-navy-400 mt-1.5">
                Você pode vincular o veículo agora ou fazer isso posteriormente no perfil do motorista.
              </p>
            </div>
          </div>

        </div>

        {/* Error message */}
        {saveError && (
          <div className="px-5 py-3 bg-red-50 border-t border-red-200 flex items-center gap-2 flex-shrink-0">
            <i className="ri-error-warning-line text-red-500 text-sm"></i>
            <span className="text-xs text-red-700">{saveError}</span>
          </div>
        )}

        {/* Sticky action bar */}
        <div className="px-5 py-4 border-t border-sand-200 flex gap-2 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-white border border-sand-200 text-navy-600 text-sm font-medium rounded-xl hover:bg-sand-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="h-10 flex-1 bg-sand-100 border border-sand-200 text-navy-600 text-sm font-medium rounded-xl hover:bg-sand-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-10 flex-1 bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Salvando...</>
            ) : (
              <><i className="ri-send-plane-line text-sm"></i>Salvar e Convidar</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}