import { useNavigate } from 'react-router-dom';
import type { MockNotification } from '@/mocks/admin-notifications';
import { SEVERITY_LABELS, SEVERITY_STYLES } from '@/mocks/admin-notifications';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface NotificationItemProps {
  notification: MockNotification;
  onMarkRead: (id: string) => void;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
  showDate?: boolean;
}

export default function NotificationItem({
  notification: n,
  onMarkRead,
  onResolve,
  onIgnore,
  showDate = false,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const styles = SEVERITY_STYLES[n.severity];

  const handleNavigate = () => {
    if (n.entity_path) {
      if (!n.read) onMarkRead(n.id);
      navigate(n.entity_path);
    }
  };

  return (
    <div
      className={`group relative flex gap-4 px-5 py-4 rounded-2xl border transition-all duration-150
        ${n.read
          ? 'bg-white border-stone-200/80 hover:border-stone-300'
          : `bg-white border-stone-200/80 hover:border-stone-300 ${styles.border}`
        }
        ${n.resolved ? 'opacity-60' : ''}
      `}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${styles.dot} flex-shrink-0`} />
      )}

      {/* Icon */}
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5
        ${n.severity === 'critical' ? 'bg-red-50 border border-red-100' :
          n.severity === 'warning' ? 'bg-amber-50 border border-amber-100' :
          n.severity === 'success' ? 'bg-teal-50 border border-teal-100' :
          'bg-sky-50 border border-sky-100'}
      `}>
        <i className={`${n.icon} text-base ${styles.icon}`}></i>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-0.5 flex-wrap">
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${styles.badge}`}>
            {SEVERITY_LABELS[n.severity]}
          </span>
          <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            {n.category}
          </span>
          {n.entity_ref && (
            <span className="text-[10px] text-navy-500 font-medium bg-navy-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {n.entity_ref}
            </span>
          )}
        </div>

        {/* Title */}
        <p className={`text-sm leading-snug mb-1 ${n.read ? 'text-navy-600 font-medium' : 'text-navy-900 font-semibold'}`}>
          {n.title}
        </p>

        {/* Description */}
        <p className="text-navy-400 text-xs font-light leading-relaxed mb-2.5">
          {n.description}
        </p>

        {/* Footer row — actions + time */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {n.action_label && n.entity_path && (
              <button
                type="button"
                onClick={handleNavigate}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-right-line text-xs"></i>
                {n.action_label}
              </button>
            )}
            {!n.read && (
              <>
                <span className="text-stone-300 text-xs">·</span>
                <button
                  type="button"
                  onClick={() => onMarkRead(n.id)}
                  className="text-[11px] text-stone-400 hover:text-navy-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Marcar lida
                </button>
              </>
            )}
            {!n.resolved && n.severity !== 'info' && n.severity !== 'success' && (
              <>
                <span className="text-stone-300 text-xs">·</span>
                <button
                  type="button"
                  onClick={() => onResolve(n.id)}
                  className="text-[11px] text-stone-400 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Resolver
                </button>
                <span className="text-stone-300 text-xs">·</span>
                <button
                  type="button"
                  onClick={() => onIgnore(n.id)}
                  className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ignorar
                </button>
              </>
            )}
            {n.resolved && (
              <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                <i className="ri-checkbox-circle-line text-xs"></i>
                Resolvido
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-[10px]">
            <i className="ri-time-line text-xs"></i>
            <span>{showDate ? formatDate(n.timestamp) : formatTime(n.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}