import type { MockPermissionRow } from '@/mocks/admin-settings';

interface SettingsPermissoesProps {
  permissions: MockPermissionRow[];
}

const roleMeta = {
  owner: { label: 'Proprietário', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'ri-vip-crown-line' },
  admin: { label: 'Admin', color: 'text-teal-700', bg: 'bg-teal-50', icon: 'ri-shield-star-line' },
  operator: { label: 'Operador', color: 'text-stone-600', bg: 'bg-stone-100', icon: 'ri-user-settings-line' },
};

export default function SettingsPermissoes({ permissions }: SettingsPermissoesProps) {
  const roles = ['owner', 'admin', 'operator'] as const;

  return (
    <div className="flex flex-col gap-5">

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-information-line text-stone-500 text-sm"></i>
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-700">Permissões baseadas em papel (RBAC)</p>
          <p className="text-xs text-stone-500 mt-0.5">
            A matriz abaixo exibe o acesso padrão por função. Permissões granulares por usuário estarão disponíveis em breve.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((role) => {
          const meta = roleMeta[role];
          const accessCount = permissions.filter((p) => p[role]).length;
          return (
            <div key={role} className={`${meta.bg} border border-stone-200/80 rounded-2xl p-4 flex flex-col gap-2`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className={`${meta.icon} ${meta.color} text-base`}></i>
                </div>
                <p className={`text-sm font-bold ${meta.color}`}>{meta.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-current opacity-60 transition-all duration-500"
                    style={{ width: `${(accessCount / permissions.length) * 100}%`, color: meta.color.replace('text-', '') }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${meta.color}`}>{accessCount}/{permissions.length}</span>
              </div>
              <p className="text-[11px] text-stone-500">módulos com acesso</p>
            </div>
          );
        })}
      </div>

      {/* Permission matrix */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-800">Matriz de acesso por módulo</h3>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_repeat(3,_80px)] px-5 py-2.5 bg-stone-50 border-b border-stone-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Módulo</span>
          {roles.map((role) => {
            const meta = roleMeta[role];
            return (
              <div key={role} className="flex flex-col items-center gap-0.5">
                <i className={`${meta.icon} ${meta.color} text-xs`}></i>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100">
          {permissions.map((perm) => (
            <div
              key={perm.module}
              className="grid grid-cols-[1fr_repeat(3,_80px)] px-5 py-3 items-center hover:bg-stone-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`${perm.icon} text-stone-500 text-sm`}></i>
                </div>
                <span className="text-sm text-stone-800">{perm.module}</span>
              </div>
              {roles.map((role) => {
                const has = perm[role];
                return (
                  <div key={role} className="flex justify-center">
                    {has ? (
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-50 border border-teal-200">
                        <i className="ri-check-line text-teal-600 text-xs"></i>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-stone-100 border border-stone-200">
                        <i className="ri-close-line text-stone-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon note */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <i className="ri-time-line text-amber-500 text-sm"></i>
        </div>
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Em desenvolvimento:</span>{' '}
          Permissões granulares por usuário com edição individual via toggles. Disponível na versão Enterprise.
        </p>
      </div>
    </div>
  );
}