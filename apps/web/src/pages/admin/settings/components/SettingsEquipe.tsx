import { useState } from 'react';
import { useInviteMember } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import type { UserTenantWithUser } from '@/services/settings';

interface SettingsEquipeProps {
  members: UserTenantWithUser[];
  loading?: boolean;
  onSave: (msg: string) => void;
}

const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
  owner: { label: 'Proprietário', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: 'ri-vip-crown-line' },
  admin: { label: 'Administrador', color: 'text-teal-700 bg-teal-50 border-teal-200', icon: 'ri-shield-star-line' },
  operator: { label: 'Operador', color: 'text-stone-600 bg-stone-100 border-stone-200', icon: 'ri-user-settings-line' },
};

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  active: { label: 'Ativo', dot: 'bg-teal-500', text: 'text-teal-700' },
  inactive: { label: 'Inativo', dot: 'bg-stone-400', text: 'text-stone-500' },
  pending: { label: 'Convite pendente', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700' },
};

const avatarColors = [
  'bg-teal-500/20 text-teal-700',
  'bg-sky-500/20 text-sky-700',
  'bg-amber-500/20 text-amber-700',
  'bg-rose-500/20 text-rose-700',
  'bg-indigo-500/20 text-indigo-700',
  'bg-stone-500/20 text-stone-700',
];

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatLastAccess(ts: string): string {
  if (!ts) return 'Nunca acessou';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SettingsEquipe({ members, loading, onSave }: SettingsEquipeProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'operator'>('operator');

  const { user } = useAuth();
  const inviteMember = useInviteMember();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember.mutateAsync({
        tenantId: user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '',
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail('');
      setShowInvite(false);
      onSave(`Convite enviado para ${inviteEmail}`);
    } catch {
      onSave('Erro ao enviar convite.');
    }
  };

  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <div className="flex flex-col gap-5">

      {/* Header strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span className="text-xs font-semibold text-teal-700">{activeCount} ativos</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-amber-700">{pendingCount} convite{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line text-sm"></i>
          Convidar membro
        </button>
      </div>

      {/* Invite panel */}
      {showInvite && (
        <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-mail-send-line text-teal-600 text-sm"></i>
            <h3 className="text-sm font-semibold text-teal-800">Convidar novo membro</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-600">E-mail</label>
              <input
                type="email"
                placeholder="nome@empresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-600">Função</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'operator')}
                className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors cursor-pointer"
              >
                <option value="admin">Administrador</option>
                <option value="operator">Operador</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMember.isPending}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                inviteEmail.trim() && !inviteMember.isPending ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-default'
              }`}
            >
              {inviteMember.isPending ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-send-plane-line text-sm"></i>}
              {inviteMember.isPending ? 'Enviando…' : 'Enviar convite'}
            </button>
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-800">Membros da equipe</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {loading ? (
            <div className="px-5 py-8 text-center text-xs text-stone-400">
              <i className="ri-loader-4-line animate-spin text-base inline-block mb-2"></i>
              <p>Carregando equipe...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-stone-400">
              <p>Nenhum membro encontrado.</p>
            </div>
          ) : members.map((member, idx) => {
            const role = roleConfig[member.role];
            const status = statusConfig[member.status];
            const avatarColor = avatarColors[idx % avatarColors.length];
            const initials = getInitials(member.name);
            return (
              <div key={member.user_id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/60 transition-colors">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-900">{member.name || '—'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${role.color}`}>
                      <i className={`${role.icon} text-[10px]`}></i>
                      {role.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{member.email}</p>
                </div>
                {/* Status + last access */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    <span className={`text-[11px] font-medium ${status.text}`}>{status.label}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">{formatLastAccess(member.last_access)}</span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {member.role !== 'owner' && (
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <i className="ri-edit-line text-stone-500 text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roles description */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Funções disponíveis</h3>
        <div className="flex flex-col gap-3">
          {Object.entries(roleConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-start gap-3">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${cfg.color.replace('text-', 'text-').replace('bg-', 'bg-').split(' ').slice(0, 2).join(' ')}`}>
                <i className={`${cfg.icon} text-xs`}></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-800">{cfg.label}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {key === 'owner' && 'Acesso total. Gerencia plano, equipe, integrações e todas as configurações.'}
                  {key === 'admin' && 'Gerencia operações, reservas, clientes e relatórios. Não altera configurações estruturais.'}
                  {key === 'operator' && 'Foco operacional: reservas, transfers, check-ins e motoristas. Sem acesso financeiro.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}