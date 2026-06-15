import type { ReceivableItem, ReceivableStatus, PaymentMethodName } from '@/services/receivables';
import { receivableStatusLabels, paymentMethodLabels, paymentMethodIcons } from '@/services/receivables';

interface Props {
  receivables: ReceivableItem[];
  onSelect: (r: ReceivableItem) => void;
  selectedId?: string;
  loading?: boolean;
}

const STATUS_STYLES: Record<ReceivableStatus, { bg: string; text: string; dot: string; border: string }> = {
  open:      { bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  received:  { bg: 'bg-teal-50',    text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200' },
  overdue:   { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500 animate-pulse', border: 'border-red-200' },
  partial:   { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200' },
  cancelled: { bg: 'bg-stone-100',  text: 'text-stone-500',  dot: 'bg-stone-400',  border: 'border-stone-200' },
};

const METHOD_COLORS: Record<PaymentMethodName, string> = {
  pix:           'text-teal-600 bg-teal-50',
  credit_card:   'text-indigo-600 bg-indigo-50',
  debit_card:    'text-sky-600 bg-sky-50',
  bank_transfer: 'text-navy-600 bg-navy-50',
  cash:          'text-emerald-600 bg-emerald-50',
  invoice:       'text-amber-600 bg-amber-50',
};

function SkeletonRow() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-stone-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/2" />
          <div className="h-3 bg-stone-100 rounded w-1/3" />
        </div>
        <div className="w-20 h-6 bg-stone-100 rounded-full" />
        <div className="w-16 h-8 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function ReceivablesList({ receivables, onSelect, selectedId, loading }: Props) {
  if (loading) {
    return <div className="space-y-3">{[1,2,3,4].map((i) => <SkeletonRow key={i} />)}</div>;
  }

  if (!receivables.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 mb-4">
          <i className="ri-money-dollar-circle-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-sm font-semibold text-stone-600 mb-1">Nenhum recebível encontrado</p>
        <p className="text-xs text-stone-400">Ajuste os filtros ou registre novos recebíveis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {receivables.map((rec) => {
        const s = STATUS_STYLES[rec.status];
        const isSelected = selectedId === rec.id;
        const isOverdue = rec.status === 'overdue';
        const progressPct = rec.amount > 0 ? Math.round((rec.amount_received / rec.amount) * 100) : 0;

        return (
          <button
            key={rec.id}
            type="button"
            onClick={() => onSelect(rec)}
            className={`w-full text-left bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer group
              ${isSelected ? 'border-teal-400 ring-2 ring-teal-300/30' : isOverdue ? 'border-red-200 hover:border-red-300' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/30'}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${s.bg} border ${s.border}`}>
                <i className={`${paymentMethodIcons[rec.method]} text-base ${s.text}`}></i>
              </div>

              {/* Main */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">
                    {rec.passenger_name}
                  </span>
                  {isOverdue && rec.overdue_days && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {rec.overdue_days}d atraso
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                  <span className="font-medium text-stone-600">{rec.booking_ref}</span>
                  <span className="text-stone-300">·</span>
                  <span>{rec.route_name}</span>
                  <span className="text-stone-300">·</span>
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${METHOD_COLORS[rec.method]}`}>
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${paymentMethodIcons[rec.method]} text-[10px]`}></i>
                    </div>
                    {paymentMethodLabels[rec.method]}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                {receivableStatusLabels[rec.status]}
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold font-serif ${rec.status === 'received' ? 'text-teal-700' : rec.status === 'overdue' ? 'text-red-600' : 'text-stone-800'}`}>
                  R$ {rec.amount.toLocaleString('pt-BR')}
                </p>
                {rec.status === 'partial' && (
                  <p className="text-[11px] text-stone-400">
                    R$ {rec.amount_received.toLocaleString('pt-BR')} recebido
                  </p>
                )}
              </div>
            </div>

            {/* Progress bar for partial */}
            {rec.status === 'partial' && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-stone-400">Progresso do pagamento</span>
                  <span className="text-[10px] font-semibold text-amber-700">{progressPct}% recebido</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            {/* Due date strip */}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <i className="ri-calendar-event-line text-stone-300"></i>
                Vencimento: <span className={`font-medium ml-0.5 ${isOverdue ? 'text-red-500' : 'text-stone-600'}`}>
                  {new Date(rec.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </span>
              {rec.forecast_date !== rec.due_date && (
                <span className="flex items-center gap-1">
                  <i className="ri-time-line text-stone-300"></i>
                  Previsão: <span className="font-medium text-stone-600 ml-0.5">
                    {new Date(rec.forecast_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </span>
              )}
              {rec.installments && (
                <span className="text-indigo-500 font-medium">
                  Parcela {rec.installment_current}/{rec.installments}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}