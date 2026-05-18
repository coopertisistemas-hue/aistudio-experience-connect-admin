import { useState } from 'react';
import type { AgendaConflict } from '@/mocks/admin-agenda';

interface AgendaConflictAlertsProps {
  conflicts: AgendaConflict[];
  onItemClick?: (id: string) => void;
}

const conflictIconMap: Record<string, string> = {
  driver_double: 'ri-user-2-line',
  vehicle_double: 'ri-car-line',
  time_overlap: 'ri-timer-flash-line',
  capacity_exceeded: 'ri-group-line',
  operational_delay: 'ri-alarm-warning-line',
};

const conflictColorMap: Record<string, { container: string; icon: string; dot: string }> = {
  critical: {
    container: 'bg-red-50 border-red-200/70',
    icon: 'text-red-500 bg-red-100',
    dot: 'bg-red-500',
  },
  warning: {
    container: 'bg-amber-50/80 border-amber-200/70',
    icon: 'text-amber-600 bg-amber-100',
    dot: 'bg-amber-500',
  },
};

export default function AgendaConflictAlerts({ conflicts, onItemClick }: AgendaConflictAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const visible = conflicts.filter((c) => !dismissed.has(c.id));
  if (visible.length === 0) return null;

  const critical = visible.filter((c) => c.severity === 'critical').length;
  const warning = visible.filter((c) => c.severity === 'warning').length;

  return (
    <div className="mb-5 bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-sand-50 transition-colors"
      >
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 border border-red-100 flex-shrink-0">
          <i className="ri-alert-line text-red-500 text-sm"></i>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-navy-800">
            Alertas Operacionais
            <span className="ml-2 text-xs font-normal text-navy-400">{visible.length} ativo(s)</span>
          </p>
          <p className="text-[11px] text-navy-400 mt-0.5">
            {critical > 0 && <span className="text-red-500 font-medium">{critical} crítico(s)</span>}
            {critical > 0 && warning > 0 && <span className="text-navy-300 mx-1">·</span>}
            {warning > 0 && <span className="text-amber-600 font-medium">{warning} aviso(s)</span>}
          </p>
        </div>
        {collapsed
          ? <i className="ri-arrow-down-s-line text-navy-400 text-base flex-shrink-0"></i>
          : <i className="ri-arrow-up-s-line text-navy-400 text-base flex-shrink-0"></i>
        }
      </button>

      {/* Alerts list */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2.5">
          {visible.map((conflict) => {
            const colors = conflictColorMap[conflict.severity];
            const iconName = conflictIconMap[conflict.type] ?? 'ri-alert-line';
            return (
              <div
                key={conflict.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${colors.container}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${colors.icon}`}>
                  <i className={`${iconName} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}></span>
                    <p className="text-xs font-semibold text-navy-800">{conflict.label}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                      conflict.severity === 'critical'
                        ? 'bg-red-100 text-red-600 border-red-200'
                        : 'bg-amber-100 text-amber-600 border-amber-200'
                    }`}>
                      {conflict.severity === 'critical' ? 'Crítico' : 'Aviso'}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-500 leading-relaxed">{conflict.description}</p>
                  {onItemClick && conflict.affected_item_ids.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {conflict.affected_item_ids.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onItemClick(id)}
                          className="text-[10px] text-navy-600 bg-white border border-sand-200 px-2 py-0.5 rounded-lg hover:bg-sand-100 transition-colors cursor-pointer font-medium"
                        >
                          Ver item
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDismissed((s) => new Set([...s, conflict.id]))}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-navy-300 hover:text-navy-600 hover:bg-white/60 transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}