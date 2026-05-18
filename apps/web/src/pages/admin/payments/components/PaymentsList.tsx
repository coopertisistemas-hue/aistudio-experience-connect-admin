import type { MockPayment, PaymentStatus, PaymentMethod } from '@/mocks/admin-payments';

interface PaymentsListProps {
  payments: MockPayment[];
  selectedId: string | null;
  onSelect: (p: MockPayment) => void;
}

const statusConfig: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paid:      { label: 'Pago',        bg: 'bg-teal-50',          text: 'text-teal-700',  dot: 'bg-teal-500' },
  pending:   { label: 'Pendente',    bg: 'bg-amber-50',         text: 'text-amber-700', dot: 'bg-amber-400 animate-pulse' },
  overdue:   { label: 'Atrasado',    bg: 'bg-red-50',           text: 'text-red-600',   dot: 'bg-red-500' },
  partial:   { label: 'Parcial',     bg: 'bg-amber-50',         text: 'text-amber-700', dot: 'bg-amber-400' },
  refunded:  { label: 'Reembolsado', bg: 'bg-stone-100',        text: 'text-stone-500', dot: 'bg-stone-400' },
  cancelled: { label: 'Cancelado',   bg: 'bg-stone-100',        text: 'text-stone-400', dot: 'bg-stone-300' },
};

const methodConfig: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  pix:           { label: 'PIX',         icon: 'ri-flashlight-line',     color: 'text-teal-600' },
  credit_card:   { label: 'Crédito',     icon: 'ri-bank-card-line',      color: 'text-[#1e3a5f]' },
  debit_card:    { label: 'Débito',      icon: 'ri-bank-card-2-line',    color: 'text-[#1e3a5f]' },
  bank_transfer: { label: 'Transferência', icon: 'ri-exchange-dollar-line', color: 'text-stone-600' },
  cash:          { label: 'Dinheiro',    icon: 'ri-money-dollar-circle-line', color: 'text-stone-600' },
  payment_link:  { label: 'Link',        icon: 'ri-links-line',          color: 'text-amber-600' },
};

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function PaymentsList({ payments, selectedId, onSelect }: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-stone-100">
          <i className="ri-secure-payment-line text-2xl text-stone-400"></i>
        </div>
        <p className="text-stone-500 font-medium text-sm">Nenhum pagamento encontrado</p>
        <p className="text-stone-400 text-xs">Ajuste os filtros ou registre um novo pagamento</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((p) => {
        const sc = statusConfig[p.status];
        const mc = p.method ? methodConfig[p.method] : null;
        const isSelected = selectedId === p.id;
        const isOverdue = p.status === 'overdue';
        const isPending = p.status === 'pending';
        const isPartial = p.status === 'partial';
        const initials = p.passenger_name.split(' ').map((n) => n[0]).slice(0, 2).join('');

        return (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={`bg-white rounded-xl border transition-all duration-150 cursor-pointer group ${
              isSelected ? 'border-teal-400 ring-1 ring-teal-300/50' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {isOverdue && <div className="h-0.5 rounded-t-xl bg-red-400 w-full" />}
            {isPending && <div className="h-0.5 rounded-t-xl bg-amber-400 w-full" />}

            <div className="px-4 py-3.5">
              {/* Top row */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${
                  p.status === 'paid' ? 'bg-teal-500' :
                  p.status === 'overdue' ? 'bg-red-100' :
                  'bg-stone-200'
                }`}>
                  <span className={`text-xs font-bold ${
                    p.status === 'paid' ? 'text-white' :
                    p.status === 'overdue' ? 'text-red-600' :
                    'text-stone-600'
                  }`}>{initials}</span>
                </div>

                {/* Main */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[13px] text-stone-800">{p.passenger_name}</span>
                    <span className="text-stone-300 text-xs">·</span>
                    <span className="text-stone-500 text-xs">{p.booking_reference}</span>
                    <span className="text-stone-300 text-xs">·</span>
                    <span className="text-stone-400 text-xs">{p.reference}</span>
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5 truncate">{p.route_name}</p>
                </div>

                {/* Amount + status */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className={`font-serif text-lg font-semibold leading-none ${
                    p.status === 'paid' ? 'text-teal-700' :
                    p.status === 'overdue' ? 'text-red-600' :
                    p.status === 'refunded' ? 'text-stone-400 line-through' :
                    'text-stone-800'
                  }`}>
                    {fmt(p.total_amount)}
                  </p>
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`}></span>
                    {sc.label}
                  </span>
                </div>
              </div>

              {/* Detail row */}
              <div className="mt-2.5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5">
                {/* Method */}
                <div className="flex items-center gap-1.5">
                  {mc ? (
                    <>
                      <i className={`${mc.icon} text-xs ${mc.color}`}></i>
                      <span className={`text-xs font-medium ${mc.color}`}>{mc.label}</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-question-mark text-stone-300 text-xs"></i>
                      <span className="text-xs text-stone-400">Não definido</span>
                    </>
                  )}
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1.5">
                  <i className={`ri-calendar-line text-xs ${isOverdue ? 'text-red-400' : 'text-stone-400'}`}></i>
                  <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-stone-600'}`}>
                    Vence {formatDate(p.due_at)}
                    {isOverdue && ' · VENCIDO'}
                  </span>
                </div>

                {/* Paid at */}
                <div className="flex items-center gap-1.5">
                  <i className="ri-check-line text-stone-400 text-xs"></i>
                  <span className="text-stone-600 text-xs">
                    {p.paid_at ? `Pago ${formatDate(p.paid_at)}` : '—'}
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5">
                  <i className={`${p.category === 'experience' ? 'ri-compass-discover-line' : 'ri-car-line'} text-stone-400 text-xs`}></i>
                  <span className="text-stone-500 text-xs capitalize">{p.category === 'experience' ? 'Experiência' : 'Transfer'}</span>
                </div>
              </div>

              {/* Partial progress */}
              {isPartial && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-stone-500">Pago: <span className="font-semibold text-teal-600">{fmt(p.paid_amount)}</span></span>
                    <span className="text-amber-600 font-semibold">Saldo: {fmt(p.pending_amount)}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-400 transition-all duration-700"
                      style={{ width: `${(p.paid_amount / p.total_amount) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Overdue alert */}
              {isOverdue && (
                <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                  <i className="ri-alarm-warning-line text-red-500 text-xs"></i>
                  <span className="text-xs text-red-700 font-medium">Pagamento vencido — ação necessária</span>
                  {p.payment_link && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); }}
                      className="ml-auto text-[10px] text-red-600 font-semibold hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Reenviar link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}