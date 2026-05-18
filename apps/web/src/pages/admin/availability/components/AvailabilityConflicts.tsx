import type { AvailabilityConflict } from '@/mocks/admin-availability';

interface AvailabilityConflictsProps {
  conflicts: AvailabilityConflict[];
  onFocus: (id: string) => void;
}

const conflictConfig: Record<string, { icon: string; label: string }> = {
  double_booking:        { icon: 'ri-user-voice-line',        label: 'Dupla alocação' },
  vehicle_overlap:       { icon: 'ri-taxi-line',              label: 'Veículo duplicado' },
  driver_overlap:        { icon: 'ri-steering-2-line',        label: 'Motorista indisponível' },
  maintenance_conflict:  { icon: 'ri-tools-line',             label: 'Conflito de manutenção' },
  no_driver:             { icon: 'ri-user-unfollow-line',     label: 'Sem cobertura' },
};

const severityConfig: Record<string, { border: string; bg: string; badge: string; badgeText: string; dot: string }> = {
  high:   { border: 'border-red-200',   bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200',   badgeText: 'Alta',   dot: 'bg-red-500 animate-pulse' },
  medium: { border: 'border-amber-200', bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-200', badgeText: 'Média', dot: 'bg-amber-500' },
  low:    { border: 'border-stone-200', bg: 'bg-stone-50',  badge: 'bg-stone-100 text-stone-600 border-stone-200', badgeText: 'Baixa', dot: 'bg-stone-400' },
};

export default function AvailabilityConflicts({ conflicts, onFocus }: AvailabilityConflictsProps) {
  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-teal-600 text-lg"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-800">Sem conflitos detectados</p>
          <p className="text-xs text-teal-600 mt-0.5">A operação desta semana está sem sobreposições ou inconsistências.</p>
        </div>
      </div>
    );
  }

  const high = conflicts.filter((c) => c.severity === 'high');
  const medium = conflicts.filter((c) => c.severity === 'medium');
  const low = conflicts.filter((c) => c.severity === 'low');

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <i className="ri-error-warning-line text-red-500 text-sm"></i>
          <span className="text-sm font-semibold text-stone-800">Conflitos Operacionais</span>
          <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            {conflicts.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {high.length > 0 && (
            <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              {high.length} crítico{high.length > 1 ? 's' : ''}
            </span>
          )}
          {medium.length > 0 && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {medium.length} médio{medium.length > 1 ? 's' : ''}
            </span>
          )}
          {low.length > 0 && (
            <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
              {low.length} baixo{low.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Conflict cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {conflicts.map((conflict) => {
          const sev = severityConfig[conflict.severity];
          const typeInfo = conflictConfig[conflict.type];

          return (
            <div
              key={conflict.id}
              className={`border rounded-2xl p-4 transition-all ${sev.bg} ${sev.border}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5 border ${sev.border} bg-white/70`}>
                  <i className={`${typeInfo.icon} text-sm ${
                    conflict.severity === 'high' ? 'text-red-600' :
                    conflict.severity === 'medium' ? 'text-amber-600' : 'text-stone-500'
                  }`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-stone-800 leading-tight">{conflict.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${sev.badge}`}>
                      <span className={`w-1 h-1 rounded-full ${sev.dot}`}></span>
                      {sev.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-2 leading-relaxed">{conflict.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-calendar-event-line text-stone-400 text-[11px]"></i>
                      <span className="text-[11px] text-stone-500">{conflict.day}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-time-line text-stone-400 text-[11px]"></i>
                      <span className="text-[11px] text-stone-500">{conflict.time_range}</span>
                    </div>
                    {conflict.booking_ref && (
                      <div className="flex items-center gap-1.5">
                        <i className="ri-hashtag text-stone-400 text-[11px]"></i>
                        <span className="text-[11px] font-mono text-stone-600">{conflict.booking_ref}</span>
                      </div>
                    )}
                  </div>

                  {/* Affected names */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {conflict.affected_names.map((name) => (
                      <span
                        key={name}
                        className="text-[11px] font-medium text-stone-700 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-lg"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Focus action */}
                <button
                  type="button"
                  onClick={() => onFocus(conflict.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 bg-white/70 border border-stone-200 rounded-xl hover:bg-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 self-start"
                >
                  <i className="ri-focus-3-line text-xs"></i>
                  Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}