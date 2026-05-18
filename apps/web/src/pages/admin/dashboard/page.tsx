import { useAuth } from '@/hooks/useAuth';
import DashboardKPIs from './DashboardKPIs';
import DashboardTransfers from './DashboardTransfers';
import DashboardAlerts from './DashboardAlerts';
import DashboardFinancialOverview from './DashboardFinancialOverview';
import DashboardExperiencesOverview from './DashboardExperiencesOverview';
import DashboardAvailabilitySnapshot from './DashboardAvailabilitySnapshot';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name as string | undefined;
  const firstName = displayName?.split(' ')[0] ?? 'Administrador';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-teal-700 text-[11px] font-medium tracking-wide">Operação ao vivo</span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-navy-950">
              {greeting}, <span className="text-teal-600">{firstName}</span>
            </h1>
            <p className="text-navy-400 text-sm font-light mt-1">
              Aqui está o resumo operacional de hoje.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-navy-700 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-sand-200"
            >
              <i className="ri-download-2-line text-sm"></i>
              Exportar
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Nova Reserva
            </button>
          </div>
        </div>
      </div>

      <DashboardKPIs />
      <DashboardTransfers />
      <DashboardAlerts />

      {/* Divider */}
      <div className="border-t border-stone-200 my-4"></div>

      <DashboardFinancialOverview />
      <DashboardExperiencesOverview />
      <DashboardAvailabilitySnapshot />
    </div>
  );
}