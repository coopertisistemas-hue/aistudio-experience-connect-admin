import { useState } from 'react';
import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import type { PaymentWithDetails } from '@/services/payments';

interface PaymentDetailDrawerProps {
  payment: PaymentWithDetails;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type TabId = 'pagamento' | 'reserva' | 'passageiro' | 'operacao' | 'timeline' | 'financeiro';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'pagamento',  label: 'Pagamento',  icon: 'ri-secure-payment-line' },
  { id: 'reserva',    label: 'Reserva',    icon: 'ri-calendar-check-line' },
  { id: 'passageiro', label: 'Passageiro', icon: 'ri-user-line' },
  { id: 'operacao',   label: 'Operação',   icon: 'ri-car-line' },
  { id: 'timeline',   label: 'Timeline',   icon: 'ri-git-commit-line' },
  { id: 'financeiro', label: 'Financeiro', icon: 'ri-money-dollar-circle-line' },
];

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  paid:      { label: 'Pago',        bg: 'bg-teal-50',   text: 'text-teal-700',  dot: 'bg-teal-500' },
  completed: { label: 'Pago',        bg: 'bg-teal-50',   text: 'text-teal-700',  dot: 'bg-teal-500' },
  pending:   { label: 'Pendente',    bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400 animate-pulse' },
  overdue:   { label: 'Atrasado',    bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-500' },
  partial:   { label: 'Parcial',     bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400' },
  refunded:  { label: 'Reembolsado', bg: 'bg-stone-100', text: 'text-stone-500', dot: 'bg-stone-400' },
  cancelled: { label: 'Cancelado',   bg: 'bg-stone-100', text: 'text-stone-400', dot: 'bg-stone-300' },
  failed:    { label: 'Falhou',      bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-500' },
};

const methodIconMap: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  pix:           { icon: 'ri-flashlight-line',          label: 'PIX',                 color: 'text-teal-600',   bg: 'bg-teal-50' },
  credit_card:   { icon: 'ri-bank-card-line',           label: 'Cartão de Crédito',   color: 'text-[#1e3a5f]',  bg: 'bg-navy-950/[0.05]' },
  debit_card:    { icon: 'ri-bank-card-2-line',         label: 'Cartão de Débito',    color: 'text-[#1e3a5f]',  bg: 'bg-navy-950/[0.05]' },
  bank_transfer: { icon: 'ri-exchange-dollar-line',     label: 'Transferência',       color: 'text-stone-600',  bg: 'bg-stone-100' },
  cash:          { icon: 'ri-money-dollar-circle-line', label: 'Dinheiro',            color: 'text-stone-600',  bg: 'bg-stone-100' },
  payment_link:  { icon: 'ri-links-line',              label: 'Link de Pagamento',   color: 'text-amber-600',  bg: 'bg-amber-50' },
};

const allMethods = ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'payment_link'];

function InfoRow({ label, value, accent }: { label: string; value: string | null | undefined; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 text-xs flex-shrink-0">{label}</span>
      <span className={`text-xs font-medium text-right ${accent ?? 'text-stone-700'}`}>{value ?? '—'}</span>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(dt: string | null | undefined) {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDateTime(dt: string | null | undefined) {
  if (!dt) return null;
  return new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function PaymentDetailDrawer({ payment: p, onClose, onToast }: PaymentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('pagamento');
  const { status: liveStatus } = usePaymentPolling({
    paymentId: p.status === 'pending' ? p.id : null,
    tenantId: p.tenant_id,
    intervalMs: 5000,
  });
  const displayStatus = liveStatus ?? p.status;
  const sc = statusConfig[displayStatus] ?? statusConfig.pending;

  const timelineColors: Record<string, string> = {
    teal: 'bg-teal-500', navy: 'bg-[#1e3a5f]', amber: 'bg-amber-400', red: 'bg-red-400', stone: 'bg-stone-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-navy-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-full flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-lg font-semibold text-stone-900">{p.passenger_name}</h2>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                  {sc.label}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">{p.reference} · {p.booking_reference} · {p.route_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-serif text-xl font-semibold text-stone-900">{fmt(p.total_amount)}</p>
              {p.installments && p.installments > 1 && (
                <p className="text-stone-400 text-[10px]">{p.installments}x parcelas</p>
              )}
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 transition-colors cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-navy-950 text-white' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                <i className={`${tab.icon} text-xs`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* PAGAMENTO */}
          {activeTab === 'pagamento' && (
            <div className="space-y-4">
              {/* Method card */}
              {p.method ? (() => {
                const mc = methodIconMap[p.method];
                return (
                  <div className={`rounded-xl p-4 border border-stone-200 flex items-center gap-4 ${mc.bg}`}>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-stone-200 flex-shrink-0`}>
                      <i className={`${mc.icon} text-2xl ${mc.color}`}></i>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{mc.label}</p>
                      <p className="text-stone-500 text-xs mt-0.5">
                        {p.paid_at ? `Confirmado em ${fmtDateTime(p.paid_at)}` : 'Aguardando confirmação'}
                      </p>
                      {p.installments && p.installments > 1 && (
                        <span className="text-[10px] bg-white text-[#1e3a5f] px-2 py-0.5 rounded-full border border-stone-200 font-medium mt-1 inline-block">
                          {p.installments}x parcelas
                        </span>
                      )}
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-serif text-2xl font-semibold text-stone-900">{fmt(p.total_amount)}</p>
                      <p className={`text-xs font-semibold ${sc.text}`}>{sc.label}</p>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm font-semibold text-amber-800">Método não definido</p>
                  <p className="text-xs text-amber-700 mt-0.5">Aguardando seleção do método de pagamento pelo cliente.</p>
                  {p.payment_link && (
                    <button type="button" onClick={() => onToast('Link de pagamento copiado.')} className="mt-2 text-xs text-amber-700 font-semibold underline cursor-pointer">
                      Copiar link de pagamento
                    </button>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <InfoRow label="Referência" value={p.reference} />
                <InfoRow label="Reserva" value={p.booking_reference} />
                <InfoRow label="Criado em" value={fmtDateTime(p.created_at)} />
                <InfoRow label="Vencimento" value={fmtDate(p.due_at)} accent={p.status === 'overdue' ? 'text-red-600 font-semibold' : undefined} />
                <InfoRow label="Pago em" value={fmtDateTime(p.paid_at)} accent="text-teal-600" />
                {p.refunded_at && <InfoRow label="Estornado em" value={fmtDateTime(p.refunded_at)} />}
              </div>

              {/* Partial progress */}
              {p.status === 'partial' && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
                  <p className="text-xs font-semibold text-amber-800">Pagamento Parcial</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Pago: <span className="font-semibold text-teal-600">{fmt(p.paid_amount)}</span></span>
                    <span className="text-amber-700 font-semibold">Saldo: {fmt(p.pending_amount)}</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-amber-200">
                    <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${(p.paid_amount / p.total_amount) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-amber-700">{Math.round((p.paid_amount / p.total_amount) * 100)}% pago</p>
                </div>
              )}

              {p.notes && (
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{p.notes}</p>
                </div>
              )}

              {/* All payment methods */}
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Métodos Aceitos</p>
                <div className="grid grid-cols-3 gap-2">
                  {allMethods.map((m) => {
                    const mc = methodIconMap[m];
                    const isActive = p.method === m;
                    return (
                      <div key={m} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center ${
                        isActive ? 'border-teal-400 bg-teal-50' : 'border-stone-200 bg-stone-50 opacity-50'
                      }`}>
                        <i className={`${mc.icon} text-lg ${isActive ? mc.color : 'text-stone-400'}`}></i>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-stone-700' : 'text-stone-400'}`}>{mc.label}</span>
                        {isActive && <span className="text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-semibold">Usado</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RESERVA */}
          {activeTab === 'reserva' && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <InfoRow label="Referência da reserva" value={p.booking_reference} />
                <InfoRow label="Categoria" value={p.category === 'experience' ? 'Experiência' : 'Transfer'} />
                <InfoRow label="Data do serviço" value={fmtDate(p.scheduled_at)} />
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-teal-200"></span>
                    <div className="w-px h-8 border-l-2 border-dashed border-stone-300"></div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a5f] border-2 border-[#1e3a5f]/30"></span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">Origem</p>
                      <p className="text-sm text-stone-700 font-medium">{p.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#1e3a5f] font-semibold uppercase tracking-wider">Destino</p>
                      <p className="text-sm text-stone-700 font-medium">{p.dropoff_location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSAGEIRO */}
          {activeTab === 'passageiro' && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e3a5f] flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {p.passenger_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{p.passenger_name}</p>
                    <p className="text-stone-500 text-xs">Passageiro principal</p>
                  </div>
                </div>
                <InfoRow label="E-mail" value={p.passenger_email} />
                <InfoRow label="Telefone" value={p.passenger_phone} />
              </div>
            </div>
          )}

          {/* OPERAÇÃO */}
          {activeTab === 'operacao' && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <InfoRow label="Rota" value={p.route_name} />
                <InfoRow label="Data do serviço" value={fmtDate(p.scheduled_at)} />
                <InfoRow label="Categoria" value={p.category === 'experience' ? 'Experiência' : 'Transfer'} />
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-1">
              {p.timeline.map((ev, idx) => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full ${timelineColors[ev.color]}`}>
                      <i className={`${ev.icon} text-white text-[10px]`}></i>
                    </div>
                    {idx < p.timeline.length - 1 && <div className="w-px h-6 bg-stone-200 mt-1"></div>}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-800">{ev.label}</p>
                      {ev.amount && (
                        <span className="text-xs font-semibold text-teal-600 flex-shrink-0">{fmt(ev.amount)}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{ev.description}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{fmtDateTime(ev.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="bg-navy-950 rounded-xl p-5 text-white">
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Valor total</p>
                <p className="font-serif text-3xl font-semibold">{fmt(p.total_amount)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                    {sc.label}
                  </span>
                  {p.method && <span className="text-stone-400 text-xs">{methodIconMap[p.method]?.label || p.method}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total cobrado', value: fmt(p.total_amount), color: 'text-stone-700' },
                  { label: 'Valor pago', value: fmt(p.paid_amount), color: 'text-teal-600' },
                  { label: 'Saldo pendente', value: fmt(p.pending_amount), color: p.pending_amount > 0 ? 'text-amber-600' : 'text-stone-400' },
                  { label: 'Estornado', value: p.status === 'refunded' ? fmt(p.total_amount) : 'R$ 0,00', color: 'text-stone-500' },
                ].map((s) => (
                  <div key={s.label} className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
                    <p className={`text-lg font-serif font-semibold ${s.color}`}>{s.value}</p>
                    <p className="text-stone-400 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-200 bg-stone-50/50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToast('Pagamento confirmado com sucesso.')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line"></i>
              Confirmar Pagamento
            </button>
            <button
              type="button"
              onClick={() => onToast('Reembolso registrado. Prazo 2-5 dias úteis.')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refund-2-line"></i>
              Registrar Reembolso
            </button>
            <button
              type="button"
              onClick={() => onToast('Redirecionando para a reserva...')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-check-line"></i>
              Ver Reserva
            </button>
            <button
              type="button"
              onClick={() => onToast('Comprovante copiado para compartilhamento.')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-share-line"></i>
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}