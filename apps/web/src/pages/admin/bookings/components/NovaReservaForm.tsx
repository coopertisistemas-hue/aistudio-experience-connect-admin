import { useState } from 'react';
import { useCreateBookingHold } from '@/hooks/useBookings';
import { useCreatePaymentPreference } from '@/hooks/usePayments';

interface NovaReservaFormProps {
  onClose: () => void;
  onSave: () => void;
  tenantId: string;
}

interface FormData {
  // Dados da reserva
  booking_type: 'transfer' | 'experience';
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
  // Passageiro principal
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  passenger_count: string;
  // Transfer
  pickup_location: string;
  dropoff_location: string;
  route_name: string;
  // Operação
  driver_id: string;
  vehicle_id: string;
  // Financeiro
  total_amount: string;
  payment_method: string;
}

interface FormErrors {
  [key: string]: string;
}

const formSections = [
  { id: 'dados', label: 'Reserva', icon: 'ri-calendar-check-line', step: 1 },
  { id: 'passageiro', label: 'Passageiro', icon: 'ri-user-line', step: 2 },
  { id: 'transfer', label: 'Transfer', icon: 'ri-route-line', step: 3 },
  { id: 'operacao', label: 'Operação', icon: 'ri-steering-2-line', step: 4 },
  { id: 'financeiro', label: 'Financeiro', icon: 'ri-secure-payment-line', step: 5 },
];

const defaultForm: FormData = {
  booking_type: 'transfer',
  scheduled_date: '',
  scheduled_time: '',
  notes: '',
  passenger_name: '',
  passenger_phone: '',
  passenger_email: '',
  passenger_count: '1',
  pickup_location: '',
  dropoff_location: '',
  route_name: '',
  driver_id: '',
  vehicle_id: '',
  total_amount: '',
  payment_method: '',
};

// Placeholder options — in real impl these come from Supabase
const driverOptions = [
  { value: '', label: 'Selecionar motorista' },
  { value: 'd1', label: 'João Silva' },
  { value: 'd2', label: 'Carlos Mendes' },
  { value: 'd3', label: 'Ana Ferreira' },
  { value: 'd4', label: 'Pedro Rocha' },
];

const vehicleOptions = [
  { value: '', label: 'Selecionar veículo' },
  { value: 'v1', label: 'Mercedes Vito — ABC-1D23' },
  { value: 'v2', label: 'Toyota Hiace — DEF-2E34' },
  { value: 'v3', label: 'Sprinter Premium — GHI-3F45' },
  { value: 'v4', label: 'Van Executive — JKL-4G56' },
];

const routeOptions = [
  { value: '', label: 'Selecionar rota padrão' },
  { value: 'r1', label: 'Ipanema → GIG' },
  { value: 'r2', label: 'SDU → Leblon' },
  { value: 'r3', label: 'Barra → GIG' },
  { value: 'r4', label: 'GIG → Paraty Experiência' },
  { value: 'r5', label: 'Rio → Búzios Premium' },
];

