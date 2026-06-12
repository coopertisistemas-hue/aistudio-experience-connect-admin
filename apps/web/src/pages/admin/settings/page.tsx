import { useState } from 'react';
import {
  mockNotificationSettings,
  mockIntegrations,
  mockSecuritySessions,
} from '@/mocks/admin-settings';
import { useTenant, useTeam } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import SettingsNavigation from './components/SettingsNavigation';
import type { SettingsSection } from './components/SettingsNavigation';
import SettingsEmpresa from './components/SettingsEmpresa';
import SettingsOperacao from './components/SettingsOperacao';
import SettingsEquipe from './components/SettingsEquipe';
import SettingsPermissoes from './components/SettingsPermissoes';
import SettingsNotificacoes from './components/SettingsNotificacoes';
import SettingsIntegracoes from './components/SettingsIntegracoes';
import SettingsBranding from './components/SettingsBranding';
import SettingsSeguranca from './components/SettingsSeguranca';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const sectionMeta: Record<SettingsSection, { title: string; subtitle: string; icon: string }> = {
  empresa: { title: 'Empresa', subtitle: 'Perfil, identidade e plano da organização', icon: 'ri-building-4-line' },
  operacao: { title: 'Operação', subtitle: 'Preferências, horários e automações da operação', icon: 'ri-settings-3-line' },
  equipe: { title: 'Equipe', subtitle: 'Membros, funções e convites', icon: 'ri-team-line' },
  permissoes: { title: 'Permissões', subtitle: 'Acesso por papel e matriz de módulos', icon: 'ri-shield-check-line' },
  notificacoes: { title: 'Notificações', subtitle: 'Alertas por e-mail, push e WhatsApp', icon: 'ri-notification-3-line' },
  integracoes: { title: 'Integrações', subtitle: 'Serviços externos conectados à plataforma', icon: 'ri-plug-2-line' },
  branding: { title: 'Branding', subtitle: 'Identidade visual e tema do painel', icon: 'ri-palette-line' },
  seguranca: { title: 'Segurança', subtitle: 'Sessões, senha e autenticação', icon: 'ri-lock-password-line' },
};

const toastColors = {
  success: 'bg-teal-600 text-white',
  info: 'bg-slate-600 text-white',
  warning: 'bg-amber-500 text-white',
};

function SkeletonSection() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="h-4 bg-stone-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-3 bg-stone-100 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/2" />
            <div className="h-3 bg-stone-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>('empresa');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useTenant(tenantId);
  const { data: teamMembers, isLoading: teamLoading } = useTeam(tenantId);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setLastSaved(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const meta = sectionMeta[section];

  const renderSection = () => {
    if (tenantLoading) return <SkeletonSection />;
    if (tenantError) {
      return (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-50 border border-red-200">
            <i className="ri-error-warning-line text-red-500 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold text-stone-800">Erro ao carregar configurações</p>
          <p className="text-xs text-stone-500">Tente recarregar a página.</p>
        </div>
      );
    }
    if (!tenant) return null;

    switch (section) {
      case 'empresa':
        return <SettingsEmpresa tenant={tenant} onSave={(msg) => addToast(msg)} />;
      case 'operacao':
        return <SettingsOperacao tenant={tenant} onSave={(msg) => addToast(msg)} />;
      case 'equipe':
        return <SettingsEquipe members={teamMembers || []} loading={teamLoading} onSave={(msg) => addToast(msg)} />;
      case 'permissoes':
        return <SettingsPermissoes />;
      case 'notificacoes':
        return <SettingsNotificacoes settings={mockNotificationSettings} onSave={(msg) => addToast(msg)} />;
      case 'integracoes':
        return <SettingsIntegracoes integrations={mockIntegrations} onSave={(msg) => addToast(msg)} />;
      case 'branding':
        return <SettingsBranding onSave={(msg) => addToast(msg)} branding={tenant.branding} tenantId={tenant.id} />;
      case 'seguranca':
        return <SettingsSeguranca sessions={mockSecuritySessions} onSave={(msg) => addToast(msg)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">

      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${toastColors[t.type]}`}
            >
              <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line' : t.type === 'warning' ? 'ri-alert-line' : 'ri-information-line'}`}></i>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              {tenant?.name || 'Carregando...'}
            </span>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-semibold text-stone-500">Configurações</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Configurações</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Gestão operacional e preferências da plataforma
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Save status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl">
            {lastSaved ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                <span className="text-xs text-stone-500">Salvo às <span className="font-semibold text-stone-700">{lastSaved}</span></span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0"></span>
                <span className="text-xs text-stone-500">Sem alterações recentes</span>
              </>
            )}
          </div>
          {/* Mobile nav trigger */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-xl cursor-pointer whitespace-nowrap"
          >
            <i className="ri-menu-3-line text-sm"></i>
            Navegar
          </button>
        </div>
      </div>

      {/* Content layout */}
      <div className="flex gap-5 items-start">

        {/* Left navigation */}
        <SettingsNavigation
          active={section}
          onChange={(s) => setSection(s)}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-white border border-stone-200 rounded-2xl">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500/[0.10] border border-teal-300/40 flex-shrink-0">
              <i className={`${meta.icon} text-teal-600 text-base`}></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">{meta.title}</h2>
              <p className="text-xs text-stone-500">{meta.subtitle}</p>
            </div>
          </div>

          {/* Section content */}
          {renderSection()}
        </div>
      </div>

      {/* Mobile sticky nav button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-stone-900 text-white text-sm font-semibold rounded-full cursor-pointer whitespace-nowrap"
        >
          <i className="ri-settings-3-line text-sm"></i>
          Seções
        </button>
      </div>
    </div>
  );
}