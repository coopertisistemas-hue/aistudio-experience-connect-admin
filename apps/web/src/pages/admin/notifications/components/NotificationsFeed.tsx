import type { MockNotification, NotificationGroup } from '@/mocks/admin-notifications';
import NotificationItem from './NotificationItem';

interface NotificationsFeedProps {
  notifications: MockNotification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}

const GROUP_ORDER: NotificationGroup[] = ['Hoje', 'Ontem', 'Esta semana'];

export default function NotificationsFeed({
  notifications,
  loading,
  onMarkRead,
  onResolve,
  onIgnore,
}: NotificationsFeedProps) {
  // Group by temporal label
  const grouped = GROUP_ORDER.reduce<Record<string, MockNotification[]>>((acc, g) => {
    const items = notifications.filter((n) => n.group === g);
    if (items.length > 0) acc[g] = items;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-stone-100 rounded-full"></div>
                  <div className="h-4 w-20 bg-stone-100 rounded-full"></div>
                </div>
                <div className="h-4 w-3/4 bg-stone-100 rounded-lg"></div>
                <div className="h-3 w-full bg-stone-100 rounded-lg"></div>
                <div className="h-3 w-2/3 bg-stone-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-5">
          <i className="ri-notification-off-line text-stone-400 text-2xl"></i>
        </div>
        <p className="text-navy-700 text-sm font-medium mb-1">Nenhuma notificação encontrada</p>
        <p className="text-stone-400 text-xs font-light text-center max-w-xs">
          Tente ajustar os filtros ou aguarde novas atualizações operacionais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          {/* Group header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{group}</h3>
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {items.length} notificação{items.length !== 1 ? 'ões' : ''}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={onMarkRead}
                onResolve={onResolve}
                onIgnore={onIgnore}
                showDate={group !== 'Hoje'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}