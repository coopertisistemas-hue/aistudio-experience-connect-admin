import { useState } from 'react';
import type { MockBooking } from '@/mocks/admin-bookings';
import StatusBadge from '@/pages/admin/components/ui/StatusBadge';

interface BookingDetailDrawerProps {
  booking: MockBooking;
  onClose: () => void;
}

type DrawerSection = 'geral' | 'passageiros' | 'transfer' | 'operacao' | 'financeiro' | 'timeline';

const sections: { id: DrawerSection; label: string; icon: string }[] = [
  { id: 'geral', label: 'Geral', icon: 'ri-information-line' },
  { id: 'passageiros', label: 'Passageiros', icon: 'ri-group-line' },
  { id: 'transfer', label: 'Transfer', icon: 'ri-route-line' },
  { id: 'operacao', label: 'Operação', icon: 'ri-steering-2-line' },
  { id: 'financeiro', label: 'Financeiro', icon: 'ri-secure-payment-line' },
  { id: 'timeline', label: 'Timeline', icon: 'ri-time-line' },
];

const ageGroupLabel: Record<string, string> = {
  adult: 'Adulto',
  child: 'Criança',
  senior: 'Sênior',
};

const timelineColorMap: Record<string, string> = {
  teal: 'bg-teal-500 border-teal-200',
  navy: 'bg-navy-500 border-navy-200',
  amber: 'bg-amber-500 border-amber-200',
  red: 'bg-red-400 border-red-200',
  stone: 'bg-stone-300 border-stone-200',
};

const timelineIconColorMap: Record<string, string> = {
  teal: 'text-teal-600 bg-teal-50',
  navy: 'text-navy-600 bg-navy-50',
  amber: 'text-amber-600 bg-amber-50',
  red: 'text-red-500 bg-red-50',
  stone: 'text-stone-500 bg-stone-100',
};

