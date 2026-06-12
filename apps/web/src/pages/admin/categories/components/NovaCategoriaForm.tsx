import { useState } from 'react';
import { useCreateCategory } from '@/hooks/useCategories';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
}

const ICON_OPTIONS = [
  'ri-flight-land-line', 'ri-vip-diamond-line', 'ri-landscape-line', 'ri-goblet-line',
  'ri-briefcase-4-line', 'ri-parent-line', 'ri-wheelchair-line', 'ri-compass-discover-line',
  'ri-car-line', 'ri-hotel-line', 'ri-map-pin-2-line', 'ri-camera-line',
];

const COLOR_OPTIONS = [
  { value: 'teal', label: 'Verde' },
  { value: 'navy', label: 'Marinho' },
  { value: 'emerald', label: 'Esmeralda' },
  { value: 'wine', label: 'Vinho' },
  { value: 'slate', label: 'Ardósia' },
  { value: 'amber', label: 'Âmbar' },
  { value: 'sky', label: 'Céu' },
];

const COLOR_BG: Record<string, string> = {
  teal: 'bg-teal-500', navy: 'bg-[#2d4a63]', emerald: 'bg-emerald-600',
  wine: 'bg-rose-600', slate: 'bg-slate-600', amber: 'bg-amber-500', sky: 'bg-sky-500',
};

export default function NovaCategoriaForm({ onClose, onSuccess, tenantId }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('ri-compass-discover-line');
  const [color, setColor] = useState('teal');
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { mutate: createCategory, isPending: saving } = useCreateCategory();

  const handleSave = () => {
    if (!name.trim()) { setErrors({ name: 'Nome obrigatório' }); return; }

    createCategory({
      tenant_id: tenantId,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description.trim() || null,
      sort_order: 99,
      is_active: true,
      icon,
      color,
      visibility,
      tags: [],
    }, {
      onSuccess: () => onSuccess(),
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
            <h2 className="text-sm font-bold text-stone-800 font-serif">Nova Categoria</h2>
            <p className="text-xs text-stone-500">Organizar experiências por categoria</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Identificação */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Identificação</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Nome da categoria *</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }}
                  placeholder="Ex: Transfers Aeroporto"
                  className={`w-full h-9 px-3.5 text-sm bg-white border rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-teal-400'}`} />
                {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={3}
                  placeholder="Descreva brevemente as experiências desta categoria..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none" />
                <p className="text-[11px] text-stone-400 mt-0.5">{description.length}/500</p>
              </div>
            </div>
          </section>

          {/* Ícone */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Ícone</h3>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer
                    ${icon === ic ? 'bg-teal-500/10 border-teal-400 ring-2 ring-teal-300/30' : 'bg-white border-stone-200 hover:bg-stone-50'}`}>
                  <i className={`${ic} text-base ${icon === ic ? 'text-teal-600' : 'text-stone-500'}`}></i>
                </button>
              ))}
            </div>
          </section>

          {/* Cor */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Cor da categoria</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {COLOR_OPTIONS.map((co) => (
                <button key={co.value} type="button" onClick={() => setColor(co.value)}
                  className={`flex items-center gap-2 h-8 px-3 rounded-xl border transition-all cursor-pointer
                    ${color === co.value ? 'border-stone-400 bg-stone-100' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                  <span className={`w-3 h-3 rounded-full ${COLOR_BG[co.value]}`}></span>
                  <span className="text-xs text-stone-700">{co.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Visibilidade */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Visibilidade</h3>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-fit">
              {(['visible', 'hidden'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap
                    ${visibility === v ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                  <i className={`${v === 'visible' ? 'ri-eye-line' : 'ri-eye-off-line'} text-xs`}></i>
                  {v === 'visible' ? 'Visível' : 'Oculta'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              {visibility === 'visible' ? 'A categoria aparecerá na listagem de experiências.' : 'A categoria ficará oculta mas manterá os vínculos existentes.'}
            </p>
          </section>

          {/* Preview */}
          <section>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Pré-visualização</h3>
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${COLOR_BG[color]}/10 border border-stone-200 flex-shrink-0`}>
                <i className={`${icon} text-base`}></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">{name || 'Nome da categoria'}</p>
                <p className="text-[11px] text-stone-500 line-clamp-1">{description || 'Descrição da categoria'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button type="button" onClick={onClose} className="h-9 px-4 bg-white hover:bg-stone-100 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </aside>
    </>
  );
}
