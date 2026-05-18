import { useMemo } from 'react';
import type { MockVehicle } from '@/mocks/admin-vehicles';

interface VehiclesSummaryStripProps {
  vehicles: MockVehicle[];
}

export default function VehiclesSummaryStrip({ vehicles }: VehiclesSummaryStripProps) {
  const kpis = useMemo(() => {
    const active = vehicles.filter((v) => v.status !== 'inactive');
    const inOp = vehicles.filter((v) => v.status === 'in_operation');
    const avail = vehicles.filter((v) => v.status === 'available');
    const maintenance = vehicles.filter((v) => v.status === 'maintenance');
    const totalCap = active.reduce((sum, v) => sum + v.capacity, 0);
    const totalOccupied = inOp.reduce((sum, v) => sum + v.current_occupancy, 0);
    const totalInOpCap = inOp.reduce((sum, v) => sum + v.capacity, 0);
    const avgOcc = totalInOpCap > 0 ? Math.round((totalOccupied / totalInOpCap) * 100) : 0;

    return [
      {
        label: 'Veículos Ativos',
        value: active.length,
        sub: `de ${vehicles.length} cadastrados`,
        icon: 'ri-car-line',
        iconBg: 'bg-navy-50',
        iconColor: 'text-navy-600',
        accent: false,
      },
      {
        label: 'Em Operação',
        value: inOp.length,
        sub: 'transfers em andamento',
        icon: 'ri-run-line',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
        accent: inOp.length > 0,
        accentColor: 'text-teal-600',
      },
      {
        label: 'Disponíveis',
        value: avail.length,
        sub: 'prontos para operar',
        icon: 'ri-checkbox-circle-line',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-500',
        accent: false,
      },
      {
        label: 'Em Manutenção',
        value: maintenance.length,
        sub: maintenance.length > 0 ? 'fora de operação' : 'sem pendências',
        icon: 'ri-tools-line',
        iconBg: maintenance.length > 0 ? 'bg-amber-50' : 'bg-sand-50',
        iconColor: maintenance.length > 0 ? 'text-amber-500' : 'text-navy-400',
        accent: maintenance.length > 0,
        accentColor: 'text-amber-600',
      },
      {
        label: 'Capacidade Total',
        value: totalCap,
        sub: 'passageiros (frota ativa)',
        icon: 'ri-group-line',
        iconBg: 'bg-navy-50',
        iconColor: 'text-navy-600',
        accent: false,
      },
      {
        label: 'Ocupação Média',
        value: `${avgOcc}%`,
        sub: `${totalOccupied} / ${totalInOpCap} lugares`,
        icon: 'ri-bar-chart-fill',
        iconBg: avgOcc >= 80 ? 'bg-amber-50' : 'bg-sand-50',
        iconColor: avgOcc >= 80 ? 'text-amber-500' : 'text-navy-500',
        accent: avgOcc >= 80,
        accentColor: 'text-amber-600',
        isPercent: true,
        pct: avgOcc,
      },
    ];
  }, [vehicles]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-white border border-sand-200 rounded-2xl px-4 py-4 flex flex-col gap-3 hover:border-sand-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${kpi.iconBg}`}>
              <i className={`${kpi.icon} text-sm ${kpi.iconColor}`}></i>
            </div>
            {'isPercent' in kpi && kpi.isPercent && (
              <div className="h-1 w-12 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${kpi.pct >= 80 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ width: `${kpi.pct}%` }}
                ></div>
              </div>
            )}
          </div>
          <div>
            <p className={`font-serif text-2xl font-semibold ${kpi.accent ? (kpi.accentColor ?? 'text-navy-800') : 'text-navy-800'}`}>
              {kpi.value}
            </p>
            <p className="text-[10px] font-semibold text-navy-500 mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-navy-400 mt-0.5">{kpi.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}