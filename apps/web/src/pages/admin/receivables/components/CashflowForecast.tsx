import { useState } from 'react';

interface CashflowEntry { date: string; label: string; expected: number; received: number }
type View = 'weekly' | 'monthly';

interface Props { weekly: CashflowEntry[]; monthly: CashflowEntry[] }

export default function CashflowForecast({ weekly, monthly }: Props) {
  const [view, setView] = useState<View>('weekly');
  const data = view === 'weekly' ? weekly : monthly;
  const maxVal = Math.max(...data.map((d) => d.expected), 1);

  const totalExpected = data.reduce((s, d) => s + d.expected, 0);
  const totalReceived = data.reduce((s, d) => s + d.received, 0);
  const pendingAmount = totalExpected - totalReceived;
  const receiptRate = Math.round((totalReceived / totalExpected) * 100);

  const fmt = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v.toLocaleString('pt-BR')}`;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-stone-800 font-serif">Previsão de Caixa</h3>
          <p className="text-xs text-stone-500 mt-0.5">Recebimentos esperados vs realizados</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          {(['weekly', 'monthly'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`h-7 px-3 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap
                ${view === v ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {v === 'weekly' ? 'Semanal' : 'Mensal'}
            </button>
          ))}
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-teal-600 uppercase tracking-wide font-semibold mb-0.5">Realizado</p>
          <p className="text-sm font-bold text-teal-700 font-serif">{fmt(totalReceived)}</p>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold mb-0.5">Pendente</p>
          <p className="text-sm font-bold text-stone-700 font-serif">{fmt(pendingAmount)}</p>
        </div>
        <div className={`border rounded-xl px-3 py-2.5 ${receiptRate >= 80 ? 'bg-emerald-50 border-emerald-100' : receiptRate >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-[10px] uppercase tracking-wide font-semibold mb-0.5 ${receiptRate >= 80 ? 'text-emerald-600' : receiptRate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>Taxa</p>
          <p className={`text-sm font-bold font-serif ${receiptRate >= 80 ? 'text-emerald-700' : receiptRate >= 50 ? 'text-amber-700' : 'text-red-600'}`}>{receiptRate}%</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        {data.map((entry) => {
          const expectedPct = (entry.expected / maxVal) * 100;
          const receivedPct = (entry.received / maxVal) * 100;
          const isPast = entry.received > 0;
          const isPending = entry.received === 0 && entry.expected > 0;

          return (
            <div key={entry.date} className="group">
              <div className="flex items-center gap-3">
                <p className="text-[11px] text-stone-500 font-medium w-14 flex-shrink-0 text-right">{entry.label}</p>
                <div className="flex-1 relative h-8 bg-stone-50 rounded-lg overflow-hidden border border-stone-100">
                  {/* Expected bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-stone-200/80 rounded-lg transition-all duration-700"
                    style={{ width: `${expectedPct}%` }}
                  />
                  {/* Received bar */}
                  {entry.received > 0 && (
                    <div
                      className="absolute top-0 left-0 h-full bg-teal-500 rounded-lg transition-all duration-700"
                      style={{ width: `${receivedPct}%` }}
                    />
                  )}
                  {/* Label */}
                  <div className="absolute inset-0 flex items-center px-3 justify-between">
                    {isPending && (
                      <span className="text-[10px] font-medium text-stone-500">{fmt(entry.expected)}</span>
                    )}
                    {isPast && (
                      <span className="text-[10px] font-bold text-white">{fmt(entry.received)}</span>
                    )}
                    {!isPending && !isPast && null}
                    {entry.expected > entry.received && entry.received > 0 && (
                      <span className="text-[10px] text-stone-400 ml-auto">{fmt(entry.expected - entry.received)} pendente</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-teal-500 flex-shrink-0"></span>
          <span className="text-[11px] text-stone-500">Realizado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-stone-200 flex-shrink-0"></span>
          <span className="text-[11px] text-stone-500">Esperado</span>
        </div>
      </div>
    </div>
  );
}