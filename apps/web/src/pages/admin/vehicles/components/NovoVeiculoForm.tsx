import { useState } from 'react';

interface NovoVeiculoFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const vehicleTypes = [
  { value: 'van',      label: 'Van',      icon: 'ri-car-line',     desc: 'Até 12 passageiros' },
  { value: 'sprinter', label: 'Sprinter', icon: 'ri-bus-2-line',   desc: 'Até 16 passageiros' },
  { value: 'sedan',    label: 'Sedã',     icon: 'ri-taxi-line',    desc: 'Até 4 passageiros' },
  { value: 'suv',      label: 'SUV',      icon: 'ri-car-line',     desc: 'Até 7 passageiros' },
  { value: 'bus',      label: 'Ônibus',   icon: 'ri-bus-line',     desc: '30+ passageiros' },
];

const drivers = [
  { id: 'drv-1', name: 'João Silva' },
  { id: 'drv-2', name: 'Carlos Mendes' },
  { id: 'drv-3', name: 'Ana Ferreira' },
  { id: 'drv-4', name: 'Pedro Rocha' },
  { id: 'drv-5', name: 'Roberto Lima' },
];

const statusOptions = [
  { value: 'available',    label: 'Disponível',     desc: 'Pronto para operar' },
  { value: 'reserved',     label: 'Reservado',      desc: 'Alocado em schedule' },
  { value: 'maintenance',  label: 'Em Manutenção',  desc: 'Fora de operação' },
  { value: 'inactive',     label: 'Inativo',        desc: 'Suspenso temporariamente' },
];

interface FormData {
  name: string;
  make: string;
  model: string;
  year: string;
  type: string;
  plate: string;
  color: string;
  capacity: string;
  status: string;
  driver_id: string;
  last_service: string;
  next_service: string;
  notes: string;
}

const INITIAL: FormData = {
  name: '', make: '', model: '', year: '', type: 'van',
  plate: '', color: '', capacity: '', status: 'available',
  driver_id: '', last_service: '', next_service: '', notes: '',
};

export default function NovoVeiculoForm({ onClose, onSuccess }: NovoVeiculoFormProps) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (key: keyof FormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.plate.trim()) e.plate = 'Placa obrigatória';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
      e.capacity = 'Capacidade inválida';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    onSuccess?.();
    onClose();
  };

  const handleDraft = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-navy-900">Novo Veículo</p>
            <p className="text-[11px] text-navy-400 mt-0.5">Adicionar veículo à frota operacional</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Section 1: Dados do Veículo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-car-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Dados do Veículo</p>
            </div>

            {/* Vehicle type toggle */}
            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
                Tipo de Veículo *
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {vehicleTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('type', t.value)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all cursor-pointer ${
                      form.type === t.value
                        ? 'bg-navy-950 border-navy-950 text-white'
                        : 'bg-white border-sand-200 text-navy-500 hover:border-sand-300'
                    }`}
                  >
                    <i className={`${t.icon} text-base`}></i>
                    <span className="text-[9px] font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
              {form.type && (
                <p className="text-[10px] text-navy-400 mt-1.5">
                  {vehicleTypes.find((t) => t.value === form.type)?.desc}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Nome do Veículo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mercedes Vito Executive"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.name ? 'border-red-300 focus:border-red-400' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Make + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mercedes-Benz"
                    value={form.make}
                    onChange={(e) => set('make', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vito 119 CDI"
                    value={form.model}
                    onChange={(e) => set('model', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                  />
                </div>
              </div>

              {/* Plate + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    placeholder="ABC-1234"
                    value={form.plate}
                    onChange={(e) => set('plate', e.target.value.toUpperCase())}
                    className={`w-full h-10 px-3 text-sm font-mono bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                      errors.plate ? 'border-red-300 focus:border-red-400' : 'border-sand-200 focus:border-teal-300'
                    }`}
                  />
                  {errors.plate && <p className="text-[10px] text-red-500 mt-1">{errors.plate}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    min="2010"
                    max="2026"
                    value={form.year}
                    onChange={(e) => set('year', e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Preto Safira"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Capacidade */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-group-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Capacidade</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                Número de Passageiros *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('capacity', String(Math.max(1, Number(form.capacity || 1) - 1)))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-sand-200 bg-white text-navy-600 hover:bg-sand-100 transition-colors cursor-pointer text-lg font-medium"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                  placeholder="0"
                  className={`flex-1 h-10 px-3 text-sm text-center font-semibold bg-white border rounded-xl text-navy-700 focus:outline-none transition-colors ${
                    errors.capacity ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => set('capacity', String(Number(form.capacity || 0) + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-sand-200 bg-white text-navy-600 hover:bg-sand-100 transition-colors cursor-pointer text-lg font-medium"
                >
                  +
                </button>
              </div>
              {errors.capacity && <p className="text-[10px] text-red-500 mt-1">{errors.capacity}</p>}
              <p className="text-[10px] text-navy-400 mt-1.5">
                {vehicleTypes.find((t) => t.value === form.type)?.desc}
              </p>
            </div>
          </div>

          {/* Section 3: Motorista vinculado */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-steering-2-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Motorista Vinculado</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                Motorista <span className="normal-case font-normal text-navy-400">(opcional)</span>
              </label>
              <select
                value={form.driver_id}
                onChange={(e) => set('driver_id', e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
              >
                <option value="">Selecionar motorista...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-navy-400 mt-1.5">
                Pode ser vinculado depois. Veículo sem motorista fica disponível para alocação.
              </p>
            </div>
          </div>

          {/* Section 4: Status Operacional */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-shield-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Status Operacional</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                    form.status === opt.value
                      ? 'bg-navy-950 border-navy-950'
                      : 'bg-white border-sand-200 hover:border-sand-300'
                  }`}
                >
                  <p className={`text-xs font-semibold ${form.status === opt.value ? 'text-white' : 'text-navy-700'}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[10px] ${form.status === opt.value ? 'text-white/60' : 'text-navy-400'}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Manutenção */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-tools-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Manutenção</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Última Revisão
                </label>
                <input
                  type="date"
                  value={form.last_service}
                  onChange={(e) => set('last_service', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Próxima Revisão
                </label>
                <input
                  type="date"
                  value={form.next_service}
                  onChange={(e) => set('next_service', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 focus:outline-none focus:border-teal-300 transition-colors cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                Observações
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => {
                  if (e.target.value.length <= 500) set('notes', e.target.value);
                }}
                placeholder="Observações sobre o veículo, condições especiais, etc."
                rows={3}
                className="w-full px-3 py-2.5 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors resize-none"
              />
              <p className="text-[10px] text-navy-400 text-right mt-1">{form.notes.length}/500</p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-sand-200 flex-shrink-0 bg-sand-50/60">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleDraft}
              disabled={saving}
              className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-600 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 disabled:opacity-50 whitespace-nowrap"
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-check-line text-sm"></i>
                  Criar Veículo
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-navy-400 hover:text-navy-600 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}