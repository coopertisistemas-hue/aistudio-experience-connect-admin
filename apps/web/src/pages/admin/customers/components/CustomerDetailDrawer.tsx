import { useState } from 'react';
import type { CustomerDisplay } from '@/services/customers';
import type { CustomerPreference } from '@/mocks/admin-customers';
import { preferenceLabels, preferenceIcons } from '@/mocks/admin-customers';

interface CustomerDetailDrawerProps {
  customer: CustomerDisplay | null;
  onClose: () => void;
  onNewBooking: () => void;
}

type Tab = 'perfil' | 'reservas' | 'pagamentos' | 'preferencias' | 'jornada' | 'observacoes';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'perfil', label: 'Perfil', icon: 'ri-user-3-line' },
  { key: 'reservas', label: 'Reservas', icon: 'ri-calendar-check-line' },
  { key: 'pagamentos', label: 'Pagamentos', icon: 'ri-secure-payment-line' },
  { key: 'preferencias', label: 'Preferências', icon: 'ri-heart-3-line' },
  { key: 'jornada', label: 'Jornada', icon: 'ri-route-line' },
  { key: 'observacoes', label: 'Observações', icon: 'ri-sticky-note-line' },
];

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string; icon: string }> = {
  vip: { label: 'VIP', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: 'ri-vip-crown-line' },
  active: { label: 'Ativo', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500', icon: 'ri-checkbox-circle-line' },
  inactive: { label: 'Inativo', bg: 'bg-stone-100', text: 'text-stone-500', border: 'border-stone-200', dot: 'bg-stone-400', icon: 'ri-pause-circle-line' },
};

const bookingStatusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  confirmed: { label: 'Confirmado', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  completed: { label: 'Concluído', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  pending: { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const payStatusConfig: Record<string, { label: string; text: string }> = {
  paid: { label: 'Pago', text: 'text-teal-700' },
  pending: { label: 'Pendente', text: 'text-amber-600' },
  overdue: { label: 'Vencido', text: 'text-red-600' },
  refunded: { label: 'Estornado', text: 'text-stone-500' },
};

const prefColors: Record<string, string> = {
  aeroporto: 'bg-sky-50 text-sky-700 border-sky-200',
  hotel: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  executivo: 'bg-slate-100 text-slate-700 border-slate-200',
  turismo: 'bg-teal-50 text-teal-700 border-teal-200',
  familia: 'bg-rose-50 text-rose-700 border-rose-200',
  acessibilidade: 'bg-purple-50 text-purple-700 border-purple-200',
  ingles: 'bg-green-50 text-green-700 border-green-200',
  espanhol: 'bg-orange-50 text-orange-700 border-orange-200',
  bagagem_extra: 'bg-stone-50 text-stone-600 border-stone-200',
};

const journeyColors: Record<string, { dot: string; line: string; text: string; icon: string }> = {
  teal: { dot: 'bg-teal-500', line: 'bg-teal-200', text: 'text-teal-700', icon: 'text-teal-500' },
  navy: { dot: 'bg-slate-600', line: 'bg-slate-200', text: 'text-slate-700', icon: 'text-slate-500' },
  amber: { dot: 'bg-amber-400', line: 'bg-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
  red: { dot: 'bg-red-500', line: 'bg-red-200', text: 'text-red-700', icon: 'text-red-500' },
  stone: { dot: 'bg-stone-400', line: 'bg-stone-200', text: 'text-stone-600', icon: 'text-stone-400' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function initials(name: string) {
  const p = name.trim().split(' ');
  return p.length >= 2 ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

const avatarColors = [
  'bg-teal-600', 'bg-slate-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600', 'bg-emerald-600',
];
function avatarColor(id: string) {
  const n = id.charCodeAt(id.length - 1);
  return avatarColors[n % avatarColors.length];
}

export default function CustomerDetailDrawer({ customer, onClose, onNewBooking }: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');

  if (!customer) return null;

  const st = statusConfig[customer.status] || statusConfig.active;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-stone-950/40" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-stone-200 px-5 pt-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-base font-bold text-white ${avatarColor(customer.id)}`}>
                {initials(customer.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-900">{customer.name}</h2>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{customer.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Reservas', value: customer.total_bookings, icon: 'ri-calendar-check-line', color: 'text-teal-600' },
              { label: 'Valor Total', value: customer.total_spent > 0 ? `R$ ${customer.total_spent.toLocaleString('pt-BR')}` : '—', icon: 'ri-money-dollar-circle-line', color: 'text-slate-600' },
              { label: 'Ticket Médio', value: `R$ ${customer.ticket_medio.toLocaleString('pt-BR')}`, icon: 'ri-price-tag-3-line', color: 'text-stone-600' },
            ].map((s) => (
              <div key={s.label} className="bg-stone-50 rounded-lg px-3 py-2.5 text-center">
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer
                  ${activeTab === t.key
                    ? 'text-teal-700 border-teal-500'
                    : 'text-stone-500 border-transparent hover:text-stone-700'
                  }`}
              >
                <i className={`${t.icon} text-sm`}></i>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              {/* Contact card */}
              <div className="bg-stone-50 rounded-xl border border-stone-200 divide-y divide-stone-100">
                {[
                  { icon: 'ri-mail-line', label: 'E-mail', value: customer.email },
                  { icon: 'ri-phone-line', label: 'Telefone', value: customer.phone },
                  { icon: 'ri-id-card-line', label: 'Documento', value: customer.document ?? '—' },
                  { icon: 'ri-earth-line', label: 'Nacionalidade', value: customer.nationality },
                  { icon: 'ri-translate-2', label: 'Idioma', value: customer.language },
                  { icon: 'ri-calendar-2-line', label: 'Cliente desde', value: fmtDate(customer.created_at) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-stone-200">
                      <i className={`${row.icon} text-stone-400 text-xs`}></i>
                    </div>
                    <span className="text-xs text-stone-500 w-24 flex-shrink-0">{row.label}</span>
                    <span className="text-xs font-medium text-stone-700 flex-1 text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Value card */}
              <div className="bg-[#0f2133] rounded-xl p-4 text-white">
                <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">Valor do Cliente</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xl font-bold">R$ {customer.total_spent.toLocaleString('pt-BR')}</p>
                    <p className="text-[11px] text-white/60 mt-0.5">Receita gerada</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">R$ {customer.ticket_medio.toLocaleString('pt-BR')}</p>
                    <p className="text-[11px] text-white/60 mt-0.5">Ticket médio</p>
                  </div>
                  <div>
                    <p className="text-base font-bold">{customer.completed_bookings}</p>
                    <p className="text-[11px] text-white/60 mt-0.5">Concluídas</p>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${customer.pending_amount > 0 ? 'text-amber-300' : 'text-white'}`}>
                      {customer.pending_amount > 0 ? `R$ ${customer.pending_amount.toLocaleString('pt-BR')}` : 'R$ 0'}
                    </p>
                    <p className="text-[11px] text-white/60 mt-0.5">Pendente</p>
                  </div>
                </div>
                {customer.is_recurring && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                    <i className="ri-repeat-line text-teal-400 text-xs"></i>
                    <span className="text-[11px] text-white/70">Cliente recorrente — {customer.recurrence_count} reservas</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESERVAS */}
          {activeTab === 'reservas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Histórico de Reservas</p>
                <span className="text-xs text-stone-400">{customer.total_bookings} no total</span>
              </div>

              {customer.recent_bookings.map((bk) => {
                const bst = bookingStatusConfig[bk.status] || bookingStatusConfig.pending;
                const pst = payStatusConfig[bk.payment_status] || payStatusConfig.pending;
                return (
                  <div key={bk.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-700">{bk.route_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bst.bg} ${bst.text} ${bst.border}`}>
                            {bst.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">{bk.reference} · {new Date(bk.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-stone-500">
                          <i className="ri-map-pin-line"></i>
                          <span className="truncate">{bk.pickup_location}</span>
                          <i className="ri-arrow-right-line text-stone-300"></i>
                          <span className="truncate">{bk.dropoff_location}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-stone-700">R$ {bk.amount.toLocaleString('pt-BR')}</p>
                        <p className={`text-[10px] font-semibold ${pst.text} mt-0.5`}>{pst.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {customer.total_bookings > customer.recent_bookings.length && (
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl py-4 text-center">
                  <p className="text-xs text-stone-400">+{customer.total_bookings - customer.recent_bookings.length} reservas anteriores</p>
                </div>
              )}
            </div>
          )}

          {/* PAGAMENTOS */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Situação Financeira</p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total gasto', value: `R$ ${customer.total_spent.toLocaleString('pt-BR')}`, color: 'text-teal-700', sub: 'pago' },
                  { label: 'Pendente', value: customer.pending_amount > 0 ? `R$ ${customer.pending_amount.toLocaleString('pt-BR')}` : '—', color: customer.pending_amount > 0 ? 'text-amber-700' : 'text-stone-400', sub: customer.pending_amount > 0 ? 'em aberto' : 'sem pendências' },
                  { label: 'Reservas pagas', value: `${customer.completed_bookings}/${customer.total_bookings}`, color: 'text-slate-700', sub: 'concluídas' },
                  { label: 'Ticket médio', value: `R$ ${customer.ticket_medio.toLocaleString('pt-BR')}`, color: 'text-stone-700', sub: 'por reserva' },
                ].map((s) => (
                  <div key={s.label} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                    <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-stone-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Payment history from bookings */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Por Reserva</p>
                {customer.recent_bookings.map((bk) => {
                  const pst = payStatusConfig[bk.payment_status] || payStatusConfig.pending;
                  return (
                    <div key={bk.id} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100">
                        <i className="ri-receipt-line text-stone-400 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-700 truncate">{bk.route_name}</p>
                        <p className="text-[10px] text-stone-400">{bk.reference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-700">R$ {bk.amount.toLocaleString('pt-BR')}</p>
                        <p className={`text-[10px] font-semibold ${pst.text}`}>{pst.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {customer.pending_amount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <i className="ri-alert-line text-amber-500 text-sm mt-0.5"></i>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Saldo pendente</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">R$ {customer.pending_amount.toLocaleString('pt-BR')} aguardando regularização.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PREFERÊNCIAS */}
          {activeTab === 'preferencias' && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Perfil de Preferências</p>

              <div className="flex flex-wrap gap-2">
                {customer.preferences.map((pref) => (
                  <span
                    key={pref}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${prefColors[pref] || 'bg-stone-50 text-stone-600 border-stone-200'}`}
                  >
                    <i className={`${preferenceIcons[pref as CustomerPreference] || 'ri-star-line'} text-sm`}></i>
                    {preferenceLabels[pref as CustomerPreference] || pref}
                  </span>
                ))}
                {customer.preferences.length === 0 && (
                  <p className="text-xs text-stone-400">Nenhuma preferência registrada.</p>
                )}
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-stone-600 mb-3">Categorias de serviço</p>
                {(['aeroporto', 'hotel', 'executivo', 'turismo', 'familia', 'acessibilidade', 'ingles', 'espanhol', 'bagagem_extra'] as CustomerPreference[]).map((pref) => {
                  const active = customer.preferences.includes(pref);
                  return (
                    <div key={pref} className={`flex items-center gap-3 py-2 border-b border-stone-100 last:border-0 ${active ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-md ${active ? 'bg-teal-100' : 'bg-stone-100'}`}>
                        <i className={`${preferenceIcons[pref]} text-xs ${active ? 'text-teal-600' : 'text-stone-400'}`}></i>
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-stone-700' : 'text-stone-400'}`}>{preferenceLabels[pref]}</span>
                      {active && <i className="ri-check-line text-teal-500 text-xs ml-auto"></i>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* JORNADA */}
          {activeTab === 'jornada' && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Linha do Tempo</p>

              {customer.journey.length > 0 ? (
                <div className="relative pl-6">
                  {customer.journey.map((ev: any, idx: number) => {
                    const cl = journeyColors[ev.color] || journeyColors.stone;
                    const isLast = idx === customer.journey.length - 1;
                    return (
                      <div key={ev.id} className="relative pb-5">
                        {!isLast && (
                          <div className={`absolute left-0 top-3 bottom-0 w-px ${cl.line} -translate-x-1/2`}></div>
                        )}
                        <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white ${cl.dot} -translate-x-1/2 shadow-sm`}></div>
                        <div className="pl-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <i className={`${ev.icon} text-sm ${cl.icon}`}></i>
                            <p className={`text-xs font-semibold ${cl.text}`}>{ev.label}</p>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">{ev.description}</p>
                          <p className="text-[10px] text-stone-400 mt-1">{fmtDateTime(ev.at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl py-10 flex flex-col items-center gap-2">
                  <i className="ri-route-line text-stone-300 text-xl"></i>
                  <p className="text-xs text-stone-400">Jornada do cliente será populada com os próximos eventos.</p>
                </div>
              )}

              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5 flex items-center gap-2.5">
                <i className="ri-user-heart-line text-teal-500 text-sm"></i>
                <div>
                  <p className="text-xs font-semibold text-teal-800">Cliente desde {fmtDate(customer.created_at)}</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Última atividade em {fmtDate(customer.last_activity_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* OBSERVAÇÕES */}
          {activeTab === 'observacoes' && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Observações Operacionais</p>

              {customer.notes ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2.5">
                    <i className="ri-sticky-note-line text-amber-500 text-sm mt-0.5"></i>
                    <p className="text-sm text-amber-800 leading-relaxed">{customer.notes}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl py-10 flex flex-col items-center gap-2">
                  <i className="ri-sticky-note-line text-stone-400 text-xl"></i>
                  <p className="text-xs text-stone-400">Nenhuma observação registrada.</p>
                </div>
              )}

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-stone-600">Adicionar observação</p>
                <textarea
                  className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-700 placeholder-stone-400 outline-none resize-none focus:border-teal-300 focus:ring-1 focus:ring-teal-200"
                  rows={3}
                  placeholder="Adicione uma observação sobre este cliente…"
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap">
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 border-t border-stone-200 px-5 py-4 bg-white">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={onNewBooking}
              className="flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-line text-sm"></i>
              Nova Reserva
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-check-line text-sm"></i>
              Ver Reservas
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-message-3-line text-sm"></i>
              Enviar Mensagem
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line text-sm"></i>
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
