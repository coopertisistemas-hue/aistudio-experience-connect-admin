export type SettingsSection =
  | 'empresa'
  | 'operacao'
  | 'equipe'
  | 'permissoes'
  | 'notificacoes'
  | 'integracoes'
  | 'branding'
  | 'seguranca';

interface NavItem {
  id: SettingsSection;
  icon: string;
  label: string;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'empresa', icon: 'ri-building-4-line', label: 'Empresa', description: 'Perfil e dados da organização' },
  { id: 'operacao', icon: 'ri-settings-3-line', label: 'Operação', description: 'Preferências operacionais' },
  { id: 'equipe', icon: 'ri-team-line', label: 'Equipe', description: 'Membros e funções' },
  { id: 'permissoes', icon: 'ri-shield-check-line', label: 'Permissões', description: 'Acesso por papel' },
  { id: 'notificacoes', icon: 'ri-notification-3-line', label: 'Notificações', description: 'Alertas e canais' },
  { id: 'integracoes', icon: 'ri-plug-2-line', label: 'Integrações', description: 'Serviços conectados' },
  { id: 'branding', icon: 'ri-palette-line', label: 'Branding', description: 'Visual da marca' },
  { id: 'seguranca', icon: 'ri-lock-password-line', label: 'Segurança', description: 'Sessões e autenticação' },
];

interface SettingsNavigationProps {
  active: SettingsSection;
  onChange: (s: SettingsSection) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function SettingsNavigation({
  active,
  onChange,
  mobileOpen,
  onMobileClose,
}: SettingsNavigationProps) {
  const handleClick = (id: SettingsSection) => {
    onChange(id);
    onMobileClose();
  };

  const NavList = () => (
    <div className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group ${
              isActive
                ? 'bg-teal-500/[0.10] border border-teal-400/30 text-teal-700'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <i className={`${item.icon} text-base ${isActive ? 'text-teal-600' : 'text-stone-500 group-hover:text-stone-700'}`}></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] leading-tight ${isActive ? 'font-semibold text-teal-800' : 'font-medium'}`}>
                {item.label}
              </p>
              <p className={`text-[11px] mt-0.5 truncate ${isActive ? 'text-teal-600/70' : 'text-stone-400'}`}>
                {item.description}
              </p>
            </div>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-teal-500 flex-shrink-0"></div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-stone-200 z-40 transform transition-transform duration-300 lg:hidden flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
          <span className="text-sm font-semibold text-stone-800">Navegação</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <i className="ri-close-line text-stone-600 text-sm"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0">
        <div className="bg-white border border-stone-200 rounded-2xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-3 mb-2">
            Categorias
          </p>
          <NavList />
        </div>
      </aside>
    </>
  );
}