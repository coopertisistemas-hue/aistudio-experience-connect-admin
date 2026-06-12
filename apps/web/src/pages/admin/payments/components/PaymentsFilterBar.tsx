import { useState } from 'react';

interface PaymentsFilterBarProps {
  total: number;
  filtered: number;
  search: string;
  onSearch: (v: string) => void;
  activeStatus: string;
  onStatusChange: (v: string) => void;
  activeFiltersCount: number;
  onMethodChange: (v: string) => void;
  onPeriodChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onClear: () => void;
}

const statusPills: { label: string; value: string }[] = [
  { label: 'Todos',        value: 'all' },
  { label: 'Pago',         value: 'paid' },
  { label: 'Pendente',     value: 'pending' },
  { label: 'Atrasado',     value: 'overdue' },
  { label: 'Parcial',      value: 'partial' },
  { label: 'Reembolsado',  value: 'refunded' },
  { label: 'Cancelado',    value: 'cancelled' },
];

const methods: { label: string; value: string }[] = [
  { label: 'Todos os métodos', value: '' },
  { label: 'PIX', value: 'pix' },
  { label: 'Cartão de Crédito', value: 'credit_card' },
  { label: 'Cartão de Débito', value: 'debit_card' },
  { label: 'Transferência', value: 'bank_transfer' },
  { label: 'Dinheiro', value: 'cash' },
  { label: 'Link de Pagamento', value: 'payment_link' },
];

export default function PaymentsFilterBar({
  total, filtered, search, onSearch,
  activeStatus, onStatusChange,
  activeFiltersCount, onMethodChange, onPeriodChange, onCategoryChange, onClear,
}: PaymentsFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 space-y-3">
      {/* Row 1 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por reserva, passageiro ou rota..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer whitespace-nowrap ${
            expanded || activeFiltersCount > 0
              ? 'border-teal-300 bg-teal-50 text-teal-700'
              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <i className="ri-equalizer-2-line text-sm"></i>
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-500 text-white text-[9px] font-bold">
              {activeFiltersCount}
            </span>
          )}
          {expanded ? <i className="ri-arrow-up-s-line text-xs"></i> : <i className="ri-arrow-down-s-line text-xs"></i>}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line text-sm"></i>
            Limpar
          </button>
        )}

        <span className="text-stone-400 text-xs ml-auto whitespace-nowrap">
          Exibindo <span className="font-semibold text-stone-600">{filtered}</span> de{' '}
          <span className="font-semibold text-stone-600">{total}</span>
        </span>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {statusPills.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => onStatusChange(pill.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeStatus === pill.value
                ? 'bg-navy-950 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Advanced */}
      {expanded && (
        <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Método</label>
            <select
              onChange={(e) => onMethodChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              {methods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Período</label>
            <select
              onChange={(e) => onPeriodChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              <option value="">Todos os períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Categoria</label>
            <select
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
            >
              <option value="">Transfer e Experiências</option>
              <option value="transfer">Apenas Transfers</option>
              <option value="experience">Apenas Experiências</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}