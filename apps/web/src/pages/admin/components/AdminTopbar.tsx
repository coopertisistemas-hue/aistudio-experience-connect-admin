import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockNotifications, SEVERITY_STYLES, SEVERITY_LABELS } from '@/mocks/admin-notifications';

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onMobileMenuToggle: () => void;
  onSearchOpen: () => void;
}

export default function AdminTopbar({ onSidebarToggle, onMobileMenuToggle, onSearchOpen }: AdminTopbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isMac = navigator.platform.toLowerCase().includes('mac');
  const cmdHint = isMac ? '⌘K' : 'Ctrl+K';
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name as string | undefined;
  const displayEmail = user?.email ?? '';
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : displayEmail.slice(0, 2).toUpperCase();

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

  const recentNotifications = useMemo(() =>
    mockNotifications
      .filter((n) => !n.resolved)
      .sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2, success: 3 };
        return order[a.severity] - order[b.severity];
      })
      .slice(0, 5),
  []);
  const unreadCount = useMemo(() => mockNotifications.filter((n) => !n.read).length, []);

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center gap-3 px-4 flex-shrink-0 z-20">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sand-100 text-navy-500 transition-colors cursor-pointer"
        aria-label="Menu"
      >
        <i className="ri-menu-line text-base"></i>
      </button>

      {/* Desktop sidebar toggle */}
      <button
        type="button"
        onClick={onSidebarToggle}
        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer"
        aria-label="Colapsar menu"
      >
        <i className="ri-layout-left-2-line text-base"></i>
      </button>

      {/* Tenant org name */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-300/70 bg-stone-50 cursor-pointer hover:border-stone-300 hover:bg-stone-100/60 transition-colors">
        <div className="w-4 h-4 flex items-center justify-center rounded bg-navy-900">
          <i className="ri-building-4-line text-white text-[9px]"></i>
        </div>
        <span className="text-navy-800 text-xs font-semibold">Minha Empresa</span>
        <i className="ri-arrow-down-s-line text-navy-500 text-xs"></i>
      </div>

      {/* Search trigger */}
      <button
        type="button"
        onClick={onSearchOpen}
        className="flex-1 max-w-xs lg:max-w-sm h-8 flex items-center gap-2 px-3 bg-stone-50 border border-stone-300/60 rounded-xl text-left hover:border-stone-400/60 hover:bg-white transition-all duration-150 cursor-pointer group"
        aria-label="Abrir busca global"
      >
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <i className="ri-search-line text-navy-400 text-sm"></i>
        </div>
        <span className="flex-1 text-xs text-stone-400 truncate">Buscar reservas, transfers…</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-stone-200 text-navy-400 text-[10px] font-medium opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {cmdHint}
        </kbd>
      </button>

      <div className="flex-1"></div>

      {/* Date indicator */}
      <div className="hidden md:flex items-center gap-1.5 text-navy-400 text-xs font-light">
        <i className="ri-calendar-line text-navy-300 text-sm"></i>
        <span className="capitalize">{today}</span>
      </div>

      {/* Quick action */}
      <button
        type="button"
        className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl bg-navy-950 hover:bg-navy-900 text-white transition-colors cursor-pointer"
        aria-label="Nova reserva"
        title="Nova reserva"
      >
        <i className="ri-add-line text-sm"></i>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
          className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer"
          aria-label="Notificações"
        >
          <i className="ri-notification-3-line text-base"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 border border-white px-1">
              <span className="text-white text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-stone-200 rounded-2xl overflow-hidden z-20"
                 style={{ boxShadow: '0 16px 48px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <p className="text-navy-800 text-xs font-semibold">Notificações</p>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[9px] font-bold">
                      {unreadCount} não lidas
                    </span>
                  )}
                </div>
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Ver todas
                </Link>
              </div>

              {/* Notification items */}
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.map((notif) => {
                  const styles = SEVERITY_STYLES[notif.severity];
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-50 last:border-0 ${!notif.read ? styles.border : ''}`}
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5
                        ${notif.severity === 'critical' ? 'bg-red-50 border border-red-100' :
                          notif.severity === 'warning'  ? 'bg-amber-50 border border-amber-100' :
                          notif.severity === 'success'  ? 'bg-teal-50 border border-teal-100' :
                          'bg-sky-50 border border-sky-100'}`}>
                        <i className={`${notif.icon} text-xs ${styles.icon}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                            {SEVERITY_LABELS[notif.severity]}
                          </span>
                          <span className="text-[9px] text-stone-400">{notif.category}</span>
                        </div>
                        <p className={`text-xs leading-snug ${notif.read ? 'text-navy-600 font-medium' : 'text-navy-800 font-semibold'}`}>
                          {notif.title}
                        </p>
                        <p className="text-navy-400 text-[10px] mt-0.5 line-clamp-1">{notif.description}</p>
                      </div>
                      {!notif.read && (
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} flex-shrink-0 mt-2`}></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-stone-100 px-4 py-2.5 bg-stone-50/60">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-1.5 text-navy-600 text-xs font-medium hover:text-teal-600 transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-right-line text-sm"></i>
                  Ver central de notificações
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-sand-100 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold">{initials}</span>
          </div>
          <span className="text-navy-700 text-xs font-medium hidden sm:block max-w-[120px] truncate">
            {displayName ?? displayEmail}
          </span>
          <i className={`ri-arrow-down-s-line text-navy-400 text-xs transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-sand-200 rounded-2xl py-2 z-20">
              <div className="px-4 py-3 border-b border-sand-100">
                <p className="text-navy-800 text-xs font-semibold truncate">{displayName ?? 'Administrador'}</p>
                <p className="text-navy-400 text-[11px] truncate mt-0.5">{displayEmail}</p>
              </div>
              <div className="py-1">
                <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sand-50 text-navy-600 text-xs transition-colors cursor-pointer">
                  <i className="ri-user-settings-line text-navy-400 text-sm"></i>
                  Minha conta
                </button>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sand-50 text-navy-600 text-xs transition-colors cursor-pointer">
                  <i className="ri-settings-3-line text-navy-400 text-sm"></i>
                  Configurações
                </button>
              </div>
              <div className="border-t border-sand-100 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-xs transition-colors cursor-pointer"
                >
                  <i className="ri-logout-box-r-line text-sm"></i>
                  Sair do painel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}