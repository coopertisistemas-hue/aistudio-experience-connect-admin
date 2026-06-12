import { useState } from 'react';
import { useUpdateBranding } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';

interface SettingsBrandingProps {
  onSave: (msg: string) => void;
  branding?: Record<string, unknown>;
  tenantId?: string;
}

const presetColors = [
  { label: 'Teal', hex: '#0d9488' },
  { label: 'Navy', hex: '#1e3a5f' },
  { label: 'Midnight', hex: '#1e293b' },
  { label: 'Slate', hex: '#475569' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Rose', hex: '#e11d48' },
];

const themes = [
  { id: 'light', label: 'Claro', icon: 'ri-sun-line' },
  { id: 'warm', label: 'Quente', icon: 'ri-contrast-drop-2-line' },
  { id: 'dark', label: 'Escuro', icon: 'ri-moon-line' },
];

export default function SettingsBranding({ onSave, branding, tenantId }: SettingsBrandingProps) {
  const [primaryColor, setPrimaryColor] = useState((branding?.primary_color as string) || '#0d9488');
  const [companyName, setCompanyName] = useState((branding?.company_name as string) || 'Experience Connect');
  const [tagline, setTagline] = useState((branding?.tagline as string) || 'Operação de transfers premium');
  const [theme, setTheme] = useState((branding?.theme as string) || 'light');
  const [dirty, setDirty] = useState(false);

  const { user } = useAuth();
  const updateBranding = useUpdateBranding();

  const handleSave = async () => {
    try {
      await updateBranding.mutateAsync({
        tenantId: tenantId || user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '',
        branding: { primary_color: primaryColor, company_name: companyName, tagline, theme },
      });
      setDirty(false);
      onSave('Configurações de branding salvas.');
    } catch {
      onSave('Erro ao salvar branding.');
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Logo upload */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Identidade Visual</h3>
        <p className="text-xs text-stone-500 mb-4">Logo e ícone usados no painel, e-mails e materiais da operação.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-stone-600">Logo completa</label>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center gap-2">
                <i className="ri-image-add-line text-stone-400 text-2xl group-hover:text-stone-600 transition-colors"></i>
                <span className="text-xs text-stone-400">Upload logo · PNG, SVG</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">Recomendado: 320×80px · fundo transparente</p>
          </div>
          {/* Icon */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-stone-600">Ícone / Favicon</label>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-teal-500/[0.10] border border-teal-300/60">
                <i className="ri-compass-3-line text-teal-500 text-2xl"></i>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">Recomendado: 64×64px ou 128×128px</p>
          </div>
        </div>
      </div>

      {/* Name & tagline */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Nome e Slogan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Nome da marca</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); setDirty(true); }}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => { setTagline(e.target.value); setDirty(true); }}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
              placeholder="Frase curta da operação"
            />
          </div>
        </div>
      </div>

      {/* Primary color */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Cor Principal</h3>
        <p className="text-xs text-stone-500 mb-4">Usada em botões, badges e destaques do painel.</p>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {presetColors.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => { setPrimaryColor(c.hex); setDirty(true); }}
              title={c.label}
              className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer flex-shrink-0 ${
                primaryColor === c.hex ? 'border-stone-700 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <div className="flex items-center gap-2 border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => { setPrimaryColor(e.target.value); setDirty(true); }}
              className="w-8 h-8 border-none cursor-pointer bg-transparent p-0.5"
            />
            <span className="text-xs font-mono text-stone-600 pr-3">{primaryColor}</span>
          </div>
        </div>
        {/* Live preview */}
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
          <span className="text-xs text-stone-500">Prévia:</span>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: primaryColor }}
          >
            Confirmar reserva
          </button>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: primaryColor, backgroundColor: primaryColor + '18', border: `1px solid ${primaryColor}40` }}
          >
            Pago
          </span>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Tema do Painel</h3>
        <p className="text-xs text-stone-500 mb-4">Aparência geral da interface administrativa.</p>
        <div className="flex gap-3 flex-wrap">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTheme(t.id); setDirty(true); }}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                theme === t.id
                  ? 'bg-teal-500/[0.10] border-teal-300/60 text-teal-700'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <i className={`${t.icon} text-sm`}></i>
              {t.label}
            </button>
          ))}
          {theme !== 'light' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
              <i className="ri-time-line text-xs"></i>
              Em desenvolvimento
            </span>
          )}
        </div>
      </div>

      {/* E-mail signature preview */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Assinatura de E-mail</h3>
        <p className="text-xs text-stone-500 mb-4">Rodapé automático nos e-mails transacionais da plataforma.</p>
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Prévia</span>
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: primaryColor + '18' }}>
                <i className="ri-compass-3-line text-sm" style={{ color: primaryColor }}></i>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{companyName}</p>
                <p className="text-xs text-stone-500">{tagline}</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Esta é uma mensagem automática do sistema Experience Connect. Por favor, não responda este e-mail.
            </p>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className={`flex items-center justify-between gap-4 px-5 py-4 bg-white border rounded-2xl transition-all duration-300 ${dirty ? 'border-teal-300 bg-teal-50/30' : 'border-stone-200'}`}>
        <div className="flex items-center gap-2">
          {dirty ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span><span className="text-xs text-amber-700 font-medium">Alterações não salvas</span></>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span><span className="text-xs text-teal-700 font-medium">Tudo salvo</span></>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || updateBranding.isPending}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            dirty && !updateBranding.isPending ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-default'
          }`}
        >
          {updateBranding.isPending ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-save-line text-sm"></i>}
          {updateBranding.isPending ? 'Salvando…' : 'Salvar branding'}
        </button>
      </div>
    </div>
  );
}