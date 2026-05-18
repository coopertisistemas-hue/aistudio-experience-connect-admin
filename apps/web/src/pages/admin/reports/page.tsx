import { useState, useEffect } from 'react';
import type { ReportPeriod } from './components/ReportsFiltersBar';
import ReportsExecutiveSummary from './components/ReportsExecutiveSummary';
import ReportsFiltersBar from './components/ReportsFiltersBar';
import ReportsTransferVolume from './components/ReportsTransferVolume';
import ReportsDriverPerformance from './components/ReportsDriverPerformance';
import ReportsVehicleUtilization from './components/ReportsVehicleUtilization';
import ReportsRouteAnalytics from './components/ReportsRouteAnalytics';
import ReportsRevenueSummary from './components/ReportsRevenueSummary';

type ReportSection = 'all' | 'transfers' | 'drivers' | 'vehicles' | 'routes' | 'revenue';

const sectionTabs: { id: ReportSection; label: string; icon: string }[] = [
  { id: 'all',       label: 'Visão Geral',  icon: 'ri-layout-grid-line' },
  { id: 'transfers', label: 'Transfers',    icon: 'ri-car-line' },
  { id: 'drivers',   label: 'Motoristas',  icon: 'ri-steering-2-line' },
  { id: 'vehicles',  label: 'Frota',       icon: 'ri-taxi-line' },
  { id: 'routes',    label: 'Rotas',       icon: 'ri-route-line' },
  { id: 'revenue',   label: 'Receita',     icon: 'ri-money-dollar-circle-line' },
];

const periodLabels: Record<ReportPeriod, string> = {
  today:   'hoje',
  week:    'esta semana',
  month:   'este mês',
  '3months': 'últimos 3 meses',
  year:    'este ano',
  custom:  'período personalizado',
};

interface Toast {
  id: number;
  message: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-stone-200 rounded-xl h-24" />)}
      </div>
      <div className="bg-stone-200 rounded-xl h-14" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-stone-200 rounded-xl h-72" />
        <div className="bg-stone-200 rounded-xl h-72" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [section, setSection] = useState<ReportSection>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const addToast = (msg: string) => {
    const id = counter + 1;
    setCounter(id);
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'share') => {
    const msgs = {
      pdf:   'Gerando relatório PDF… estará disponível em instantes.',
      excel: 'Exportando planilha Excel… aguarde o download.',
      share: 'Link de compartilhamento copiado para a área de transferência.',
    };
    addToast(msgs[format]);
  };

  const show = (s: ReportSection) => section === 'all' || section === s;

  if (loading) {
    return <div className="p-6 lg:p-8"><LoadingSkeleton /></div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Relatórios</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Inteligência operacional — dados de <span className="font-medium text-stone-700">{periodLabels[period]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addToast('Relatório executivo gerado com sucesso.')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-950 text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-bar-chart-2-line"></i>
            Resumo Executivo
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSection(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              section === tab.id
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <i className={`${tab.icon} text-xs`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <ReportsFiltersBar period={period} onPeriodChange={setPeriod} onExport={handleExport} />

      {/* Executive KPIs — always visible */}
      <ReportsExecutiveSummary />

      {/* Transfer Volume */}
      {show('transfers') && (
        <ReportsTransferVolume />
      )}

      {/* Two-column: Driver + Vehicle */}
      {(show('drivers') || show('vehicles')) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {show('drivers') && <ReportsDriverPerformance />}
          {show('vehicles') && <ReportsVehicleUtilization />}
        </div>
      )}

      {/* Two-column: Routes + Revenue */}
      {(show('routes') || show('revenue')) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {show('routes') && <ReportsRouteAnalytics />}
          {show('revenue') && <ReportsRevenueSummary />}
        </div>
      )}

      {/* Empty for specific section with no data edge case */}
      {section !== 'all' &&
        !['transfers','drivers','vehicles','routes','revenue'].includes(section) && (
        <div className="bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-stone-100">
            <i className="ri-bar-chart-2-line text-2xl text-stone-400"></i>
          </div>
          <p className="text-stone-500 font-medium text-sm">Sem dados para este relatório</p>
          <p className="text-stone-400 text-xs">Ajuste o período ou os filtros e tente novamente</p>
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-[#0f2a40] text-white text-sm font-medium pointer-events-auto"
          >
            <i className="ri-checkbox-circle-line text-teal-400"></i>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}