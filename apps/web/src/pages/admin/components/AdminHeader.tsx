import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name as string | undefined;
  const displayEmail = user?.email ?? '';
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : displayEmail.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-sand-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
          <i className="ri-compass-3-line text-amber-400 text-sm"></i>
        </div>
        <div>
          <span className="font-serif font-semibold text-navy-900 text-base leading-tight block">Experience Connect</span>
          <span className="text-teal-600 text-[10px] tracking-widest uppercase font-sans leading-none">Painel Administrativo</span>
        </div>
      </div>

      {/* Right — user menu */}
      <div className="flex items-center gap-4">
        {/* Notification bell placeholder */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors duration-150 cursor-pointer"
          aria-label="Notificações"
        >
          <i className="ri-notification-3-line text-base"></i>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-500"></span>
        </button>

        {/* Avatar / user menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-sand-100 transition-colors duration-150 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-semibold font-sans">{initials}</span>
            </div>
            <span className="text-navy-700 text-sm font-medium hidden sm:block max-w-[160px] truncate">
              {displayName ?? displayEmail}
            </span>
            <i className={`ri-arrow-down-s-line text-navy-400 text-sm transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-sand-200 rounded-2xl py-2 z-20">
                <div className="px-4 py-3 border-b border-sand-100">
                  <p className="text-navy-800 text-xs font-semibold truncate">{displayName ?? 'Administrador'}</p>
                  <p className="text-navy-400 text-xs truncate mt-0.5">{displayEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sand-50 text-navy-600 text-sm transition-colors duration-150 cursor-pointer"
                  >
                    <i className="ri-user-settings-line text-navy-400 text-sm"></i>
                    Minha conta
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sand-50 text-navy-600 text-sm transition-colors duration-150 cursor-pointer"
                  >
                    <i className="ri-settings-3-line text-navy-400 text-sm"></i>
                    Configurações
                  </button>
                </div>
                <div className="border-t border-sand-100 pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors duration-150 cursor-pointer"
                  >
                    <i className="ri-logout-box-r-line text-sm"></i>
                    Sair do painel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}