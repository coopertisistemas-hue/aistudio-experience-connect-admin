import type { AgendaItem, AgendaConflict } from '@/mocks/admin-agenda';

interface AgendaSummaryStripProps {
  items: AgendaItem[];
  allConflicts: AgendaConflict[];
}

export default function AgendaSummaryStrip({ items, allConflicts }: AgendaSummaryStripProps) {
  const transfersHoje = items.filter((i) => i.booking_type === 'transfer').length;
  const motoristaIds = [...new Set(items.filter((i) => i.driver).map((i) => i.driver!.id))];
  const motoristasAtivos = motoristaIds.length;
  const veiculosOp = [...new Set(items.filter((i) => i.driver).map((i) => i.driver!.vehicle_plate))].length;
  const checkInsPendentes = items.filter((i) => i.status === 'driver_assigned' || i.status === 'scheduled').length;
  const conflitos = allConflicts.length;
  const totalPax = items.reduce((s, i) => s + i.passenger_count, 0);
  const maxPax = items.reduce((s, i) => s + (i.driver?.vehicle_capacity ?? 0), 0);
  const capacidade = maxPax > 0 ? Math.round((totalPax / maxPax) * 100) : 0;

  const kpis = [
    {
      label: 'Transfers Hoje',
      value: transfersHoje,
      icon: 'ri-car-line',
      iconBg: 'bg-navy-50 border-navy-100',
      iconColor: 'text-navy-600',
      sub: `${items.filter((i) => i.status === 'in_progress').length} em andamento`,
    },
    {
      label: 'Motoristas Ativos',
      value: motoristasAtivos,
      icon: 'ri-steering-2-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: `de ${motoristaIds.length + items.filter((i) => !i.driver).length > 0 ? 4 : 4} disponíveis`,
    },
    {
      label: 'Veículos em Operação',
      value: veiculosOp,
      icon: 'ri-taxi-line',
      iconBg: 'bg-sand-100 border-sand-200',
      iconColor: 'text-navy-600',
      sub: 'frota alocada',
    },
    {
      label: 'Check-ins Pendentes',
      value: checkInsPendentes,
      icon: 'ri-checkbox-blank-circle-line',
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      sub: 'confirmação necessária',
    },
    {
      label: 'Conflitos Operacionais',
      value: conflitos,
      icon: 'ri-alert-line',
      iconBg: conflitos > 0 ? 'bg-red-50 border-red-100' : 'bg-sand-100 border-sand-200',
      iconColor: conflitos > 0 ? 'text-red-500' : 'text-navy-400',
      sub: conflitos > 0 ? `${allConflicts.filter((c) => c.severity === 'critical').length} crítico(s)` : 'operação limpa',
    },
    {
      label: 'Capacidade Utilizada',
      value: `${capacidade}%`,
      icon: 'ri-pie-chart-2-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: `${totalPax} passageiros`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="bg-white border border-sand-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-sand-300 transition-colors duration-150"
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border ${k.iconBg}`}>
              <i className={`${k.icon} ${k.iconColor} text-sm`}></i>
            </div>
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