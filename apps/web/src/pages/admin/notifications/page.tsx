import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationsSummaryStrip from './components/NotificationsSummaryStrip';
import NotificationsFilterBar from './components/NotificationsFilterBar';
import type { NotificationsFilters } from './components/NotificationsFilterBar';
import NotificationsFeed from './components/NotificationsFeed';
import type { NotifItem } from './components/NotificationsFeed';

const EMPTY_FILTERS: NotificationsFilters = {
  search: '',
  category: '',
  severity: '',
  readState: 'all',
  period: 'all',
};

const GROUP_MAP: Record<string, NotificationsFilters['period']> = {
  'Hoje':        'today',
  'Ontem':       'yesterday',
  'Esta semana': 'week',
};

function todayGroup(t: string): string {
  const d = new Date(t);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Hoje';
  if (days < 2) return 'Ontem';
  return 'Esta semana';
}

function mapNotif(n: { id: string; type: string; title: string; message: string; is_read: boolean; created_at: string; booking_id: string | null }): NotifItem {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.message,
    severity: n.type === 'booking_confirmed' ? 'success' : 'info',
    category: 'Sistema',
    read: n.is_read,
    resolved: false,
    group: todayGroup(n.created_at),
    entity_ref: n.booking_id,
    entity_label: n.booking_id ? `#${n.booking_id.slice(0, 8)}` : null,
    icon: 'ri-notification-3-line',
    entity_path: null,
    timestamp: n.created_at,
    action_label: null,
    created_at: n.created_at,
  };
}

export default function NotificationsPage() {
  const { data: notifData } = useNotifications();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [filters, setFilters] = useState<NotificationsFilters>(EMPTY_FILTERS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = notifData?.data ?? [];
    if (raw.length > 0) {
      setNotifications(raw.map(mapNotif));
    }
  }, [notifData]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    showToast('Notificação marcada como lida.');
  }, [showToast]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações marcadas como lidas.');
  }, [showToast]);

  const handleResolve = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, resolved: true, read: true } : n));
    showToast('Notificação marcada como resolvida.');
  }, [showToast]);

  const handleIgnore = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notificação ignorada.');
  }, [showToast]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.description.toLowerCase().includes(q) && !(n.entity_ref?.toLowerCase().includes(q) ?? false)) return false;
      }
      if (filters.category && n.category !== filters.category) return false;
      if (filters.severity && n.severity !== filters.severity) return false;
      if (filters.readState === 'unread' && n.read) return false;
      if (filters.readState === 'read' && !n.read) return false;
      if (filters.period !== 'all') {
        const groupPeriod = GROUP_MAP[n.group];
        if (groupPeriod !== filters.period) return false;
      }
      return true;
    });
  }, [notifications, filters]);

  const liveStats = useMemo(() => ({
    unread:        notifications.filter((n) => !n.read).length,
    critical:      notifications.filter((n) => n.severity === 'critical').length,
    warning:       notifications.filter((n) => n.severity === 'warning').length,
    resolvedToday: notifications.filter((n) => n.resolved && n.group === 'Hoje').length,
    paymentAlerts: notifications.filter((n) => n.category === 'Pagamentos' && !n.resolved).length,
    opConflicts:   notifications.filter((n) => (n.category === 'Veículos' || n.category === 'Motoristas' || n.category === 'Disponibilidade') && !n.resolved).length,
  }), [notifications]);

  const unreadCount = liveStats.unread;

  return (
    <div className="p-6">
      <div className="mb-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-950">
                <i className="ri-notification-3-line text-white text-base"></i>
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-navy-950 leading-tight">Central de Notificações</h1>
                <p className="text-navy-400 text-xs font-light mt-0.5">Alertas operacionais, pagamentos, transfers e disponibilidade</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-50 border border-navy-100">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-navy-700 text-xs font-semibold">{unreadCount} não lida{unreadCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-navy-700 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-check-double-line text-sm"></i>Marcar todas lidas
            </button>
            <button type="button"
              className="flex items-center gap-2 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-settings-3-line text-sm"></i>Preferências
            </button>
          </div>
        </div>
      </div>

      <NotificationsSummaryStrip
        unread={liveStats.unread}
        critical={liveStats.critical}
        warning={liveStats.warning}
        resolvedToday={liveStats.resolvedToday}
        paymentAlerts={liveStats.paymentAlerts}
        opConflicts={liveStats.opConflicts}
      />

      <NotificationsFilterBar filters={filters} onChange={setFilters} totalResults={filtered.length} onMarkAllRead={handleMarkAllRead} />

      <NotificationsFeed notifications={filtered} loading={notifications.length === 0} onMarkRead={handleMarkRead} onResolve={handleResolve} onIgnore={handleIgnore} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-3 bg-navy-950 text-white rounded-xl text-xs font-medium whitespace-nowrap">
            <i className="ri-checkbox-circle-line text-teal-400 text-sm"></i>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