export default function NovaReservaForm({ onClose, onSave, tenantId }: NovaReservaFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState('dados');
  const [saving, setSaving] = useState(false);
  const [paymentData, setPaymentData] = useState<{ payment_id: string; init_point: string; preference_id: string } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const createHold = useCreateBookingHold();
  const createPaymentPreference = useCreatePaymentPreference();

  const set = (key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`form-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.passenger_name.trim()) e.passenger_name = 'Nome obrigatório';
    if (!form.passenger_email.trim()) e.passenger_email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(form.passenger_email)) e.passenger_email = 'E-mail inválido';
    if (!form.passenger_phone.trim()) e.passenger_phone = 'Telefone obrigatório';
    if (!form.pickup_location.trim()) e.pickup_location = 'Origem obrigatória';
    if (!form.dropoff_location.trim()) e.dropoff_location = 'Destino obrigatório';
    if (!form.scheduled_date) e.scheduled_date = 'Data obrigatória';
    if (!form.scheduled_time) e.scheduled_time = 'Hora obrigatória';
    if (!form.total_amount || Number(form.total_amount) <= 0) e.total_amount = 'Valor obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (asDraft = false) => {
    if (!asDraft && !validate()) {
      if (errors.passenger_name || errors.passenger_email || errors.passenger_phone) {
        scrollToSection('passageiro');
      } else if (errors.pickup_location || errors.dropoff_location) {
        scrollToSection('transfer');
      } else if (errors.scheduled_date || errors.scheduled_time) {
        scrollToSection('dados');
      }
      return;
    }
    setSaving(true);
    setPaymentData(null);
    setPaymentError(null);
    try {
      const holdResult = await createHold.mutateAsync({
        tenant_id: tenantId,
        vehicle_slot_id: '',
        passenger_count: Number(form.passenger_count) || 1,
        scheduled_at: `${form.scheduled_date}T${form.scheduled_time}:00`,
        scheduled_end_at: `${form.scheduled_date}T${form.scheduled_time}:00`,
        pickup_location: form.pickup_location || undefined,
        dropoff_location: form.dropoff_location || undefined,
        notes: form.notes || undefined,
      });

      if (!form.payment_method || form.payment_method === 'payment_link') {
        setCreatingPayment(true);
        try {
          const prefResult = await createPaymentPreference.mutateAsync(holdResult?.hold_id || '');
          if (prefResult) {
            setPaymentData({
              payment_id: prefResult.payment_id,
              init_point: prefResult.init_point,
              preference_id: prefResult.preference_id,
            });
          }
        } catch {
          setPaymentError('Erro ao criar link de pagamento. A reserva foi salva, mas o pagamento não foi gerado.');
        } finally {
          setCreatingPayment(false);
        }
      } else {
        onSave();
      }
    } catch {
      setErrors((e) => ({ ...e, _form: 'Erro ao criar reserva. Tente novamente.' }));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field: keyof FormData) =>
    `w-full h-10 px-3.5 text-sm bg-sand-50 border rounded-xl text-navy-800 placeholder-navy-300 focus:outline-none focus:bg-white transition-all ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100'
        : 'border-sand-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-100'
    }`;

  const selectCls = (field: keyof FormData) =>
    `w-full h-10 px-3.5 text-sm bg-sand-50 border rounded-xl text-navy-700 focus:outline-none focus:bg-white transition-all cursor-pointer ${
      errors[field]
        ? 'border-red-300 focus:border-red-400'
        : 'border-sand-200 focus:border-teal-300'
    }`;

  const labelCls = 'block text-xs font-semibold text-navy-700 mb-1.5';
  const helperCls = 'text-[10px] text-navy-400 mt-1';
  const errorCls = 'text-[10px] text-red-500 mt-1 flex items-center gap-1';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg font-semibold text-navy-950">Nova Reserva</h2>
            <p className="text-navy-400 text-xs mt-0.5">Preencha os dados para criar uma nova reserva</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Section stepper */}
        <div className="flex gap-0 px-6 py-3 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {formSections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeSection === s.id
                  ? 'bg-navy-950 text-white'
                  : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold flex-shrink-0 ${
                activeSection === s.id ? 'bg-white/20 text-white' : 'bg-sand-200 text-navy-500'
              }`}>
                {s.step}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* ── 1. Dados da Reserva ── */}
          <div id="form-section-dados">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950">
                <i className="ri-calendar-check-line text-amber-400 text-xs"></i>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">Dados da Reserva</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tipo de Reserva</label>
                <div className="flex gap-2">
                  {(['transfer', 'experience'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('booking_type', t)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                        form.booking_type === t
                          ? 'bg-navy-950 text-white border-navy-950'
                          : 'bg-sand-50 text-navy-600 border-sand-200 hover:border-sand-300'
                      }`}
                    >
                      <i className={`${t === 'transfer' ? 'ri-car-line' : 'ri-compass-discover-line'} mr-1.5`}></i>
                      {t === 'transfer' ? 'Transfer' : 'Experiência'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Data <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) => set('scheduled_date', e.target.value)}
                    className={inputCls('scheduled_date')}
                  />
                  {errors.scheduled_date && (
                    <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.scheduled_date}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Hora <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    value={form.scheduled_time}
                    onChange={(e) => set('scheduled_time', e.target.value)}
                    className={inputCls('scheduled_time')}
                  />
                  {errors.scheduled_time && (
                    <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.scheduled_time}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value.slice(0, 500))}
                  placeholder="Instruções especiais, solicitações do cliente..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-200 rounded-xl text-navy-800 placeholder-navy-300 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-teal-100 focus:bg-white transition-all resize-none"
                />
                <p className={helperCls}>{form.notes.length}/500 caracteres</p>
              </div>
            </div>
          </div>

          {/* ── 2. Passageiro Principal ── */}
          <div id="form-section-passageiro">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950">
                <i className="ri-user-line text-amber-400 text-xs"></i>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">Passageiro Principal</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Nome completo <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.passenger_name}
                  onChange={(e) => set('passenger_name', e.target.value)}
                  placeholder="Ex: Eduardo Tavares"
                  className={inputCls('passenger_name')}
                />
                {errors.passenger_name && (
                  <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.passenger_name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Telefone <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    value={form.passenger_phone}
                    onChange={(e) => set('passenger_phone', e.target.value)}
                    placeholder="+55 21 99999-0000"
                    className={inputCls('passenger_phone')}
                  />
                  {errors.passenger_phone && (
                    <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.passenger_phone}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Total de pax <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.passenger_count}
                    onChange={(e) => set('passenger_count', e.target.value)}
                    className={inputCls('passenger_count')}
                  />
                  <p className={helperCls}>Incluindo o passageiro principal</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>E-mail <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={form.passenger_email}
                  onChange={(e) => set('passenger_email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={inputCls('passenger_email')}
                />
                {errors.passenger_email && (
                  <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.passenger_email}</p>
                )}
                <p className={helperCls}>Usado para confirmações e vouchers</p>
              </div>
            </div>
          </div>

          {/* ── 3. Transfer ── */}
          <div id="form-section-transfer">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950">
                <i className="ri-route-line text-amber-400 text-xs"></i>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">Transfer</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Rota padrão</label>
                <select
                  value={form.route_name}
                  onChange={(e) => set('route_name', e.target.value)}
                  className={selectCls('route_name')}
                >
                  {routeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className={helperCls}>Selecionar uma rota preenche origem e destino automaticamente</p>
              </div>

              <div>
                <label className={labelCls}>Origem <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                    <i className="ri-map-pin-2-line text-teal-500 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={form.pickup_location}
                    onChange={(e) => set('pickup_location', e.target.value)}
                    placeholder="Hotel, aeroporto, endereço..."
                    className={`${inputCls('pickup_location')} pl-9`}
                  />
                </div>
                {errors.pickup_location && (
                  <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.pickup_location}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Destino <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                    <i className="ri-flag-line text-navy-400 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={form.dropoff_location}
                    onChange={(e) => set('dropoff_location', e.target.value)}
                    placeholder="Hotel, aeroporto, endereço..."
                    className={`${inputCls('dropoff_location')} pl-9`}
                  />
                </div>
                {errors.dropoff_location && (
                  <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.dropoff_location}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── 4. Operação ── */}
          <div id="form-section-operacao">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950">
                <i className="ri-steering-2-line text-amber-400 text-xs"></i>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">Operação</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Motorista</label>
                <select
                  value={form.driver_id}
                  onChange={(e) => set('driver_id', e.target.value)}
                  className={selectCls('driver_id')}
                >
                  {driverOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className={helperCls}>Opcional — pode ser atribuído depois</p>
              </div>

              <div>
                <label className={labelCls}>Veículo</label>
                <select
                  value={form.vehicle_id}
                  onChange={(e) => set('vehicle_id', e.target.value)}
                  className={selectCls('vehicle_id')}
                >
                  {vehicleOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className={helperCls}>Opcional — pode ser atribuído depois</p>
              </div>
            </div>
          </div>

          {/* ── 5. Financeiro ── */}
          <div id="form-section-financeiro">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-950">
                <i className="ri-secure-payment-line text-amber-400 text-xs"></i>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">Financeiro</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Valor total (R$) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-medium pointer-events-none">
                    R$
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total_amount}
                    onChange={(e) => set('total_amount', e.target.value)}
                    placeholder="0,00"
                    className={`${inputCls('total_amount')} pl-9`}
                  />
                </div>
                {errors.total_amount && (
                  <p className={errorCls}><i className="ri-error-warning-line"></i>{errors.total_amount}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Método de pagamento</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => set('payment_method', e.target.value)}
                  className={selectCls('payment_method')}
                >
                  <option value="">Selecionar método</option>
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-4"></div>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-sand-200 flex items-center gap-2.5 flex-shrink-0 bg-sand-50/60">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 bg-white hover:bg-sand-100 text-navy-600 text-sm font-medium rounded-xl border border-sand-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            Cancelar
          </button>
          <div className="flex-1"></div>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2.5 bg-sand-100 hover:bg-sand-200 text-navy-700 text-sm font-medium rounded-xl border border-sand-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-save-line text-sm"></i>
                Salvar Reserva
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment options modal */}
      {(paymentData || creatingPayment || paymentError) && (
        <div className="fixed inset-0 bg-navy-950/40 z-[60] backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
                <i className="ri-secure-payment-line text-teal-600 text-lg"></i>
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-navy-950">Pagamento</h3>
                <p className="text-navy-400 text-xs">Reserva criada com sucesso</p>
              </div>
            </div>

            {creatingPayment && (
              <div className="flex flex-col items-center py-8 gap-3">
                <i className="ri-loader-4-line animate-spin text-3xl text-teal-500"></i>
                <p className="text-navy-600 text-sm font-medium">Gerando link de pagamento...</p>
              </div>
            )}

            {paymentError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                  <i className="ri-alert-line"></i>
                  {paymentError}
                </p>
              </div>
            )}

            {paymentData && (
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <p className="text-teal-700 text-sm font-medium mb-1">Link de Pagamento Gerado</p>
                  <p className="text-navy-400 text-xs">Envie este link para o cliente pagar via Mercado Pago</p>
                </div>

                <a
                  href={paymentData.init_point}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <i className="ri-external-link-line"></i>
                  Abrir Link de Pagamento
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentData.init_point);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <i className="ri-clipboard-line"></i>
                  Copiar Link
                </button>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={onSave}
                className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-600 text-sm font-medium rounded-xl border border-sand-200 transition-colors cursor-pointer"
              >
                {paymentData || paymentError ? 'Ir para Reservas' : 'Fechar'}
              </button>
              {paymentData && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentData(null);
                    setPaymentError(null);
                    setCreatingPayment(false);
                  }}
                  className="flex-1 py-2.5 bg-sand-100 hover:bg-sand-200 text-navy-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Continuar Editando
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}