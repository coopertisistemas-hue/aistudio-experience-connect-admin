import { useState } from 'react';

interface NovoTransferFormProps {
  onClose: () => void;
  onSave: () => void;
}

type FormSection = 'rota' | 'passageiro' | 'operacao' | 'detalhes';

const sections: { id: FormSection; label: string; icon: string }[] = [
  { id: 'rota',       label: 'Rota',       icon: 'ri-route-line' },
  { id: 'passageiro', label: 'Passageiro', icon: 'ri-user-line' },
  { id: 'operacao',   label: 'Operação',   icon: 'ri-steering-2-line' },
  { id: 'detalhes',   label: 'Detalhes',   icon: 'ri-file-list-line' },
];

const routeOptions = [
  { value: '', label: 'Selecionar rota...' },
  { value: 'gig-ipanema', label: 'GIG → Ipanema' },
  { value: 'sdu-leblon', label: 'SDU → Leblon' },
  { value: 'copa-gig', label: 'Copacabana → GIG' },
  { value: 'barra-gig', label: 'Barra → GIG' },
  { value: 'gig-paraty', label: 'GIG → Paraty' },
  { value: 'rio-buzios', label: 'Rio → Búzios' },
];

const driverOptions = [
  { value: '', label: 'Selecionar motorista...' },
  { value: 'drv-1', label: 'João Silva — Mercedes Vito (ABC-1D23)' },
  { value: 'drv-2', label: 'Carlos Mendes — Toyota Hiace (DEF-2E34)' },
  { value: 'drv-3', label: 'Ana Ferreira — Sprinter Premium (GHI-3F45)' },
  { value: 'drv-4', label: 'Pedro Rocha — Van Executive (JKL-4G56)' },
];

interface FormErrors {
  route?: string;
  passengerName?: string;
  passengerPhone?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export default function NovoTransferForm({ onClose, onSave }: NovoTransferFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>('rota');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notes, setNotes] = useState('');

  const [form, setForm] = useState({
    route: '',
    origin: '',
    destination: '',
    scheduledDate: '',
    scheduledTime: '',
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    passengerCount: '1',
    driver: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.route) errs.route = 'Selecione uma rota';
    if (!form.passengerName.trim()) errs.passengerName = 'Nome obrigatório';
    if (!form.passengerPhone.trim()) errs.passengerPhone = 'Telefone obrigatório';
    if (!form.scheduledDate) errs.scheduledDate = 'Data obrigatória';
    if (!form.scheduledTime) errs.scheduledTime = 'Horário obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave();
    }, 1200);
  };

  const notesMax = 500;

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[560px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Novo Transfer</h2>
            <p className="text-[11px] text-navy-400 mt-0.5">Criar e agendar um novo transfer operacional</p>
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
                const el = document.getElementById(`ntf-${s.id}`);
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

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* ── Rota ── */}
          <div id="ntf-rota">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-route-line"></i> Rota
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Rota <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.route}
                  onChange={(e) => { set('route', e.target.value); setErrors((r) => ({ ...r, route: undefined })); }}
                  className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-teal-100 cursor-pointer transition-all ${errors.route ? 'border-red-300' : 'border-sand-200'}`}
                >
                  {routeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.route && <p className="text-[10px] text-red-500 mt-1">{errors.route}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">Origem</label>
                  <input
                    type="text"
                    placeholder="Hotel, aeroporto..."
                    value={form.origin}
                    onChange={(e) => set('origin', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">Destino</label>
                  <input
                    type="text"
                    placeholder="Hotel, aeroporto..."
                    value={form.destination}
                    onChange={(e) => set('destination', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                    Data <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => { set('scheduledDate', e.target.value); setErrors((r) => ({ ...r, scheduledDate: undefined })); }}
                    className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer transition-all ${errors.scheduledDate ? 'border-red-300' : 'border-sand-200'}`}
                  />
                  {errors.scheduledDate && <p className="text-[10px] text-red-500 mt-1">{errors.scheduledDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                    Horário <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => { set('scheduledTime', e.target.value); setErrors((r) => ({ ...r, scheduledTime: undefined })); }}
                    className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer transition-all ${errors.scheduledTime ? 'border-red-300' : 'border-sand-200'}`}
                  />
                  {errors.scheduledTime && <p className="text-[10px] text-red-500 mt-1">{errors.scheduledTime}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Passageiro ── */}
          <div id="ntf-passageiro">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-user-line"></i> Passageiro Principal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do passageiro principal"
                  value={form.passengerName}
                  onChange={(e) => { set('passengerName', e.target.value); setErrors((r) => ({ ...r, passengerName: undefined })); }}
                  className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all ${errors.passengerName ? 'border-red-300' : 'border-sand-200'}`}
                />
                {errors.passengerName && <p className="text-[10px] text-red-500 mt-1">{errors.passengerName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                    Telefone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+55 21 99999-9999"
                    value={form.passengerPhone}
                    onChange={(e) => { set('passengerPhone', e.target.value); setErrors((r) => ({ ...r, passengerPhone: undefined })); }}
                    className={`w-full h-10 px-3 text-sm bg-sand-50 border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all ${errors.passengerPhone ? 'border-red-300' : 'border-sand-200'}`}
                  />
                  {errors.passengerPhone && <p className="text-[10px] text-red-500 mt-1">{errors.passengerPhone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={form.passengerEmail}
                    onChange={(e) => set('passengerEmail', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">Quantidade de Passageiros</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('passengerCount', String(Math.max(1, parseInt(form.passengerCount) - 1)))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-sand-50 border border-sand-200 text-navy-600 hover:bg-sand-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-sm"></i>
                  </button>
                  <span className="text-sm font-bold text-navy-800 w-6 text-center">{form.passengerCount}</span>
                  <button
                    type="button"
                    onClick={() => set('passengerCount', String(Math.min(20, parseInt(form.passengerCount) + 1)))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-sand-50 border border-sand-200 text-navy-600 hover:bg-sand-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Operação ── */}
          <div id="ntf-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Motorista & Veículo
            </h3>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">Motorista / Veículo</label>
              <select
                value={form.driver}
                onChange={(e) => set('driver', e.target.value)}
                className="w-full h-10 px-3 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 cursor-pointer transition-all"
              >
                {driverOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-navy-400 mt-1.5">O veículo é definido automaticamente pelo motorista selecionado.</p>
            </div>
          </div>

          {/* ── Detalhes ── */}
          <div id="ntf-detalhes">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="ri-file-list-line"></i> Detalhes Adicionais
            </h3>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Observações
                <span className="ml-1 text-[10px] text-navy-400 font-normal">({notes.length}/{notesMax})</span>
              </label>
              <textarea
                rows={4}
                maxLength={notesMax}
                placeholder="Instruções especiais, solicitações do passageiro, pontos de atenção..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-all resize-none"
              />
              {notes.length >= notesMax && (
                <p className="text-[10px] text-amber-600 mt-1">Limite de {notesMax} caracteres atingido.</p>
              )}
            </div>
          </div>

        </div>

        {/* Sticky action bar */}
        <div className="px-5 py-4 border-t border-sand-200 flex gap-2.5 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-white border border-sand-200 text-navy-600 text-sm font-medium rounded-xl hover:bg-sand-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-10 flex-1 bg-sand-100 border border-sand-200 text-navy-600 text-sm font-medium rounded-xl hover:bg-sand-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 flex-1 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-car-line text-sm"></i>
                Criar Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}