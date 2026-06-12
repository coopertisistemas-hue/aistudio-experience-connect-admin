import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@connect/ui';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';

export default function DashboardKPIs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';
  const { data: kpis, isLoading } = useDashboardKPIs(tenantId);

  useRealtime(supabase as any, {
    table: 'payments',
    event: '*',
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis', tenantId] });
    },
  });

  useRealtime(supabase as any, {
    table: 'bookings',
    event: '*',
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis', tenantId] });
    },
  });

  const kpiCards = kpis ? [
    { label: 'Reservas Hoje', value: kpis.reservasHoje, icon: 'ri-calendar-check-line', iconBg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-600' },
    { label: 'Transfers Ativos', value: kpis.transfersAtivos, icon: 'ri-car-line', iconBg: 'bg-navy-50 border-navy-100', iconColor: 'text-navy-600' },
    { label: 'Motoristas Ativos', value: kpis.motoristasAtivos, icon: 'ri-steering-2-line', iconBg: 'bg-sand-100 border-sand-200', iconColor: 'text-navy-600' },
    { label: 'Ocupação Média', value: `${kpis.ocupacaoMedia}%`, icon: 'ri-pie-chart-2-line', iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
    { label: 'Receita Confirmada', value: `R$ ${kpis.receitaConfirmada.toLocaleString('pt-BR')}`, icon: 'ri-money-dollar-circle-line', iconBg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-600' },
    { label: 'Check-ins Pendentes', value: kpis.checkInsPendentes, icon: 'ri-checkbox-circle-line', iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-sand-200 rounded-2xl p-4 animate-pulse">
            <div className="w-8 h-8 bg-sand-200 rounded-xl mb-3" />
            <div className="h-7 bg-sand-200 rounded w-16 mb-1" />
            <div className="h-3 bg-sand-100 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
      {kpiCards.map((card) => (
        <div key={card.label} className="bg-white border border-sand-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-sand-300 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border ${card.iconBg}`}>
              <i className={`${card.icon} ${card.iconColor} text-sm`}></i>
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-navy-950 leading-tight">{card.value}</div>
            <div className="text-navy-400 text-[11px] font-light mt-0.5 leading-tight">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}