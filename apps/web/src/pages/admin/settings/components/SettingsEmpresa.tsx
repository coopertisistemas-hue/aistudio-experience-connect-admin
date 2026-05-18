import { useState } from 'react';
import type { MockTenant } from '@/mocks/admin-settings';

interface SettingsEmpresaProps {
  tenant: MockTenant;
  onSave: (msg: string) => void;
}

const planLabels: Record<string, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'text-stone-600 bg-stone-100 border-stone-200' },
  professional: { label: 'Professional', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  enterprise: { label: 'Enterprise', color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

const statusLabels: Record<string, { label: string; dot: string }> = {
  active: { label: 'Ativo', dot: 'bg-teal-500' },
  suspended: { label: 'Suspenso', dot: 'bg-red-500' },
  trial: { label: 'Período de teste', dot: 'bg-amber-500' },
};

export default function SettingsEmpresa({ tenant, onSave }: SettingsEmpresaProps) {
  const [form, setForm] = useState({
    name: tenant.name,
    slug: tenant.slug,
    email: tenant.email,
    phone: tenant.phone,
    address: tenant.address,
    city: tenant.city,
    country: tenant.country,
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const plan = planLabels[tenant.plan];
  const status = statusLabels[tenant.status];

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setDirty(false);
    onSave('Configurações da empresa salvas com sucesso.');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Plan badge */}
      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
        <div className="w-7 h-7 flex items-center justify-center">
          <i className="ri-award-line text-teal-600 text-base"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-500">Plano atual</p>
          <p className="text-sm font-semibold text-stone-800 leading-tight">
            Renovação em{' '}
            {new Date(tenant.plan_renewal).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${plan.color}`}>
          {plan.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
          <span className="text-xs text-stone-600 font-medium">{status.label}</span>
        </div>
      </div>

      {/* Logo upload */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Logo da Empresa</h3>
        <p className="text-xs text-stone-500 mb-4">Aparece no painel administrativo e nas comunicações.</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-teal-500/[0.10] border-2 border-dashed border-teal-300/60">
            <i className="ri-compass-3-line text-teal-500 text-2xl"></i>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-upload-2-line text-xs"></i>
              Fazer upload
            </button>
            <p className="text-[11px] text-stone-400">PNG, SVG · máx. 2 MB · 200×200px</p>
          </div>
        </div>
      </div>

      {/* Identification */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Identificação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Nome da empresa</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Slug da URL</label>
            <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:ring-2 focus-within:ring-teal-400/40 focus-within:border-teal-400 transition-colors">
              <span className="px-3 py-2.5 text-xs text-stone-400 bg-stone-100 border-r border-stone-200 whitespace-nowrap">
                connect.io/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Contato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { field: 'email', label: 'E-mail operacional', type: 'email', helper: 'Usado para envio de alertas e relatórios' },
            { field: 'phone', label: 'Telefone', type: 'tel', helper: 'Com DDD e código do país' },
          ].map(({ field, label, type, helper }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-600">{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={(e) => handleChange(field as keyof typeof form, e.target.value)}
                className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
              />
              <p className="text-[11px] text-stone-400">{helper}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Logradouro</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Cidade · Estado</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">País</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className={`flex items-center justify-between gap-4 px-5 py-4 bg-white border rounded-2xl transition-all duration-300 ${dirty ? 'border-teal-300 bg-teal-50/30' : 'border-stone-200'}`}>
        <div className="flex items-center gap-2">
          {dirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs text-amber-700 font-medium">Alterações não salvas</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <span className="text-xs text-teal-700 font-medium">Tudo salvo</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setForm({ name: tenant.name, slug: tenant.slug, email: tenant.email, phone: tenant.phone, address: tenant.address, city: tenant.city, country: tenant.country }); setDirty(false); }}
            className="px-4 py-2 text-xs font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              dirty && !saving ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-default'
            }`}
          >
            {saving ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-save-line text-sm"></i>}
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}