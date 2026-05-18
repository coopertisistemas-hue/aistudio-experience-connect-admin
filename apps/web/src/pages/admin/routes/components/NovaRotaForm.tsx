import { useState } from 'react';

interface NovaRotaFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  { value: 'airport',   label: 'Aeroporto',   icon: 'ri-flight-takeoff-line', desc: 'Transfers para/de aeroportos' },
  { value: 'tourism',   label: 'Turismo',      icon: 'ri-compass-discover-line', desc: 'Roteiros e destinos turísticos' },
  { value: 'hotel',     label: 'Hotel',        icon: 'ri-hotel-line',           desc: 'Transfers inter-hotéis' },
  { value: 'corporate', label: 'Corporativo',  icon: 'ri-building-4-line',      desc: 'Grupos e eventos empresariais' },
  { value: 'transfer',  label: 'Transfer',     icon: 'ri-car-line',             desc: 'Transfer padrão' },
];

const statusOptions = [
  { value: 'active',  label: 'Ativa',   desc: 'Disponível para reservas' },
  { value: 'paused',  label: 'Pausada', desc: 'Temporariamente fora de operação' },
  { value: 'inactive', label: 'Inativa', desc: 'Desativada' },
];

const popularOrigins = [
  'Aeroporto Santos Dumont',
  'Aeroporto Internacional Galeão',
  'Ipanema / Leblon',
  'Copacabana',
  'Barra da Tijuca',
  'Centro do Rio',
];

const popularDestinations = [
  'Búzios',
  'Paraty',
  'Petrópolis',
  'Angra dos Reis',
  'Barra da Tijuca',
  'Ipanema / Leblon',
];

interface FormData {
  name: string;
  category: string;
  origin_name: string;
  origin_detail: string;
  destination_name: string;
  destination_detail: string;
  distance_km: string;
  duration_min: string;
  base_price: string;
  status: string;
  notes: string;
}

const INITIAL: FormData = {
  name: '', category: 'airport',
  origin_name: '', origin_detail: '',
  destination_name: '', destination_detail: '',
  distance_km: '', duration_min: '',
  base_price: '', status: 'active', notes: '',
};

