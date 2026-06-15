import type { VehicleUtilizationStat } from '@/services/reports';

interface Props { data: VehicleUtilizationStat[] }

const typeIcon: Record<string, string> = {
  'Van Premium':    'ri-car-line',
  'Minibus':        'ri-bus-line',
  'Van Executiva':  'ri-car-line',
  'SUV Premium':    'ri-car-line',
  'Sedan Premium':  'ri-car-line',
};

const maintenanceConfig = {
  ok:        { label: 'Em dia',      bg: 'bg-teal-50',  text: 'text-teal-600',  dot: 'bg-teal-500' },
  due_soon:  { label: 'Próxima rev.', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  overdue:   { label: 'Atrasada',    bg: 'bg-red-50',   text: 'text-red-600',   dot: 'bg-red-500' },
};

function UtilizationBar({ pct, occPct }: { pct: number; occPct: number }) {
  const utilColor = pct >= 85 ? '#0f766e' : pct >= 65 ? '#1e3a5f' : '#d97706';
  return (
    <div className="space-y-1.5">
      <div>
        <div className="flex justify-between text-[11px] mb-0.5">
          <span className="text-stone-500">Utilização</span>
          <span className="font-semibold" style={{ color: utilColor }}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: utilColor }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[11px] mb-0.5">
          <span className="text-stone-500">Ocupação média</span>
          <span className="font-semibold text-stone-700">{occPct}%</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-stone-400 transition-all duration-700" style={{ width: `${occPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function ReportsVehicleUtilization({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">Utilização da Frota</h3>
          <p className="text-stone-400 text-xs mt-0.5">Taxa de uso, km e eficiência operacional</p>
        </div>
        <span className="text-xs text-[#1e3a5f] bg-navy-950/[0.06] px-2.5 py-1 rounded-full font-medium border border-navy-950/[0.1]">
          {data.length} veículos
        </span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100">
        {[
          { label: 'km total (frota)', value: data.reduce((a, v) => a + v.km_total, 0).toLocaleString('pt-BR') },
          { label: 'transfers realizados', value: data.reduce((a, v) => a + v.transfers, 0).toLocaleString('pt-BR') },
          { label: 'ocupação média', value: `${Math.round(data.reduce((a, v) => a + v.avg_occupancy_pct, 0) / data.length)}%` },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="font-serif text-lg font-semibold text-stone-800">{s.value}</p>
            <p className="text-stone-400 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-stone-100">
        {data.map((v) => {
          const mc = maintenanceConfig[v.maintenance_status];
          const icon = typeIcon[v.type] ?? 'ri-car-line';

          return (
            <div key={v.id} className="px-5 py-4 hover:bg-stone-50/60 transition-colors">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-950/[0.05] flex-shrink-0">
                  <i className={`${icon} text-[#1e3a5f] text-sm`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-stone-800">{v.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-stone-400 text-xs">{v.plate}</span>
                        <span className="text-stone-300 text-xs">·</span>
                        <span className="text-stone-500 text-xs">{v.type}</span>
                        <span className="text-stone-300 text-xs">·</span>
                        <span className="text-stone-500 text-xs">{v.capacity} lugares</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${mc.bg} ${mc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mc.dot}`}></span>
                        {mc.label}
                      </span>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="mt-2.5">
                    <UtilizationBar pct={v.utilization_pct} occPct={v.avg_occupancy_pct} />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] text-stone-400">
                      <span className="font-semibold text-stone-600">{v.transfers}</span> transfers
                    </span>
                    <span className="text-[11px] text-stone-400">
                      <span className="font-semibold text-stone-600">{v.km_total.toLocaleString('pt-BR')}</span> km total
                    </span>
                    {v.km_today > 0 && (
                      <span className="text-[11px] text-teal-600 font-semibold">
                        +{v.km_today} km hoje
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}