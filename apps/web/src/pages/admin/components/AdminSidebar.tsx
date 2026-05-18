import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  soon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Operação',
    items: [
      { icon: 'ri-dashboard-3-line', label: 'Visão Geral', path: '/admin/dashboard' },
      { icon: 'ri-calendar-check-line', label: 'Reservas', path: '/admin/bookings' },
      { icon: 'ri-car-line', label: 'Transfers', path: '/admin/transfers' },
      { icon: 'ri-calendar-schedule-line', label: 'Agenda', path: '/admin/agenda' },
      { icon: 'ri-route-line', label: 'Rotas', path: '/admin/routes' },
      { icon: 'ri-check-double-line', label: 'Check-ins', path: '/admin/checkins' },
    ],
  },
  {
    label: 'Frota & Equipe',
    items: [
      { icon: 'ri-steering-2-line', label: 'Motoristas', path: '/admin/drivers' },
      { icon: 'ri-taxi-line', label: 'Veículos', path: '/admin/vehicles' },
      { icon: 'ri-calendar-2-line', label: 'Disponibilidade', path: '/admin/availability' },
    ],
  },
  {
    label: 'Experiências',
    items: [
      { icon: 'ri-compass-discover-line', label: 'Experiências', path: '/admin/experiences' },
      { icon: 'ri-hand-heart-line', label: 'Parceiros', path: '/admin/partners' },
      { icon: 'ri-price-tag-3-line', label: 'Categorias', path: '/admin/categories' },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { icon: 'ri-secure-payment-line', label: 'Pagamentos', path: '/admin/payments' },
      { icon: 'ri-money-dollar-circle-line', label: 'Recebíveis', path: '/admin/receivables' },
      { icon: 'ri-file-list-3-line', label: 'Conciliação', path: '/admin/reconciliation' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { icon: 'ri-contacts-book-2-line', label: 'Clientes', path: '/admin/clients' },
      { icon: 'ri-bar-chart-2-line', label: 'Relatórios', path: '/admin/reports' },
      { icon: 'ri-notification-3-line', label: 'Notificações', path: '/admin/notifications' },
      { icon: 'ri-search-eye-line', label: 'Pesquisa', path: '/admin/search' },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { icon: 'ri-settings-3-line', label: 'Configurações', path: '/admin/settings' },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/admin/settings'
      ? location.pathname.startsWith('/admin/settings')
      : location.pathname === path;

  const handleNav = (path: string, soon?: boolean) => {
    if (soon) return;
    navigate(path);
    onMobileClose();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-stone-200 flex-shrink-0 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-500/[0.12] border border-teal-300/50 flex-shrink-0">
          <i className="ri-compass-3-line text-teal-600 text-sm"></i>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-serif font-semibold text-navy-900 text-sm leading-tight block truncate">
              Experience Connect
            </span>
            <span className="text-stone-500 text-[10px] tracking-widest uppercase font-sans leading-none">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path, item.soon)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150 whitespace-nowrap
                      ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                      ${
                        active
                          ? 'bg-teal-500/[0.11] text-teal-700 border border-teal-400/35 cursor-pointer'
                          : item.soon
                          ? 'text-stone-400 cursor-default'
                          : 'text-[#2d4a63] hover:bg-stone-200/60 hover:text-navy-900 cursor-pointer'
                      }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        collapsed
                          ? 'w-5 h-5 flex items-center justify-center'
                          : 'w-4 h-4 flex items-center justify-center'
                      }`}
                    >
                      <i
                        className={`${item.icon} ${collapsed ? 'text-base' : 'text-sm'} ${
                          active ? 'text-teal-600' : item.soon ? 'text-stone-400' : 'text-[#3d6680]'
                        }`}
                      ></i>
                    </div>
                    {!collapsed && (
                      <>
                        <span className={`flex-1 text-left text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                        {item.soon && (
                          <span className="text-[9px] bg-white text-stone-500 px-1.5 py-0.5 rounded-full font-semibold border border-stone-200/80">
                            em breve
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-100/70 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse flex-shrink-0"></span>
            <span className="text-stone-500 text-[11px] font-medium truncate">Ecossistema Operacional</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-stone-100 border-r border-stone-200 z-40 transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-stone-100 border-r border-stone-200 flex-shrink-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}