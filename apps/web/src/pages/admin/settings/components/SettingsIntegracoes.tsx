import { useState } from 'react';
interface MockIntegration { id: string; name: string; provider: string; status: string; last_sync: string | null; icon: string; category: string; description: string; config_hint: string };

interface SettingsIntegracoesProps {
  integrations: MockIntegration[];
  onSave: (msg: string) => void;
}

const statusConfig: Record<string, { label: string; dot: string; dotAnim?: string; textColor: string; bg: string; border: string }> = {
  connected: {
    label: 'Conectado',
    dot: 'bg-teal-500',
    textColor: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  disconnected: {
    label: 'Desconectado',
    dot: 'bg-stone-400',
    textColor: 'text-stone-600',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
  },
  error: {
    label: 'Erro',
    dot: 'bg-red-500',
    dotAnim: 'animate-pulse',
    textColor: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  pending: {
    label: 'Pendente',
    dot: 'bg-amber-500',
    dotAnim: 'animate-pulse',
    textColor: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
};

const categoryLabels: Record<string, string> = {
  payment: 'Pagamentos',
  communication: 'Comunicação',
  mapping: 'Mapas',
  database: 'Banco de dados',
  email: 'E-mail',
};

function formatSync(ts: string | null): string {
  if (!ts) return 'Nunca sincronizado';
  const d = new Date(ts);
  return 'Sync: ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// TODO(future): persist integration configs in provider_integrations table (not yet created)
export default function SettingsIntegracoes({ integrations, onSave }: SettingsIntegracoesProps) {
  const [reconnecting, setReconnecting] = useState<string | null>(null);

  const handleReconnect = async (id: string, name: string) => {
    setReconnecting(id);
    await new Promise((r) => setTimeout(r, 1200));
    setReconnecting(null);
    onSave(`Reconexão iniciada para ${name}.`);
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const errorCount = integrations.filter((i) => i.status === 'error').length;

  return (
    <div className="flex flex-col gap-5">

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Conectadas', value: connectedCount, icon: 'ri-links-line', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
          { label: 'Total', value: integrations.length, icon: 'ri-plug-2-line', color: 'text-stone-600', bg: 'bg-stone-50 border-stone-200' },
          { label: 'Erros', value: errorCount, icon: 'ri-error-warning-line', color: errorCount > 0 ? 'text-red-600' : 'text-stone-400', bg: errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-200' },
          { label: 'Pendentes', value: integrations.filter((i) => i.status === 'pending').length, icon: 'ri-time-line', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3 border rounded-xl ${bg}`}>
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <i className={`${icon} ${color} text-base`}></i>
            </div>
            <div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error alert */}
      {errorCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <i className="ri-alert-line text-red-500 text-sm flex-shrink-0"></i>
          <p className="text-xs text-red-800">
            <span className="font-semibold">{errorCount} integração com falha</span> — verifique credenciais e reconecte o serviço.
          </p>
        </div>
      )}

      {/* Integration cards */}
      <div className="flex flex-col gap-3">
        {integrations.map((integration) => {
          const cfg = statusConfig[integration.status];
          const isReconnecting = reconnecting === integration.id;

          return (
            <div
              key={integration.id}
              className={`bg-white border rounded-2xl p-5 transition-all duration-200 ${
                integration.status === 'error' ? 'border-red-200' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0">
                  <i className={`${integration.icon} text-stone-700 text-lg`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-stone-900">{integration.name}</span>
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      {categoryLabels[integration.category]}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-2">{integration.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.dotAnim ?? ''}`}></span>
                      <span className={`text-[11px] font-semibold ${cfg.textColor}`}>{cfg.label}</span>
                    </div>
                    <span className="text-[11px] text-stone-400">{formatSync(integration.last_sync)}</span>
                  </div>
                  {integration.config_hint && (
                    <p className={`text-[11px] mt-2 font-medium ${integration.status === 'error' ? 'text-red-600' : 'text-stone-500'}`}>
                      {integration.config_hint}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {integration.status === 'connected' && (
                    <button
                      type="button"
                      onClick={() => handleReconnect(integration.id, integration.name)}
                      disabled={isReconnecting}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className={`ri-refresh-line text-xs ${isReconnecting ? 'animate-spin' : ''}`}></i>
                      {isReconnecting ? 'Sincronizando…' : 'Sincronizar'}
                    </button>
                  )}
                  {(integration.status === 'error' || integration.status === 'disconnected') && (
                    <button
                      type="button"
                      onClick={() => handleReconnect(integration.id, integration.name)}
                      disabled={isReconnecting}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                        integration.status === 'error'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      <i className={`ri-refresh-line text-xs ${isReconnecting ? 'animate-spin' : ''}`}></i>
                      {isReconnecting ? 'Conectando…' : integration.status === 'error' ? 'Reconectar' : 'Conectar'}
                    </button>
                  )}
                  {integration.status === 'pending' && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-settings-4-line text-xs"></i>
                      Configurar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
        <i className="ri-add-circle-line text-stone-400 text-sm flex-shrink-0"></i>
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-600">Novas integrações em breve:</span>{' '}
          Stripe, Booking.com, Amadeus GDS, Intercom, Slack e mais.
        </p>
      </div>
    </div>
  );
}