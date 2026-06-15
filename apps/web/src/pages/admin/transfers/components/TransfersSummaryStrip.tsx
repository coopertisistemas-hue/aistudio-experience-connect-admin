import type { TransferItem } from '@/services/transfers';

interface TransfersSummaryStripProps {
  transfers: TransferItem[];
}

export default function TransfersSummaryStrip({ transfers }: TransfersSummaryStripProps) {
  const hoje = transfers.filter((t) => {
    const d = new Date(t.scheduled_at);
    const today = new Date('2026-05-17');
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });

  const emAndamento = transfers.filter((t) => t.status === 'in_progress').length;
  const finalizados = transfers.filter((t) => t.status === 'completed').length;
  const pendentes = transfers.filter((t) => t.status === 'confirmed').length;
  const motoristasAlocados = [...new Set(transfers.filter((t) => t.driver_id).map((t) => t.driver_id))].length;
  const veiculosEmUso = [...new Set(transfers.filter((t) => t.driver_id).map((t) => t.vehicle_plate).filter((p) => p !== '—'))].length;

  const kpis = [
    {
      label: 'Transfers Hoje',
      value: hoje.length,
      icon: 'ri-calendar-check-line',
      iconBg: 'bg-navy-50 border-navy-100',
      iconColor: 'text-navy-600',
      sub: `${transfers.length} no total`,
      trend: 'neutral' as const,
    },
    {
      label: 'Em Andamento',
      value: emAndamento,
      icon: 'ri-car-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: emAndamento > 0 ? 'operação ativa' : 'nenhum ativo',
      trend: emAndamento > 0 ? 'up' as const : 'neutral' as const,
    },
    {
      label: 'Finalizados',
      value: finalizados,
      icon: 'ri-flag-line',
      iconBg: 'bg-sand-100 border-sand-200',
      iconColor: 'text-navy-500',
      sub: 'hoje',
      trend: 'neutral' as const,
    },
    {
      label: 'Pendentes',
      value: pendentes,
      icon: 'ri-time-line',
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      sub: 'sem motorista',
      trend: pendentes > 0 ? 'down' as const : 'neutral' as const,
    },
    {
      label: 'Motoristas Alocados',
      value: motoristasAlocados,
      icon: 'ri-steering-2-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: 'em operação',
      trend: 'up' as const,
    },
    {
      label: 'Veículos em Uso',
      value: veiculosEmUso,
      icon: 'ri-taxi-line',
      iconBg: 'bg-sand-100 border-sand-200',
      iconColor: 'text-navy-600',
      sub: 'frota ativa',
      trend: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="bg-white border border-sand-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-sand-300 transition-colors duration-150"
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border ${k.iconBg}`}>
              <i className={`${k.icon} ${k.iconColor} text-sm`}></i>
            </div>
            <i className={`text-xs ${
              k.trend === 'up' ? 'ri-arrow-up-s-line text-teal-500' :
              k.trend === 'down' ? 'ri-arrow-down-s-line text-red-400' :
              'ri-subtract-line text-navy-300'
            }`}></i>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-navy-950 leading-tight">{k.value}</div>
            <div className="text-navy-400 text-[11px] font-light mt-0.5 leading-tight">{k.label}</div>
            {k.sub && <div className="text-navy-300 text-[10px] mt-1">{k.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}