export default function NovaRotaForm({ onClose, onSuccess }: NovaRotaFormProps) {
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
    if (!form.origin_name.trim()) e.origin_name = 'Origem obrigatória';
    if (!form.destination_name.trim()) e.destination_name = 'Destino obrigatório';
    if (!form.distance_km || isNaN(Number(form.distance_km))) e.distance_km = 'Distância inválida';
    if (!form.duration_min || isNaN(Number(form.duration_min))) e.duration_min = 'Duração inválida';
    if (!form.base_price || isNaN(Number(form.base_price))) e.base_price = 'Preço inválido';
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

  const durationHours = Number(form.duration_min) >= 60
    ? `${Math.floor(Number(form.duration_min) / 60)}h ${Number(form.duration_min) % 60 > 0 ? `${Number(form.duration_min) % 60}min` : ''}`
    : form.duration_min ? `${form.duration_min}min` : '';

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-navy-900">Nova Rota</p>
            <p className="text-[11px] text-navy-400 mt-0.5">Adicionar rota ao catálogo operacional</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Section 1: Dados da Rota */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-route-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Dados da Rota</p>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1.5">
                Categoria *
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('category', c.value)}
                    className={`flex flex-col items-center gap-1 px-1 py-3 rounded-xl border transition-all cursor-pointer ${
                      form.category === c.value
                        ? 'bg-navy-950 border-navy-950 text-white'
                        : 'bg-white border-sand-200 text-navy-500 hover:border-sand-300'
                    }`}
                  >
                    <i className={`${c.icon} text-base`}></i>
                    <span className="text-[8px] font-semibold leading-tight text-center">{c.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-navy-400 mt-1.5">
                {categories.find((c) => c.value === form.category)?.desc}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                Nome da Rota *
              </label>
              <input
                type="text"
                placeholder="Ex: SDU → Ipanema"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                  errors.name ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Section 2: Origem & Destino */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-map-pin-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Origem &amp; Destino</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Origem *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aeroporto Santos Dumont"
                  value={form.origin_name}
                  onChange={(e) => set('origin_name', e.target.value)}
                  list="origins-list"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.origin_name ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                <datalist id="origins-list">
                  {popularOrigins.map((o) => <option key={o} value={o} />)}
                </datalist>
                {errors.origin_name && <p className="text-[10px] text-red-500 mt-1">{errors.origin_name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Detalhe da Origem
                </label>
                <input
                  type="text"
                  placeholder="Endereço completo ou referência"
                  value={form.origin_detail}
                  onChange={(e) => set('origin_detail', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Destino *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ipanema / Leblon"
                  value={form.destination_name}
                  onChange={(e) => set('destination_name', e.target.value)}
                  list="destinations-list"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.destination_name ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                <datalist id="destinations-list">
                  {popularDestinations.map((d) => <option key={d} value={d} />)}
                </datalist>
                {errors.destination_name && <p className="text-[10px] text-red-500 mt-1">{errors.destination_name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Detalhe do Destino
                </label>
                <input
                  type="text"
                  placeholder="Endereço completo ou referência"
                  value={form.destination_detail}
                  onChange={(e) => set('destination_detail', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operação */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-settings-3-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Operação</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Distância (km) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="0.0"
                  value={form.distance_km}
                  onChange={(e) => set('distance_km', e.target.value)}
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.distance_km ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                {errors.distance_km && <p className="text-[10px] text-red-500 mt-1">{errors.distance_km}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                  Duração (min) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.duration_min}
                  onChange={(e) => set('duration_min', e.target.value)}
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.duration_min ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
                {durationHours && <p className="text-[10px] text-navy-400 mt-1">≈ {durationHours}</p>}
                {errors.duration_min && <p className="text-[10px] text-red-500 mt-1">{errors.duration_min}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Precificação */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-money-dollar-circle-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Precificação</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-1">
                Preço Base (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-navy-400 font-medium pointer-events-none">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.base_price}
                  onChange={(e) => set('base_price', e.target.value)}
                  className={`w-full h-10 pl-8 pr-3 text-sm bg-white border rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none transition-colors ${
                    errors.base_price ? 'border-red-300' : 'border-sand-200 focus:border-teal-300'
                  }`}
                />
              </div>
              {errors.base_price && <p className="text-[10px] text-red-500 mt-1">{errors.base_price}</p>}
              <p className="text-[10px] text-navy-400 mt-1.5">
                Preço inicial da rota. Ajustes por veículo, distância e demanda podem ser configurados separadamente.
              </p>
            </div>

            {/* Status */}
            <div className="mt-4">
              <label className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-2">
                Status inicial
              </label>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('status', opt.value)}
                    className={`flex flex-col items-start gap-0.5 px-3 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                      form.status === opt.value ? 'bg-navy-950 border-navy-950' : 'bg-white border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${form.status === opt.value ? 'text-white' : 'text-navy-700'}`}>{opt.label}</p>
                    <p className={`text-[9px] ${form.status === opt.value ? 'text-white/60' : 'text-navy-400'}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Observações */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-950 flex-shrink-0">
                <i className="ri-file-text-line text-white text-[9px]"></i>
              </div>
              <p className="text-[10px] font-bold text-navy-700 uppercase tracking-widest">Observações</p>
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => { if (e.target.value.length <= 500) set('notes', e.target.value); }}
              placeholder="Informações adicionais, pontos de atenção, instruções para motoristas..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white border border-sand-200 rounded-xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors resize-none"
            />
            <p className="text-[10px] text-navy-400 text-right mt-1">{form.notes.length}/500</p>
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
                <><i className="ri-loader-4-line animate-spin text-sm"></i>Salvando...</>
              ) : (
                <><i className="ri-check-line text-sm"></i>Criar Rota</>
              )}
            </button>
          </div>
          <button type="button" onClick={onClose} className="w-full py-2 text-navy-400 hover:text-navy-600 text-xs font-medium transition-colors cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}