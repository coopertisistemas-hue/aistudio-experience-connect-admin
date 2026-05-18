import { Link } from 'react-router-dom';
import { mockPayments } from '@/mocks/admin-payments';
import { mockReceivables } from '@/mocks/admin-receivables';

// Compute live stats from mocks
const activeReceivables = mockReceivables.filter((r) => r.status !== 'cancelled');
const totalReceivable = activeReceivables.reduce((a, r) => a + r.amount, 0);
const collected = activeReceivables.reduce((a, r) => a + r.amount_received, 0);
const overdueAmount = mockReceivables.filter((r) => r.status === 'overdue').reduce((a, r) => a + r.amount, 0);
const reconciliationRate = totalReceivable > 0 ? Math.round((collected / totalReceivable) * 100) : 0;

const next30days = mockReceivables
  .filter((r) => {
    const due = new Date(r.due_date);
    const now = new Date('2026-05-17');
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30 && (r.status === 'open' || r.status === 'partial');
  })
  .reduce((a, r) => a + (r.amount - r.amount_received), 0);

const pendingPayments = mockPayments.filter((p) => p.status === 'pending').length;
const overduePayments = mockPayments.filter((p) => p.status === 'overdue').length;

const CASHFLOW = [
  { label: 'Mai 17', collected: 2890, pending: 520 },
  { label: 'Mai 18', collected: 1200, pending: 950 },
  { label: 'Mai 19', collected: 780, pending: 390 },
  { label: 'Mai 20', collected: 1850, pending: 0 },
  { label: 'Mai 21', collected: 0, pending: 1200 },
  { label: 'Mai 22', collected: 0, pending: 680 },
];
const maxBar = Math.max(...CASHFLOW.flatMap((d) => [d.collected, d.pending]), 1);

function fmt(n: number) {
  return n >= 1000 ? `R$ ${(n / 1000).toFixed(1)}k` : `R$ ${n}`;
}

export default function DashboardFinancialOverview() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-line-chart-line text-teal-600 text-base"></i>
          </div>
          <h2 className="text-navy-800 text-sm font-semibold">Visão Financeira</h2>
          <span className="text-stone-400 text-xs font-light">Recebíveis · Conciliação · Fluxo previsto</span>
        </div>
        <Link
          to="/admin/receivables"
          className="text-xs text-teal-600 hover:text-teal-700 transition-colors font-medium cursor-pointer"
        >
          Ver recebíveis
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Recebíveis</p>
              <p className="text-navy-900 text-2xl font-semibold">{fmt(totalReceivable)}</p>
              <p className="text-stone-400 text-xs mt-1">Total a receber</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
              <i className="ri-money-dollar-circle-line text-teal-600 text-base"></i>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-stone-400">Coletado</span>
                <span className="text-[11px] font-medium text-teal-600">{fmt(collected)}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((collected / Math.max(totalReceivable, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <i className="ri-alarm-warning-line text-red-500 text-xs"></i>
                <span className="text-xs text-red-700 font-medium">Em atraso</span>
              </div>
              <span className="text-xs font-semibold text-red-600">{fmt(overdueAmount)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <i className="ri-time-line text-amber-600 text-xs"></i>
                <span className="text-xs text-amber-700 font-medium">Pend. (30d)</span>
              </div>
              <span className="text-xs font-semibold text-amber-600">{fmt(next30days)}</span>
            </div>
          </div>
        </div>

        {/* Reconciliation card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Conciliação</p>
              <p className="text-navy-900 text-2xl font-semibold">{reconciliationRate}%</p>
              <p className="text-stone-400 text-xs mt-1">Taxa de conciliação</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
              <i className="ri-scales-line text-indigo-600 text-base"></i>
            </div>
          </div>

          {/* Ring chart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f0ee" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={reconciliationRate >= 80 ? '#18A79B' : reconciliationRate >= 60 ? '#D4A84B' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${reconciliationRate} ${100 - reconciliationRate}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-navy-800">
                {reconciliationRate}%
              </span>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Recebidos</span>
                <span className="text-[11px] font-medium text-teal-600">
                  {mockReceivables.filter((r) => r.status === 'received').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Pendentes</span>
                <span className="text-[11px] font-medium text-amber-600">{pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Vencidos</span>
                <span className="text-[11px] font-medium text-red-500">{overduePayments}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/reconciliation"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <i className="ri-scales-line text-sm"></i>
            Ver conciliação
          </Link>
        </div>

        {/* Cashflow forecast */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Fluxo Previsto</p>
              <p className="text-navy-900 text-2xl font-semibold">{fmt(next30days + collected)}</p>
              <p className="text-stone-400 text-xs mt-1">Próximos 6 dias</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <i className="ri-bar-chart-line text-emerald-600 text-base"></i>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-16 mb-3">
            {CASHFLOW.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '100%' }}>
                  {day.collected > 0 && (
                    <div
                      className="w-full bg-teal-400/80 rounded-sm"
                      style={{ height: `${(day.collected / maxBar) * 60}px` }}
                    />
                  )}
                  {day.pending > 0 && (
                    <div
                      className="w-full bg-amber-300/70 rounded-sm"
                      style={{ height: `${(day.pending / maxBar) * 60}px` }}
                    />
                  )}
                  {day.collected === 0 && day.pending === 0 && (
                    <div className="w-full bg-stone-100 rounded-sm" style={{ height: '4px' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-1.5 mb-3">
            {CASHFLOW.map((day) => (
              <div key={day.label} className="flex-1 text-center">
                <span className="text-[9px] text-stone-400">{day.label.split(' ')[1]}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-teal-400/80"></div>
              <span className="text-[10px] text-stone-400">Confirmado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-300/70"></div>
              <span className="text-[10px] text-stone-400">Pendente</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}