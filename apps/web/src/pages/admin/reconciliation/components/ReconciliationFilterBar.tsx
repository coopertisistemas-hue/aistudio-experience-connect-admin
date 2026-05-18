import { useState } from 'react';
import type { ReconciliationStatus, PaymentMethod } from '@/mocks/admin-receivables';

export interface ReconciliationFilters {
  search: string;
  status: ReconciliationStatus | 'all';
  method: PaymentMethod | 'all';
}

interface Props {
  filters: ReconciliationFilters;
  onChange: (f: ReconciliationFilters) => void;
  total: number;
  filtered: number;
}

const STATUS_PILLS: { value: ReconciliationStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'Todos' },
  { value: 'reconciled', label: 'Conciliado' },
  { value: 'pending',    label: 'Pendente' },
  { value: 'divergent',  label: 'Divergente' },
  { value: 'in_review',  label: 'Em análise' },
  { value: 'reversed',   label: 'Estornado' },
];

export default function ReconciliationFilterBar({ filters, onChange, total, filtered }: Props) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [filters.method !== 'all'].filter(Boolean).length;
  const clear = () => onChange({ search: '', status: 'all', method: 'all' });

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <i className="ri-search-line text-stone-400 text-sm"></i>
          </div>
          <input type="text" placeholder="Buscar por referência, reserva, passageiro..."
            value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
        </div>
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className={`relative flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium border transition-all cursor-pointer whitespace-nowrap
            ${expanded ? 'bg-navy-950 text-white border-navy-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
          <i className="ri-filter-3-line text-sm"></i>
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold ${expanded ? 'bg-teal-400 text-navy-950' : 'bg-teal-500 text-white'}`}>{activeCount}</span>
          )}
        </button>
        {(activeCount > 0 || filters.search) && (
          <button type="button" onClick={clear} className="h-9 px-3 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-xl cursor-pointer whitespace-nowrap">
            Limpar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_PILLS.map((p) => (
          <button key={p.value} type="button" onClick={() => onChange({ ...filters, status: p.value })}
            className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap
              ${filters.status === p.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="w-48 space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Método</label>
            <select value={filters.method} onChange={(e) => onChange({ ...filters, method: e.target.value as PaymentMethod | 'all' })}
              className="w-full h-8 px-2.5 text-sm bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none cursor-pointer">
              <option value="all">Todos métodos</option>
              <option value="pix">PIX</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="bank_transfer">Transferência</option>
              <option value="invoice">Boleto / Fatura</option>
            </select>
          </div>
        </div>
      )}

      {(filters.search || activeCount > 0) && (
        <p className="text-[12px] text-stone-500">
          Exibindo <span className="font-semibold text-stone-700">{filtered}</span> de {total} transações
        </p>
      )}
    </div>
  );
}