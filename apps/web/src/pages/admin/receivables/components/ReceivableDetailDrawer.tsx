import { useState } from 'react';
import type { MockReceivable } from '@/mocks/admin-receivables';
import { receivableStatusLabels, paymentMethodLabels, paymentMethodIcons } from '@/mocks/admin-receivables';

interface Props {
  receivable: MockReceivable;
  onClose: () => void;
  onConfirm?: () => void;
}

type Tab = 'financeiro' | 'reserva' | 'passageiro' | 'timeline' | 'observacoes';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'financeiro',   label: 'Financeiro',   icon: 'ri-money-dollar-circle-line' },
  { id: 'reserva',      label: 'Reserva',      icon: 'ri-calendar-check-line' },
  { id: 'passageiro',   label: 'Passageiro',   icon: 'ri-user-3-line' },
  { id: 'timeline',     label: 'Timeline',     icon: 'ri-history-line' },
  { id: 'observacoes',  label: 'Observações',  icon: 'ri-sticky-note-line' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  open:      { bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  received:  { bg: 'bg-teal-50',    text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
  overdue:   { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500 animate-pulse' },
  partial:   { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-stone-100',  text: 'text-stone-500',  border: 'border-stone-200',  dot: 'bg-stone-400' },
};

const TIMELINE_EVENTS = [
  { label: 'Recebível criado', date: 'same_as_created', type: 'created', icon: 'ri-add-circle-line', color: 'bg-teal-100 text-teal-600' },
  { label: 'Cobrança enviada ao passageiro', date: '+1d', type: 'sent', icon: 'ri-mail-send-line', color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Aguardando pagamento', date: 'due_date', type: 'waiting', icon: 'ri-time-line', color: 'bg-amber-100 text-amber-600' },
];

function FinanceiroTab({ rec }: { rec: MockReceivable }) {
  const s = STATUS_STYLES[rec.status];
  const progressPct = rec.amount > 0 ? Math.round((rec.amount_received / rec.amount) * 100) : 0;
  const pending = rec.amount - rec.amount_received;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {receivableStatusLabels[rec.status]}
          </span>
          <span className="text-[11px] text-stone-500 font-mono">{rec.booking_ref}</span>
        </div>
        <p className={`text-3xl font-bold font-serif ${s.text}`}>
          R$ {rec.amount.toLocaleString('pt-BR')}
        </p>
        {rec.status === 'partial' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-500">Recebido</span>
              <span className="font-semibold text-amber-700">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Valor total', value: `R$ ${rec.amount.toLocaleString('pt-BR')}`, icon: 'ri-price-tag-3-line', color: 'text-stone-800' },
          { label: 'Recebido', value: `R$ ${rec.amount_received.toLocaleString('pt-BR')}`, icon: 'ri-checkbox-circle-line', color: 'text-teal-600' },
          { label: 'Pendente', value: `R$ ${pending.toLocaleString('pt-BR')}`, icon: 'ri-time-line', color: pending > 0 ? 'text-amber-600' : 'text-stone-400' },
          { label: 'Vencimento', value: new Date(rec.due_date).toLocaleDateString('pt-BR'), icon: 'ri-calendar-event-line', color: rec.status === 'overdue' ? 'text-red-500' : 'text-stone-700' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${item.icon} text-sm ${item.color}`}></i>
              </div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">{item.label}</p>
            </div>
            <p className={`text-sm font-bold font-serif ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Method */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Método de pagamento</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 border border-stone-200">
            <i className={`${paymentMethodIcons[rec.method]} text-stone-600 text-base`}></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">{paymentMethodLabels[rec.method]}</p>
            {rec.installments && (
              <p className="text-xs text-stone-500">Parcela {rec.installment_current}/{rec.installments}</p>
            )}
          </div>
        </div>
      </div>

      {rec.status === 'overdue' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <i className="ri-alarm-warning-line text-red-500 text-sm animate-pulse"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700">Pagamento atrasado</p>
            <p className="text-xs text-red-600">{rec.overdue_days} dias em atraso — enviar novo aviso</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservaTab({ rec }: { rec: MockReceivable }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
      {[
        { label: 'Referência', value: rec.booking_ref, icon: 'ri-hashtag' },
        { label: 'Rota', value: rec.route_name, icon: 'ri-route-line' },
        { label: 'Origem', value: rec.origin, icon: 'ri-map-pin-line' },
        { label: 'Destino', value: rec.destination, icon: 'ri-map-pin-2-line' },
        { label: 'Categoria', value: rec.category, icon: 'ri-price-tag-3-line' },
        { label: 'Criado em', value: new Date(rec.created_at).toLocaleDateString('pt-BR'), icon: 'ri-calendar-line' },
      ].map((row) => (
        <div key={row.label} className="flex items-start gap-3 px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0 mt-0.5">
            <i className={`${row.icon} text-stone-400 text-sm`}></i>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">{row.label}</p>
            <p className="text-sm font-medium text-stone-800 break-words">{row.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PassageiroTab({ rec }: { rec: MockReceivable }) {
  const initials = rec.passenger_name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-navy-950/8 text-[#2d4a63] font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-stone-800">{rec.passenger_name}</p>
          <p className="text-xs text-stone-500">{rec.passenger_email}</p>
        </div>
      </div>
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
        <p className="text-xs text-stone-500">
          Passageiro vinculado à reserva <span className="font-semibold text-stone-700">{rec.booking_ref}</span>.
          Para ver o histórico completo, acesse o módulo Clientes.
        </p>
      </div>
    </div>
  );
}

function TimelineTab({ rec }: { rec: MockReceivable }) {
  const events = [
    { label: `Recebível registrado`, date: new Date(rec.created_at).toLocaleDateString('pt-BR'), icon: 'ri-add-circle-line', color: 'bg-teal-100 text-teal-600' },
    { label: 'Cobrança enviada ao passageiro', date: new Date(rec.created_at).toLocaleDateString('pt-BR'), icon: 'ri-mail-send-line', color: 'bg-indigo-100 text-indigo-600' },
    ...(rec.status === 'overdue' ? [{ label: `Vencimento em atraso — ${rec.overdue_days}d`, date: new Date(rec.due_date).toLocaleDateString('pt-BR'), icon: 'ri-alarm-warning-line', color: 'bg-red-100 text-red-600' }] : []),
    ...(rec.status === 'received' ? [{ label: 'Pagamento confirmado', date: new Date(rec.due_date).toLocaleDateString('pt-BR'), icon: 'ri-checkbox-circle-line', color: 'bg-teal-100 text-teal-600' }] : []),
    ...(rec.status === 'partial' ? [{ label: `Pagamento parcial recebido (${rec.installment_current}/${rec.installments})`, date: new Date(rec.due_date).toLocaleDateString('pt-BR'), icon: 'ri-pie-chart-2-line', color: 'bg-amber-100 text-amber-600' }] : []),
    ...(rec.status === 'cancelled' ? [{ label: 'Recebível cancelado', date: new Date(rec.due_date).toLocaleDateString('pt-BR'), icon: 'ri-close-circle-line', color: 'bg-stone-100 text-stone-500' }] : []),
  ];

  return (
    <div className="space-y-1">
      {events.map((ev, idx) => (
        <div key={idx} className="flex gap-3 pb-4">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${ev.color}`}>
              <i className={`${ev.icon} text-xs`}></i>
            </div>
            {idx < events.length - 1 && <div className="w-px flex-1 mt-1 bg-stone-200" />}
          </div>
          <div className="pt-1">
            <p className="text-sm text-stone-700">{ev.label}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{ev.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObservacoesTab({ rec }: { rec: MockReceivable }) {
  const [note, setNote] = useState('');
  return (
    <div className="space-y-4">
      {rec.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Nota registrada</p>
          <p className="text-sm text-amber-800 leading-relaxed">{rec.notes}</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Nova observação</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={4}
          placeholder="Registrar contato, acordo de pagamento, observações..."
          className="w-full px-3.5 py-3 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400">{note.length}/500</span>
          <button type="button" className="h-8 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReceivableDetailDrawer({ receivable: rec, onClose, onConfirm }: Props) {
  const [tab, setTab] = useState<Tab>('financeiro');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 900));
    setConfirming(false);
    onConfirm?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500/10 border border-teal-200 flex-shrink-0">
              <i className="ri-money-dollar-circle-line text-teal-600 text-base"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{rec.passenger_name}</p>
              <p className="text-[11px] text-stone-500">{rec.booking_ref} · R$ {rec.amount.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-stone-200 overflow-x-auto flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap
                ${tab === t.id ? 'text-teal-700 border-teal-500' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
              <i className={`${t.icon} text-xs`}></i>{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'financeiro'  && <FinanceiroTab rec={rec} />}
          {tab === 'reserva'     && <ReservaTab rec={rec} />}
          {tab === 'passageiro'  && <PassageiroTab rec={rec} />}
          {tab === 'timeline'    && <TimelineTab rec={rec} />}
          {tab === 'observacoes' && <ObservacoesTab rec={rec} />}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          {rec.status !== 'received' && rec.status !== 'cancelled' && (
            <button type="button" onClick={handleConfirm} disabled={confirming}
              className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1.5">
              <i className="ri-checkbox-circle-line text-sm"></i>
              {confirming ? 'Confirmando...' : 'Confirmar Recebimento'}
            </button>
          )}
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-mail-send-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-calendar-check-line text-sm"></i>
          </button>
          <button type="button" onClick={() => setTab('observacoes')} className="h-9 px-3 bg-navy-950 hover:bg-navy-900 text-white text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-sticky-note-line text-sm"></i>
          </button>
        </div>
      </aside>
    </>
  );
}