export default function BookingDetailDrawer({ booking, onClose }: BookingDetailDrawerProps) {
  const [activeSection, setActiveSection] = useState<DrawerSection>('geral');
  const dt = new Date(booking.scheduled_at);
  const created = new Date(booking.created_at);

  const scrollToSection = (id: DrawerSection) => {
    setActiveSection(id);
    const el = document.getElementById(`drawer-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <p className="text-navy-800 text-sm font-bold font-mono">{booking.reference}</p>
              <StatusBadge status={booking.status} size="md" />
            </div>
            <p className="text-navy-500 text-xs">{booking.passenger_name} · {booking.passenger_count} passageiro(s)</p>
            <p className="text-navy-400 text-[11px] mt-0.5">
              {dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer flex-shrink-0 ml-3"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Section nav */}
        <div className="flex gap-0.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeSection === s.id
                  ? 'bg-navy-950 text-white'
                  : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <i className={`${s.icon} text-xs`}></i>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
          onScroll={(e) => {
            const el = e.currentTarget;
            for (const s of sections) {
              const section = document.getElementById(`drawer-section-${s.id}`);
              if (section) {
                const top = section.offsetTop - el.offsetTop - 32;
                if (el.scrollTop >= top) setActiveSection(s.id);
              }
            }
          }}
        >

          {/* ── Geral ── */}
          <div id="drawer-section-geral">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-information-line"></i> Informações Gerais
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Tipo</p>
                  <p className="text-xs font-medium text-navy-800 mt-0.5 capitalize">
                    {booking.booking_type === 'transfer' ? 'Transfer' : 'Experiência'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Criada em</p>
                  <p className="text-xs font-medium text-navy-800 mt-0.5">
                    {created.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Referência</p>
                  <p className="text-xs font-mono font-semibold text-navy-700 mt-0.5">{booking.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Status</p>
                  <div className="mt-1"><StatusBadge status={booking.status} /></div>
                </div>
              </div>

              {booking.notes && (
                <div className="pt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Passageiros ── */}
          <div id="drawer-section-passageiros">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-group-line"></i> Passageiros ({booking.passenger_count})
            </h3>
            <div className="space-y-2">
              {/* Principal */}
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-950 flex-shrink-0">
                    <i className="ri-user-line text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{booking.passenger_name}</p>
                    <p className="text-[10px] text-navy-400">Passageiro principal</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-sand-200">
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">E-mail</p>
                    <p className="text-xs text-navy-700 mt-0.5 truncate">{booking.passenger_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Telefone</p>
                    <p className="text-xs text-navy-700 mt-0.5">{booking.passenger_phone}</p>
                  </div>
                </div>
              </div>

              {/* Additional passengers */}
              {booking.passengers.slice(1).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-sand-200 rounded-xl">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sand-100 flex-shrink-0">
                    <i className="ri-user-line text-navy-400 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy-800 truncate">{p.full_name}</p>
                    {p.document && <p className="text-[10px] text-navy-400 mt-0.5">{p.document}</p>}
                  </div>
                  <span className="text-[10px] text-navy-400 font-medium flex-shrink-0">
                    {ageGroupLabel[p.age_group]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Transfer ── */}
          <div id="drawer-section-transfer">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-route-line"></i> Transfer
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-4">
              {booking.route_name && (
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Rota</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{booking.route_name}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-100 flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-2-line text-teal-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Origem</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{booking.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-3">
                  <div className="w-px h-5 bg-sand-300 ml-0"></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0 mt-0.5">
                    <i className="ri-flag-line text-navy-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Destino</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{booking.dropoff_location}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-200">
                <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2">Agendamento</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-sand-200 flex-shrink-0">
                    <i className="ri-calendar-event-line text-navy-500 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-navy-400">
                      {dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Operação ── */}
          <div id="drawer-section-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Operação
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2.5">Motorista</p>
                {booking.driver_name ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 flex-shrink-0">
                      <i className="ri-steering-2-line text-navy-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-800">{booking.driver_name}</p>
                      {booking.driver_phone && (
                        <p className="text-[10px] text-navy-400 mt-0.5">{booking.driver_phone}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-200 flex-shrink-0">
                      <i className="ri-user-unfollow-line text-amber-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-700">Não alocado</p>
                      <p className="text-[10px] text-navy-400">Atribuição pendente</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2.5">Veículo</p>
                {booking.vehicle_name ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 flex-shrink-0">
                      <i className="ri-car-line text-navy-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-800">{booking.vehicle_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {booking.vehicle_plate && (
                          <span className="text-[10px] font-mono text-navy-500 bg-white border border-sand-200 px-1.5 py-0.5 rounded">
                            {booking.vehicle_plate}
                          </span>
                        )}
                        {booking.vehicle_type && (
                          <span className="text-[10px] text-navy-400">{booking.vehicle_type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-200 flex-shrink-0">
                      <i className="ri-car-line text-amber-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-700">Não alocado</p>
                      <p className="text-[10px] text-navy-400">Veículo pendente</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Financeiro ── */}
          <div id="drawer-section-financeiro">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-secure-payment-line"></i> Financeiro
            </h3>
            <div className="bg-navy-950 rounded-xl p-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Valor Total</p>
                  <p className="font-serif text-2xl font-semibold text-white mt-1">
                    R$ {booking.total_amount.toLocaleString('pt-BR')}
                  </p>
                </div>
                <StatusBadge status={booking.payment_status} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Método</p>
                  <p className="text-white text-xs font-medium mt-1">
                    {booking.payment_method ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Status</p>
                  <p className="text-white text-xs font-medium mt-1 capitalize">
                    {booking.payment_status === 'paid' ? 'Pago' :
                     booking.payment_status === 'pending' ? 'Pendente' :
                     booking.payment_status === 'overdue' ? 'Vencido' :
                     booking.payment_status === 'partial' ? 'Parcial' :
                     booking.payment_status === 'refunded' ? 'Reembolsado' : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Timeline ── */}
          <div id="drawer-section-timeline">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-time-line"></i> Timeline Operacional
            </h3>
            <div className="relative space-y-0">
              {booking.timeline.map((event, i) => {
                const evTime = new Date(event.at);
                const isLast = i === booking.timeline.length - 1;
                const dotCls = timelineColorMap[event.color] ?? timelineColorMap.stone;
                const iconCls = timelineIconColorMap[event.color] ?? timelineIconColorMap.stone;
                return (
                  <div key={event.id} className="flex gap-4">
                    {/* Spine */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-white ring-1 ring-sand-200 flex-shrink-0 ${iconCls}`}>
                        <i className={`${event.icon} text-[10px]`}></i>
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-sand-200 my-1"></div>}
                    </div>

                    {/* Content */}
                    <div className={`pb-5 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-navy-800">{event.label}</p>
                        <p className="text-[10px] text-navy-400 whitespace-nowrap flex-shrink-0">
                          {evTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {evTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-[11px] text-navy-500 mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action footer */}
        <div className="px-5 py-4 border-t border-sand-200 flex gap-2.5 flex-shrink-0 bg-sand-50/60">
          <button
            type="button"
            className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-sand-200"
          >
            Editar Reserva
          </button>
          {!booking.driver_name && (
            <button
              type="button"
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Alocar Motorista
            </button>
          )}
          {booking.driver_name && (
            <button
              type="button"
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Ver Transfer
            </button>
          )}
        </div>
      </div>
    </>
  );
}