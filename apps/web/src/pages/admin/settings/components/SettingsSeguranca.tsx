import { useState } from 'react';
interface MockSecuritySession { id: string; device: string; browser: string; ip: string; lastActive: string; current: boolean; is_current: boolean; location: string; last_active: string }

interface SettingsSegurancaProps {
  sessions: MockSecuritySession[];
  onSave: (msg: string) => void;
}

function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// TODO(future): use auth.sessions and auth.users from Supabase Auth (out of scope for now)
export default function SettingsSeguranca({ sessions, onSave }: SettingsSegurancaProps) {
  const [showPwForm, setShowPwForm] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);

  const handlePwSave = async () => {
    if (!pw.current || !pw.newPw || !pw.confirm) {
      setPwError('Preencha todos os campos.');
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwError('As senhas não coincidem.');
      return;
    }
    if (pw.newPw.length < 8) {
      setPwError('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    setPwError('');
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPwSaving(false);
    setPw({ current: '', newPw: '', confirm: '' });
    setShowPwForm(false);
    onSave('Senha alterada com sucesso.');
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    await new Promise((r) => setTimeout(r, 800));
    setRevoking(null);
    onSave('Sessão encerrada.');
  };

  const pwStrength = (() => {
    const v = pw.newPw;
    if (!v) return null;
    if (v.length < 6) return { label: 'Fraca', color: 'bg-red-500', width: '25%' };
    if (v.length < 10) return { label: 'Média', color: 'bg-amber-500', width: '55%' };
    if (v.length < 14) return { label: 'Boa', color: 'bg-teal-500', width: '80%' };
    return { label: 'Forte', color: 'bg-teal-600', width: '100%' };
  })();

  return (
    <div className="flex flex-col gap-5">

      {/* Auth overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: 'ri-lock-2-line', label: 'Autenticação', value: 'E-mail + Senha', status: 'teal' },
          { icon: 'ri-shield-keyhole-line', label: '2FA', value: 'Não configurado', status: 'amber' },
          { icon: 'ri-device-line', label: 'Sessões ativas', value: `${sessions.length} dispositivo${sessions.length !== 1 ? 's' : ''}`, status: 'teal' },
        ].map(({ icon, label, value, status }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5 bg-white border border-stone-200 rounded-xl">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${status === 'teal' ? 'bg-teal-50' : 'bg-amber-50'}`}>
              <i className={`${icon} text-base ${status === 'teal' ? 'text-teal-600' : 'text-amber-600'}`}></i>
            </div>
            <div>
              <p className="text-[11px] text-stone-500">{label}</p>
              <p className="text-xs font-semibold text-stone-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Password change */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 mb-1">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Alterar Senha</h3>
            <p className="text-xs text-stone-500 mt-0.5">Recomendamos trocar a senha periodicamente.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowPwForm(!showPwForm); setPwError(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className={`text-xs ${showPwForm ? 'ri-close-line' : 'ri-edit-line'}`}></i>
            {showPwForm ? 'Cancelar' : 'Alterar senha'}
          </button>
        </div>
        {showPwForm && (
          <div className="mt-4 flex flex-col gap-3">
            {[
              { key: 'current', label: 'Senha atual', placeholder: '••••••••' },
              { key: 'newPw', label: 'Nova senha', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirmar nova senha', placeholder: '••••••••' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-600">{label}</label>
                <input
                  type="password"
                  placeholder={placeholder}
                  value={pw[key as keyof typeof pw]}
                  onChange={(e) => { setPw((p) => ({ ...p, [key]: e.target.value })); setPwError(''); }}
                  className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
                />
                {key === 'newPw' && pwStrength && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-stone-200 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} style={{ width: pwStrength.width }}></div>
                    </div>
                    <span className="text-[11px] font-medium text-stone-500">{pwStrength.label}</span>
                  </div>
                )}
              </div>
            ))}
            {pwError && (
              <p className="text-xs text-red-600 font-medium">{pwError}</p>
            )}
            <button
              type="button"
              onClick={handlePwSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap w-fit"
            >
              {pwSaving ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-lock-password-line text-sm"></i>}
              {pwSaving ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </div>
        )}
      </div>

      {/* 2FA placeholder */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-200 flex-shrink-0">
            <i className="ri-shield-keyhole-line text-amber-600 text-lg"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-stone-800 mb-0.5">Autenticação de Dois Fatores (2FA)</h3>
            <p className="text-xs text-stone-500 mb-3">Adicione uma camada extra de proteção à sua conta com TOTP ou SMS.</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
              <i className="ri-time-line text-xs"></i>
              Em desenvolvimento · Disponível em breve
            </span>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-800">Sessões Ativas</h3>
          <span className="text-[11px] text-stone-400">{sessions.length} dispositivo{sessions.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="divide-y divide-stone-100">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/60 transition-colors">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 flex-shrink-0">
                <i className={`text-stone-600 text-sm ${session.device.includes('iPhone') || session.device.includes('mobile') ? 'ri-smartphone-line' : 'ri-computer-line'}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-800">{session.device}</span>
                  {session.is_current && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-full">
                      Sessão atual
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {session.location} · {session.ip} · {formatDate(session.last_active)}
                </p>
              </div>
              {!session.is_current && (
                <button
                  type="button"
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  {revoking === session.id ? (
                    <i className="ri-loader-4-line animate-spin text-xs"></i>
                  ) : (
                    <i className="ri-logout-box-r-line text-xs"></i>
                  )}
                  {revoking === session.id ? 'Encerrando…' : 'Encerrar'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Access history note */}
      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
        <i className="ri-history-line text-stone-400 text-sm flex-shrink-0"></i>
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-600">Histórico de acessos completo</span> disponível nos logs de auditoria — em breve na seção de Relatórios.
        </p>
      </div>
    </div>
  );
}