import { useState } from 'react';
import type { AgendaItem } from '@/services/agenda';

interface AgendaTransferDrawerProps {
  item: AgendaItem;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onAssignDriver?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onViewBooking?: (id: string) => void;
}

type DrawerTab = 'reserva' | 'passageiros' | 'transfer' | 'operacao' | 'timeline';

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'reserva',     label: 'Reserva',     icon: 'ri-information-line' },
  { id: 'passageiros', label: 'Passageiros',  icon: 'ri-group-line' },
  { id: 'transfer',    label: 'Transfer',     icon: 'ri-route-line' },
  { id: 'operacao',    label: 'Operação',     icon: 'ri-steering-2-line' },
  { id: 'timeline',    label: 'Timeline',     icon: 'ri-time-line' },
];

const statusConfig: Record<string, { label: string; badge: string }> = {
  scheduled:       { label: 'Agendado',            badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  driver_assigned: { label: 'Motorista Atribuído', badge: 'bg-navy-50 text-navy-700 border-navy-200' },
  in_progress:     { label: 'Em Andamento',        badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  completed:       { label: 'Finalizado',          badge: 'bg-sand-100 text-navy-500 border-sand-200' },
  delayed:         { label: 'Atrasado',            badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled:       { label: 'Cancelado',           badge: 'bg-red-50 text-red-600 border-red-200' },
};

const timelineIconColor: Record<string, string> = {
  teal:  'text-teal-600 bg-teal-50',
  navy:  'text-navy-600 bg-navy-50',
  amber: 'text-amber-600 bg-amber-50',
  red:   'text-red-500 bg-red-50',
  stone: 'text-stone-500 bg-stone-100',
};

export default function AgendaTransferDrawer({ item, onClose, onCancel, onAssignDriver, onReschedule, onViewBooking }: AgendaTransferDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('reserva');
  const s = statusConfig[item.status] ?? statusConfig.scheduled;
  const dt = new Date(item.scheduled_at);
  const endDt = new Date(dt.getTime() + item.estimated_duration_min * 60000);

  const scrollToTab = (id: DrawerTab) => {
    setActiveTab(id);
    const el = document.getElementById(`agenda-drawer-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <p className="text-navy-800 text-sm font-bold font-mono">{item.reference}</p>
              <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border ${s.badge}`}>{s.label}</span>
              {item.booking_type === 'experience' && (
                <span className="text-[9px] font-bold bg-navy-950 text-white px-2 py-1 rounded-lg uppercase tracking-wide">
                  Experiência
                </span>
              )}
            </div>
            <p className="text-navy-500 text-xs">{item.passenger_name} · {item.passenger_count} passageiro(s)</p>
            <p className="text-navy-400 text-[11px] mt-0.5">
              {dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} → {endDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

        {/* Tab nav */}
        <div className="flex gap-0.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white'
                  : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <i className={`${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* ── Reserva ── */}
          <div id="agenda-drawer-reserva">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-information-line"></i> Informações da Reserva
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Referência</p>
                  <p className="text-xs font-mono font-semibold text-navy-700 mt-0.5">{item.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Tipo</p>
                  <p className="text-xs font-medium text-navy-800 mt-0.5 capitalize">
                    {item.booking_type === 'transfer' ? 'Transfer' : 'Experiência'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Data / Hora</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">
                    {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-navy-400">
                    {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Duração Est.</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{item.estimated_duration_min} min</p>
                </div>
              </div>
              {item.notes && (
                <div className="pt-3 mt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{item.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Passageiros ── */}
          <div id="agenda-drawer-passageiros">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-group-line"></i> Passageiros ({item.passenger_count})
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-950 flex-shrink-0">
                <i className="ri-user-line text-white text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-800">{item.passenger_name}</p>
                <p className="text-[10px] text-navy-400 mt-0.5">Passageiro principal · {item.passenger_count} pax total</p>
              </div>
            </div>
          </div>

          {/* ── Transfer ── */}
          <div id="agenda-drawer-transfer">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-route-line"></i> Transfer
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-4">
              {item.route_name && (
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Rota</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{item.route_name}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-100 flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-2-line text-teal-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Origem</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{item.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0 mt-0.5">
                    <i className="ri-flag-line text-navy-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Destino</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{item.dropoff_location}</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-sand-200">
                <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2">Janela de Tempo</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === 'completed' ? 'bg-sand-400 w-full' :
                        item.status === 'in_progress' ? 'bg-teal-500 w-1/2' :
                        item.status === 'delayed' ? 'bg-amber-500 w-2/3' :
                        'bg-navy-300 w-0'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-navy-500 whitespace-nowrap">
                    {item.estimated_duration_min} min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Operação ── */}
          <div id="agenda-drawer-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Operação
            </h3>
            {item.driver ? (
              <div className="space-y-3">
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2.5">Motorista</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-950 text-white text-sm font-bold flex-shrink-0">
                      {item.driver.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-800">{item.driver.name}</p>
                      <p className="text-[10px] text-navy-400 mt-0.5">{item.driver.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2.5">Veículo</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-100 flex-shrink-0">
                      <i className="ri-car-line text-navy-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-800">{item.driver.vehicle_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-navy-500 bg-white border border-sand-200 px-1.5 py-0.5 rounded">
                          {item.driver.vehicle_plate}
                        </span>
                        <span className="text-[10px] text-navy-400">{item.driver.vehicle_type}</span>
                        <span className="text-[10px] text-navy-400">{item.driver.vehicle_capacity} lugares</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                  <i className="ri-user-unfollow-line text-amber-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">Motorista não alocado</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Este transfer ainda não tem motorista atribuído.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Timeline ── */}
          <div id="agenda-drawer-timeline">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-time-line"></i> Timeline Operacional
            </h3>
            <div className="space-y-0">
              {item.timeline.map((event, i) => {
                const evTime = new Date(event.at);
                const isLast = i === item.timeline.length - 1;
                const iconCls = timelineIconColor[event.color] ?? timelineIconColor.stone;
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-white ring-1 ring-sand-200 flex-shrink-0 ${iconCls}`}>
                        <i className={`${event.icon} text-[10px]`}></i>
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-sand-200 my-1"></div>}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
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
            onClick={() => onViewBooking?.(item.id)}
            className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-sand-200"
          >
            <i className="ri-external-link-line mr-1.5"></i>
            Ver Reserva
          </button>
          {!item.driver && item.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onAssignDriver?.(item.id)}
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Alocar Motorista
            </button>
          )}
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onCancel?.(item.id)}
              className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-red-200"
            >
              <i className="ri-close-circle-line mr-1.5"></i>
              Cancelar
            </button>
          )}
          {item.driver && item.status !== 'completed' && item.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onReschedule?.(item.id)}
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Alterar Horário
            </button>
          )}
        </div>
      </div>
    </>
  );
}