import { mockKPIs } from '@/mocks/admin-dashboard';

interface KPICard {
  label: string;
  value: string | number;
  icon: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const kpiCards: KPICard[] = [
  { label: 'Reservas Hoje', value: mockKPIs.reservasHoje, icon: 'ri-calendar-check-line', iconBg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-600', sub: '+3 desde ontem', trend: 'up' },
  { label: 'Transfers Ativos', value: mockKPIs.transfersEmAndamento, icon: 'ri-car-line', iconBg: 'bg-navy-50 border-navy-100', iconColor: 'text-navy-600', sub: '1 atrasado', trend: 'down' },
  { label: 'Motoristas Ativos', value: mockKPIs.motoristasAtivos, icon: 'ri-steering-2-line', iconBg: 'bg-sand-100 border-sand-200', iconColor: 'text-navy-600', sub: 'de 6 disponíveis', trend: 'neutral' },
  { label: 'Ocupação Média', value: `${mockKPIs.ocupacaoMedia}%`, icon: 'ri-pie-chart-2-line', iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600', sub: 'da frota hoje', trend: 'up' },
  { label: 'Receita Confirmada', value: `R$ ${mockKPIs.receitaConfirmada.toLocaleString('pt-BR')}`, icon: 'ri-money-dollar-circle-line', iconBg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-600', sub: 'esta semana', trend: 'up' },
  { label: 'Check-ins Pendentes', value: mockKPIs.checkInsPendentes, icon: 'ri-checkbox-circle-line', iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600', sub: 'confirmação necessária', trend: 'down' },
];

export default function DashboardKPIs() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
      {kpiCards.map((card) => (
        <div key={card.label} className="bg-white border border-sand-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-sand-300 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border ${card.iconBg}`}>
              <i className={`${card.icon} ${card.iconColor} text-sm`}></i>
            </div>
            {card.trend && (
              <i className={`text-xs ${
                card.trend === 'up' ? 'ri-arrow-up-s-line text-teal-500' :
                card.trend === 'down' ? 'ri-arrow-down-s-line text-red-400' :
                'ri-subtract-line text-navy-300'
              }`}></i>
            )}
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-navy-950 leading-tight">{card.value}</div>
            <div className="text-navy-400 text-[11px] font-light mt-0.5 leading-tight">{card.label}</div>
            {card.sub && <div className="text-navy-300 text-[10px] mt-1">{card.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}