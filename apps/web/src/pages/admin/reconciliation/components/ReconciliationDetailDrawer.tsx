import { useState } from 'react';
import type { MockReconciliation } from '@/mocks/admin-receivables';
import { reconciliationStatusLabels, paymentMethodLabels, paymentMethodIcons } from '@/mocks/admin-receivables';

interface Props {
  item: MockReconciliation;
  onClose: () => void;
  onReconcile?: () => void;
}

type Tab = 'transacao' | 'reserva' | 'financeiro' | 'divergencias' | 'timeline';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'transacao',    label: 'Transação',    icon: 'ri-exchange-dollar-line' },
  { id: 'reserva',      label: 'Reserva',      icon: 'ri-calendar-check-line' },
  { id: 'financeiro',   label: 'Financeiro',   icon: 'ri-money-dollar-circle-line' },
  { id: 'divergencias', label: 'Divergências', icon: 'ri-error-warning-line' },
  { id: 'timeline',     label: 'Timeline',     icon: 'ri-history-line' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  reconciled: { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
  pending:    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  divergent:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500 animate-pulse' },
  reversed:   { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-400' },
  in_review:  { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    dot: 'bg-sky-500 animate-pulse' },
};

function TransacaoTab({ item }: { item: MockReconciliation }) {
  const s = STATUS_STYLES[item.status];
  return (
    <div className="space-y-5">
      <div className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {reconciliationStatusLabels[item.status]}
          </span>
          <span className="text-[11px] font-mono text-stone-500">{item.reference}</span>
        </div>
        <p className="text-2xl font-bold font-serif text-stone-800">
          R$ {item.amount_expected.toLocaleString('pt-BR')}
        </p>
        {item.amount_received !== item.amount_expected && (
          <p className={`text-sm font-semibold mt-1 ${item.difference < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {item.difference < 0
              ? `R$ ${Math.abs(item.difference).toLocaleString('pt-BR')} não recebido`
              : `R$ ${item.difference.toLocaleString('pt-BR')} a mais`}
          </p>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Referência', value: item.reference, icon: 'ri-hashtag' },
          { label: 'Reserva', value: item.booking_ref, icon: 'ri-calendar-check-line' },
          { label: 'Método', value: paymentMethodLabels[item.method], icon: paymentMethodIcons[item.method] },
          { label: 'Processadora', value: item.processor, icon: 'ri-bank-line' },
          { label: 'Ref. Gateway', value: item.gateway_ref, icon: 'ri-key-line' },
          { label: 'Processado em', value: new Date(item.processed_at).toLocaleString('pt-BR'), icon: 'ri-calendar-event-line' },
          { label: 'Liquidação prev.', value: new Date(item.settlement_date).toLocaleDateString('pt-BR'), icon: 'ri-time-line' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-28 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800 flex-1 truncate font-mono text-[12px]">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservaTab({ item }: { item: MockReconciliation }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Passageiro</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-950/8 text-[#2d4a63] font-bold text-sm flex-shrink-0">
            {item.passenger_name.split(' ').slice(0,2).map((w) => w[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">{item.passenger_name}</p>
            <p className="text-xs text-stone-500">{item.route_name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Ref. Reserva', value: item.booking_ref, icon: 'ri-hashtag' },
          { label: 'Rota', value: item.route_name, icon: 'ri-route-line' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-24 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceiroTab({ item }: { item: MockReconciliation }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Esperado', value: `R$ ${item.amount_expected.toLocaleString('pt-BR')}`, icon: 'ri-price-tag-3-line', color: 'text-stone-800' },
          { label: 'Recebido', value: `R$ ${item.amount_received.toLocaleString('pt-BR')}`, icon: 'ri-checkbox-circle-line', color: item.amount_received > 0 ? 'text-teal-600' : 'text-stone-400' },
          { label: 'Diferença', value: item.difference === 0 ? 'Sem diferença' : `R$ ${Math.abs(item.difference).toLocaleString('pt-BR')}`, icon: 'ri-scales-3-line', color: item.difference === 0 ? 'text-teal-600' : 'text-red-500' },
          { label: 'Liquidação', value: new Date(item.settlement_date).toLocaleDateString('pt-BR'), icon: 'ri-calendar-check-line', color: 'text-stone-700' },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-stone-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center"><i className={`${c.icon} text-sm ${c.color}`}></i></div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">{c.label}</p>
            </div>
            <p className={`text-sm font-bold font-serif ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DivergenciasTab({ item }: { item: MockReconciliation }) {
  if (!item.divergence_reason && item.status === 'reconciled') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-teal-50 mb-3">
          <i className="ri-checkbox-circle-line text-teal-500 text-2xl"></i>
        </div>
        <p className="text-sm font-semibold text-teal-700">Sem divergências</p>
        <p className="text-xs text-stone-400 mt-1">Transação conciliada com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {item.divergence_reason && (
        <div className={`rounded-xl border p-4 ${
          item.status === 'divergent' ? 'bg-amber-50 border-amber-200' :
          item.status === 'in_review' ? 'bg-sky-50 border-sky-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-error-warning-line text-base text-amber-500"></i>
            </div>
            <p className={`text-xs font-semibold ${
              item.status === 'divergent' ? 'text-amber-700' :
              item.status === 'in_review' ? 'text-sky-700' : 'text-red-600'
            }`}>Motivo da divergência</p>
          </div>
          <p className={`text-sm leading-relaxed ${
            item.status === 'divergent' ? 'text-amber-800' :
            item.status === 'in_review' ? 'text-sky-800' : 'text-red-700'
          }`}>{item.divergence_reason}</p>
        </div>
      )}

      {item.notes && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-500 mb-1">Notas operacionais</p>
          <p className="text-sm text-stone-700 leading-relaxed">{item.notes}</p>
        </div>
      )}

      {item.difference !== 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-stone-200 rounded-xl p-3">
            <p className="text-[10px] text-stone-400 uppercase mb-1">Esperado</p>
            <p className="text-sm font-bold text-stone-800">R$ {item.amount_expected.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-[10px] text-red-400 uppercase mb-1">Diferença</p>
            <p className="text-sm font-bold text-red-600">-R$ {Math.abs(item.difference).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ item }: { item: MockReconciliation }) {
  const events = [
    { label: 'Transação iniciada', date: new Date(item.processed_at).toLocaleString('pt-BR'), icon: 'ri-arrow-right-circle-line', color: 'bg-indigo-100 text-indigo-600' },
    ...(item.status === 'reconciled' ? [{ label: 'Conciliação automática', date: new Date(item.settlement_date).toLocaleDateString('pt-BR'), icon: 'ri-checkbox-circle-line', color: 'bg-teal-100 text-teal-600' }] : []),
    ...(item.status === 'divergent' || item.status === 'in_review' ? [{ label: 'Divergência detectada', date: new Date(item.processed_at).toLocaleDateString('pt-BR'), icon: 'ri-error-warning-line', color: 'bg-amber-100 text-amber-600' }] : []),
    ...(item.status === 'reversed' ? [{ label: 'Estorno processado', date: new Date(item.settlement_date).toLocaleDateString('pt-BR'), icon: 'ri-arrow-go-back-line', color: 'bg-red-100 text-red-600' }] : []),
    ...(item.notes ? [{ label: 'Nota operacional registrada', date: '—', icon: 'ri-sticky-note-line', color: 'bg-stone-100 text-stone-600' }] : []),
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

export default function ReconciliationDetailDrawer({ item, onClose, onReconcile }: Props) {
  const [tab, setTab] = useState<Tab>('transacao');
  const [reconciling, setReconciling] = useState(false);

  const handleReconcile = async () => {
    setReconciling(true);
    await new Promise((r) => setTimeout(r, 1000));
    setReconciling(false);
    onReconcile?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0">
              <i className={`${paymentMethodIcons[item.method]} text-stone-600 text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 font-mono truncate">{item.reference}</p>
              <p className="text-[11px] text-stone-500">{item.passenger_name} · {item.processor}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

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
          {tab === 'transacao'    && <TransacaoTab item={item} />}
          {tab === 'reserva'      && <ReservaTab item={item} />}
          {tab === 'financeiro'   && <FinanceiroTab item={item} />}
          {tab === 'divergencias' && <DivergenciasTab item={item} />}
          {tab === 'timeline'     && <TimelineTab item={item} />}
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          {item.status !== 'reconciled' && (
            <button type="button" onClick={handleReconcile} disabled={reconciling}
              className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1.5">
              <i className="ri-checkbox-circle-line text-sm"></i>
              {reconciling ? 'Conciliando...' : 'Conciliar'}
            </button>
          )}
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-check-double-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-money-dollar-circle-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-navy-950 hover:bg-navy-900 text-white text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-download-line text-sm"></i>
          </button>
        </div>
      </aside>
    </>
  );
}