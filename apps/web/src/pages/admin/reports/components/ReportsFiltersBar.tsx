import { useState } from 'react';

export type ReportPeriod = 'today' | 'week' | 'month' | '3months' | 'year' | 'custom';

interface ReportsFiltersBarProps {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  onExport: (format: 'pdf' | 'excel' | 'share') => void;
}

const periods: { label: string; value: ReportPeriod }[] = [
  { label: 'Hoje',       value: 'today'   },
  { label: 'Semana',     value: 'week'    },
  { label: 'Mês',        value: 'month'   },
  { label: '3 meses',    value: '3months' },
  { label: 'Ano',        value: 'year'    },
];

export default function ReportsFiltersBar({ period, onPeriodChange, onExport }: ReportsFiltersBarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap justify-between">
        {/* Period pills */}
        <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-xl border border-stone-200">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                period === p.value
                  ? 'bg-navy-950 text-white'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom date */}
          <button
            type="button"
            onClick={() => onPeriodChange('custom')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              period === 'custom'
                ? 'border-teal-300 bg-teal-50 text-teal-700'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <i className="ri-calendar-2-line text-sm"></i>
            Personalizado
          </button>

          {/* Advanced filters */}
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              advancedOpen ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <i className="ri-equalizer-2-line text-sm"></i>
            Filtros
          </button>

          {/* Export */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              Exportar
              {exportOpen ? <i className="ri-arrow-up-s-line text-xs"></i> : <i className="ri-arrow-down-s-line text-xs"></i>}
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                {[
                  { label: 'Exportar PDF', icon: 'ri-file-pdf-line', format: 'pdf' as const },
                  { label: 'Exportar Excel', icon: 'ri-table-line', format: 'excel' as const },
                  { label: 'Compartilhar', icon: 'ri-share-line', format: 'share' as const },
                ].map((opt) => (
                  <button
                    key={opt.format}
                    type="button"
                    onClick={() => { onExport(opt.format); setExportOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className={`${opt.icon} text-stone-400 text-sm`}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {advancedOpen && (
        <div className="pt-2 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Rota', placeholder: 'Todas as rotas' },
            { label: 'Motorista', placeholder: 'Todos' },
            { label: 'Veículo', placeholder: 'Todos' },
            { label: 'Categoria', placeholder: 'Todas' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">{f.label}</label>
              <select className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer">
                <option>{f.placeholder}</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}