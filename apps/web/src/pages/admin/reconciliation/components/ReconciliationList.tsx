import type { MockReconciliation, ReconciliationStatus } from '@/mocks/admin-receivables';
import { reconciliationStatusLabels, paymentMethodLabels, paymentMethodIcons } from '@/mocks/admin-receivables';

interface Props {
  items: MockReconciliation[];
  onSelect: (r: MockReconciliation) => void;
  selectedId?: string;
  loading?: boolean;
}

const STATUS_STYLES: Record<ReconciliationStatus, { bg: string; text: string; dot: string; border: string }> = {
  reconciled: { bg: 'bg-teal-50',    text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200' },
  pending:    { bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  divergent:  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500 animate-pulse', border: 'border-amber-200' },
  reversed:   { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200' },
  in_review:  { bg: 'bg-sky-50',     text: 'text-sky-700',    dot: 'bg-sky-500 animate-pulse', border: 'border-sky-200' },
};

function SkeletonRow() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 bg-stone-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2"><div className="h-4 bg-stone-200 rounded w-1/2" /><div className="h-3 bg-stone-100 rounded w-1/3" /></div>
        <div className="w-20 h-6 bg-stone-100 rounded-full" />
        <div className="w-16 h-8 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function ReconciliationList({ items, onSelect, selectedId, loading }: Props) {
  if (loading) return <div className="space-y-3">{[1,2,3].map((i) => <SkeletonRow key={i} />)}</div>;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-4">
          <i className="ri-file-list-3-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-sm font-semibold text-stone-600 mb-1">Nenhuma transação encontrada</p>
        <p className="text-xs text-stone-400">Ajuste os filtros para ver as transações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const s = STATUS_STYLES[item.status];
        const isSelected = selectedId === item.id;
        const hasDiff = item.difference !== 0;
        const diffLabel = hasDiff
          ? item.difference > 0
            ? `+R$ ${item.difference.toLocaleString('pt-BR')}`
            : `-R$ ${Math.abs(item.difference).toLocaleString('pt-BR')}`
          : null;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full text-left bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer group
              ${isSelected ? 'border-teal-400 ring-2 ring-teal-300/30' :
                item.status === 'divergent' ? 'border-amber-200 hover:border-amber-300' :
                item.status === 'in_review' ? 'border-sky-200 hover:border-sky-300' :
                'border-stone-200 hover:border-stone-300 hover:bg-stone-50/30'}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${s.bg} border ${s.border}`}>
                <i className={`${paymentMethodIcons[item.method]} text-base ${s.text}`}></i>
              </div>

              {/* Main */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800 group-hover:text-teal-700 transition-colors font-mono text-[13px]">
                    {item.reference}
                  </span>
                  <span className="text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                    {item.booking_ref}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                  <span>{item.passenger_name}</span>
                  <span className="text-stone-300">·</span>
                  <span>{item.route_name}</span>
                  <span className="text-stone-300">·</span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${paymentMethodIcons[item.method]} text-[10px] text-stone-400`}></i>
                    </div>
                    {paymentMethodLabels[item.method]}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-400">{item.processor}</span>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                {reconciliationStatusLabels[item.status]}
              </div>

              {/* Amounts */}
              <div className="text-right flex-shrink-0 space-y-0.5">
                <p className="text-sm font-bold font-serif text-stone-800">
                  R$ {item.amount_expected.toLocaleString('pt-BR')}
                </p>
                {item.amount_received > 0 && item.amount_received !== item.amount_expected && (
                  <p className="text-[11px] text-teal-600">
                    R$ {item.amount_received.toLocaleString('pt-BR')} recebido
                  </p>
                )}
                {hasDiff && diffLabel && (
                  <p className={`text-[11px] font-semibold ${item.difference < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {diffLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Divergence reason */}
            {item.divergence_reason && (
              <div className={`mt-3 flex items-start gap-2 px-3 py-2 rounded-lg ${
                item.status === 'divergent' ? 'bg-amber-50 border border-amber-200' :
                item.status === 'in_review' ? 'bg-sky-50 border border-sky-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="w-3 h-3 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <i className="ri-information-line text-xs text-stone-500"></i>
                </div>
                <p className={`text-[11px] leading-relaxed ${
                  item.status === 'divergent' ? 'text-amber-700' :
                  item.status === 'in_review' ? 'text-sky-700' : 'text-red-600'
                }`}>
                  {item.divergence_reason}
                </p>
              </div>
            )}

            {/* Bottom strip */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <i className="ri-calendar-event-line text-stone-300"></i>
                Processado: <span className="font-medium text-stone-600 ml-0.5">
                  {new Date(item.processed_at).toLocaleDateString('pt-BR')}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-bank-line text-stone-300"></i>
                {item.gateway_ref}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}