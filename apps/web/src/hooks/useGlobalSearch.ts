import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  status?: string;
  statusColor?: string;
  group: SearchGroup;
  icon: string;
  path: string;
}

export type SearchGroup =
  | 'Reservas'
  | 'Transfers'
  | 'Clientes'
  | 'Motoristas'
  | 'Veículos'
  | 'Rotas'
  | 'Pagamentos'
  | 'Experiências'
  | 'Parceiros';

export const GROUP_ICONS: Record<SearchGroup, string> = {
  Reservas:     'ri-calendar-check-line',
  Transfers:    'ri-car-line',
  Clientes:     'ri-contacts-book-2-line',
  Motoristas:   'ri-steering-2-line',
  Veículos:     'ri-taxi-line',
  Rotas:        'ri-route-line',
  Pagamentos:   'ri-secure-payment-line',
  Experiências: 'ri-compass-discover-line',
  Parceiros:    'ri-hand-heart-line',
};

export const GROUP_PATHS: Record<SearchGroup, string> = {
  Reservas:     '/admin/bookings',
  Transfers:    '/admin/transfers',
  Clientes:     '/admin/clients',
  Motoristas:   '/admin/drivers',
  Veículos:     '/admin/vehicles',
  Rotas:        '/admin/routes',
  Pagamentos:   '/admin/payments',
  Experiências: '/admin/experiences',
  Parceiros:    '/admin/partners',
};

export const QUICK_ACTIONS = [
  { id: 'qa-1', label: 'Nova Reserva',     icon: 'ri-calendar-check-line', path: '/admin/bookings',     color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'qa-2', label: 'Novo Transfer',    icon: 'ri-car-line',             path: '/admin/transfers',    color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'qa-3', label: 'Novo Cliente',     icon: 'ri-user-add-line',        path: '/admin/clients',      color: 'text-navy-700', bg: 'bg-navy-50' },
  { id: 'qa-4', label: 'Novo Pagamento',   icon: 'ri-secure-payment-line',  path: '/admin/payments',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'qa-5', label: 'Nova Experiência', icon: 'ri-compass-discover-line',path: '/admin/experiences',  color: 'text-amber-600', bg: 'bg-amber-50' },
];

const RECENT_STORAGE_KEY = 'ec_recent_searches';

export function useRecentSearches() {
  const getRecent = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecent = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    const current = getRecent();
    const updated = [query, ...current.filter((q) => q !== query)].slice(0, 5);
    try { localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated)); } catch { /* noop */ }
  };

  const clearRecent = () => {
    try { localStorage.removeItem(RECENT_STORAGE_KEY); } catch { /* noop */ }
  };

  return { getRecent, addRecent, clearRecent };
}

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, openSearch, closeSearch, navigateTo };
}