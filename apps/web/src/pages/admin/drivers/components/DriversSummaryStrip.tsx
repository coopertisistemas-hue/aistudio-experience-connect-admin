interface DriversSummaryStripProps {
  drivers: any[];
}

export default function DriversSummaryStrip({ drivers }: DriversSummaryStripProps) {
  const ativos = drivers.filter((d: any) => d.status !== 'pending').length;
  const emServico = drivers.filter((d: any) => ['on_trip', 'available'].includes(d.status)).length;
  const disponiveis = drivers.filter((d: any) => d.status === 'available').length;
  const emTransfer = drivers.filter((d: any) => d.status === 'on_trip').length;
  const offline = drivers.filter((d: any) => ['off_duty', 'paused', 'unavailable'].includes(d.status)).length;
  const ocorrencias = drivers.reduce((s: number, d: any) => s + (d.performance?.incidents || 0), 0);

  const kpis = [
    {
      label: 'Motoristas Ativos',
      value: ativos,
      icon: 'ri-steering-2-line',
      iconBg: 'bg-navy-50 border-navy-100',
      iconColor: 'text-navy-600',
      sub: `${drivers.length} cadastrados`,
      trend: 'neutral' as const,
    },
    {
      label: 'Em Serviço Hoje',
      value: emServico,
      icon: 'ri-user-follow-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: 'na operação',
      trend: 'up' as const,
    },
    {
      label: 'Disponíveis',
      value: disponiveis,
      icon: 'ri-checkbox-circle-line',
      iconBg: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600',
      sub: 'prontos para alocar',
      trend: disponiveis > 0 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Em Transfer',
      value: emTransfer,
      icon: 'ri-car-line',
      iconBg: 'bg-navy-50 border-navy-100',
      iconColor: 'text-navy-600',
      sub: 'em rota agora',
      trend: 'neutral' as const,
    },
    {
      label: 'Offline / Pausa',
      value: offline,
      icon: 'ri-user-unfollow-line',
      iconBg: 'bg-sand-100 border-sand-200',
      iconColor: 'text-navy-500',
      sub: 'fora de serviço',
      trend: 'neutral' as const,
    },
    {
      label: 'Ocorrências',
      value: ocorrencias,
      icon: 'ri-alert-line',
      iconBg: ocorrencias > 0 ? 'bg-amber-50 border-amber-200' : 'bg-sand-100 border-sand-200',
      iconColor: ocorrencias > 0 ? 'text-amber-600' : 'text-navy-400',
      sub: ocorrencias > 0 ? 'requer atenção' : 'operação limpa',
      trend: ocorrencias > 0 ? 'down' as const : 'neutral' as const,
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