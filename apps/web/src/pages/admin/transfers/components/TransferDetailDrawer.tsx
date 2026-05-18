import { useState } from 'react';
import type { MockTransfer } from '@/mocks/admin-transfers';

interface TransferDetailDrawerProps {
  transfer: MockTransfer;
  onClose: () => void;
}

type DrawerTab = 'geral' | 'passageiros' | 'operacao' | 'veiculo' | 'timeline' | 'mapa';

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'geral',       label: 'Geral',       icon: 'ri-information-line' },
  { id: 'passageiros', label: 'Passageiros', icon: 'ri-group-line' },
  { id: 'operacao',    label: 'Operação',    icon: 'ri-steering-2-line' },
  { id: 'veiculo',     label: 'Veículo',     icon: 'ri-car-line' },
  { id: 'timeline',    label: 'Timeline',    icon: 'ri-time-line' },
  { id: 'mapa',        label: 'Mapa',        icon: 'ri-map-2-line' },
];

const statusConfig: Record<string, { label: string; badge: string }> = {
  scheduled:       { label: 'Agendado',            badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  driver_assigned: { label: 'Motorista Atribuído', badge: 'bg-navy-50 text-navy-700 border-navy-200' },
  confirmed:       { label: 'Confirmado',          badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  in_progress:     { label: 'Em Andamento',        badge: 'bg-teal-50 text-teal-800 border-teal-300' },
  completed:       { label: 'Finalizado',          badge: 'bg-sand-100 text-navy-500 border-sand-200' },
  delayed:         { label: 'Atrasado',            badge: 'bg-amber-50 text-amber-700 border-amber-300' },
  cancelled:       { label: 'Cancelado',           badge: 'bg-red-50 text-red-600 border-red-200' },
};

const timelineIconColor: Record<string, string> = {
  teal:  'text-teal-600 bg-teal-50',
  navy:  'text-navy-600 bg-navy-50',
  amber: 'text-amber-600 bg-amber-50',
  red:   'text-red-500 bg-red-50',
  stone: 'text-stone-500 bg-stone-100',
};

const ageGroupLabel: Record<string, string> = {
  adult: 'Adulto', child: 'Criança', senior: 'Sênior',
};

function OccupancyVisual({ current, max }: { current: number; max: number }) {
  if (max === 0) return null;
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
  const textColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-teal-700';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-navy-400 uppercase tracking-wider">Ocupação</span>
        <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="relative h-3 bg-sand-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-navy-400">
        <span>{current} passageiro(s)</span>
        <span>Capacidade: {max}</span>
      </div>
      {pct >= 90 && (
        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
          <i className="ri-alert-line text-xs"></i>
          <span className="text-[10px] font-medium">Capacidade próxima do limite</span>
        </div>
      )}
    </div>
  );
}

function RouteMapPlaceholder({ transfer }: { transfer: MockTransfer }) {
  const progress = transfer.status === 'completed' ? 100 :
                   transfer.status === 'in_progress' ? 50 :
                   transfer.status === 'delayed' ? 60 : 0;

  return (
    <div className="space-y-4">
      {/* Map visualization */}
      <div className="relative bg-stone-50 border border-sand-200 rounded-xl overflow-hidden" style={{ height: 220 }}>
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,82,160,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42,82,160,0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <img
          src="https://readdy.ai/api/search-image?query=minimalist%20clean%20aerial%20city%20road%20map%20illustration%20abstract%20top%20view%20streets%20and%20blocks%20light%20warm%20beige%20tones%20no%20labels%20simple%20elegant%20cartographic%20style%20premium%20hospitality%20brand&width=520&height=220&seq=transfer-map-bg&orientation=landscape"
          alt="Mapa de rota"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
        />

        {/* SVG Route curve */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 220" preserveAspectRatio="none">
          {/* Background route (full) */}
          <path
            d="M 60 160 Q 200 60 460 60"
            stroke="rgb(42,82,160)"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.2"
          />
          {/* Progress overlay */}
          {progress > 0 && (
            <path
              d={`M 60 160 Q ${60 + (140 * progress / 100)} ${160 - (100 * progress / 100)} ${60 + (400 * progress / 100)} ${160 - (100 * progress / 100)}`}
              stroke="rgb(24,167,155)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.8"
            />
          )}
        </svg>

        {/* Origin marker */}
        <div className="absolute" style={{ left: 44, top: 140, transform: 'translate(-50%, -50%)' }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-600 border-2 border-white shadow-md">
            <i className="ri-map-pin-2-line text-white text-xs"></i>
          </div>
          <div className="mt-1 bg-white/90 border border-sand-200 rounded px-1.5 py-0.5 text-[9px] font-semibold text-navy-800 whitespace-nowrap shadow-sm max-w-[90px] truncate text-center">
            {transfer.origin.split(',')[0]}
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute" style={{ right: 44, top: 45, transform: 'translate(50%, -50%)' }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-800 border-2 border-white shadow-md">
            <i className="ri-flag-line text-white text-xs"></i>
          </div>
          <div className="mt-1 bg-white/90 border border-sand-200 rounded px-1.5 py-0.5 text-[9px] font-semibold text-navy-800 whitespace-nowrap shadow-sm max-w-[90px] truncate text-center">
            {transfer.destination.split(',')[0]}
          </div>
        </div>

        {/* Vehicle indicator (for in-progress / delayed) */}
        {(transfer.status === 'in_progress' || transfer.status === 'delayed') && (
          <div
            className="absolute"
            style={{ left: `${20 + progress * 0.6}%`, top: `${70 - progress * 0.18}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-md ${transfer.status === 'delayed' ? 'bg-amber-500' : 'bg-teal-500'}`}>
              <i className="ri-car-line text-white text-[10px]"></i>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-semibold shadow-sm ${statusConfig[transfer.status]?.badge ?? ''}`}>
            {transfer.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>}
            {statusConfig[transfer.status]?.label}
          </div>
        </div>
      </div>

      {/* Route stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 text-center">
          <i className="ri-timer-line text-navy-400 text-sm mb-1 block"></i>
          <p className="text-sm font-bold text-navy-800">{transfer.duration_min}min</p>
          <p className="text-[10px] text-navy-400">Duração</p>
        </div>
        <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 text-center">
          <i className="ri-group-line text-navy-400 text-sm mb-1 block"></i>
          <p className="text-sm font-bold text-navy-800">{transfer.passenger_count}</p>
          <p className="text-[10px] text-navy-400">Passageiros</p>
        </div>
        <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 text-center">
          <i className="ri-route-line text-navy-400 text-sm mb-1 block"></i>
          <p className="text-sm font-bold text-navy-800">~{Math.round(transfer.duration_min * 0.8)}km</p>
          <p className="text-[10px] text-navy-400">Distância est.</p>
        </div>
      </div>

      <div className="bg-navy-950/5 border border-sand-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <i className="ri-information-line text-navy-400 text-sm flex-shrink-0"></i>
        <p className="text-[10px] text-navy-500 leading-relaxed">
          Integração GPS em desenvolvimento. A posição em tempo real e rota otimizada estarão disponíveis na versão final.
        </p>
      </div>
    </div>
  );
}

export default function TransferDetailDrawer({ transfer, onClose }: TransferDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('geral');
  const s = statusConfig[transfer.status] ?? statusConfig.scheduled;
  const dt = new Date(transfer.scheduled_at);
  const endDt = new Date(dt.getTime() + transfer.duration_min * 60000);

  const scrollTo = (id: DrawerTab) => {
    setActiveTab(id);
    const el = document.getElementById(`tdr-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <p className="text-navy-800 text-sm font-bold font-mono">{transfer.reference}</p>
              <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg border ${s.badge}`}>{s.label}</span>
              {transfer.booking_reference && (
                <span className="text-[9px] font-mono text-navy-400 bg-sand-100 border border-sand-200 px-2 py-1 rounded-lg">
                  {transfer.booking_reference}
                </span>
              )}
            </div>
            <p className="text-navy-500 text-xs">{transfer.passenger_name} · {transfer.passenger_count} passageiro(s)</p>
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

        {/* Tabs */}
        <div className="flex gap-0.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollTo(tab.id)}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Geral */}
          <div id="tdr-geral">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-information-line"></i> Informações Gerais
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Código Transfer</p>
                  <p className="text-xs font-mono font-semibold text-navy-700 mt-0.5">{transfer.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Reserva</p>
                  <p className="text-xs font-mono font-medium text-navy-700 mt-0.5">{transfer.booking_reference ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Data / Hora</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">
                    {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-navy-400">
                    {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Duração Est.</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{transfer.duration_min} min</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Rota</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{transfer.route_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Status</p>
                  <span className={`inline-block text-[9px] font-semibold px-2 py-1 rounded-lg border mt-0.5 ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-sand-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-100 flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-2-line text-teal-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Origem</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{transfer.origin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0 mt-0.5">
                    <i className="ri-flag-line text-navy-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Destino</p>
                    <p className="text-xs font-medium text-navy-800 mt-0.5">{transfer.destination}</p>
                  </div>
                </div>
              </div>
              {transfer.notes && (
                <div className="pt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{transfer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Passageiros */}
          <div id="tdr-passageiros">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-group-line"></i> Passageiros ({transfer.passenger_count})
            </h3>
            <div className="space-y-2 mb-3">
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-950 flex-shrink-0">
                    <i className="ri-user-line text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{transfer.passenger_name}</p>
                    <p className="text-[10px] text-navy-400">Passageiro principal</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-sand-200">
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">E-mail</p>
                    <p className="text-xs text-navy-700 mt-0.5 truncate">{transfer.passenger_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Telefone</p>
                    <p className="text-xs text-navy-700 mt-0.5">{transfer.passenger_phone}</p>
                  </div>
                </div>
              </div>
              {transfer.passengers.slice(1).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-sand-200 rounded-xl">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sand-100 flex-shrink-0">
                    <i className="ri-user-line text-navy-400 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy-800 truncate">{p.full_name}</p>
                    {p.document && <p className="text-[10px] text-navy-400 mt-0.5">{p.document}</p>}
                  </div>
                  <span className="text-[10px] text-navy-400 font-medium flex-shrink-0">{ageGroupLabel[p.age_group]}</span>
                </div>
              ))}
            </div>
            <OccupancyVisual current={transfer.passenger_count} max={transfer.capacity} />
          </div>

          {/* Operação */}
          <div id="tdr-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Operação
            </h3>
            {transfer.driver_name ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-950 text-white text-sm font-bold flex-shrink-0">
                    {transfer.driver_initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{transfer.driver_name}</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">{transfer.driver_phone}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-sand-200 flex gap-2">
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer">
                    <i className="ri-phone-line text-xs"></i>
                    Ligar
                  </button>
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer">
                    <i className="ri-user-follow-line text-xs"></i>
                    Reatribuir
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                    <i className="ri-user-unfollow-line text-amber-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Motorista não alocado</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Atribuição necessária antes da operação</p>
                  </div>
                </div>
                <button type="button" className="w-full h-8 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                  <i className="ri-user-add-line text-xs"></i>
                  Alocar Motorista
                </button>
              </div>
            )}
          </div>

          {/* Veículo */}
          <div id="tdr-veiculo">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-car-line"></i> Veículo
            </h3>
            {transfer.vehicle_plate !== '—' ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-100 flex-shrink-0">
                    <i className="ri-car-line text-navy-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{transfer.vehicle_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-navy-500 bg-white border border-sand-200 px-1.5 py-0.5 rounded">
                        {transfer.vehicle_plate}
                      </span>
                      <span className="text-[10px] text-navy-400">{transfer.vehicle_type}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-sand-200">
                  <OccupancyVisual current={transfer.passenger_count} max={transfer.capacity} />
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                  <i className="ri-car-line text-amber-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">Veículo não alocado</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Atribuição de veículo pendente</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div id="tdr-timeline">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-time-line"></i> Timeline Operacional
            </h3>
            <div>
              {transfer.timeline.map((event, i) => {
                const evTime = new Date(event.at);
                const isLast = i === transfer.timeline.length - 1;
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

          {/* Mapa */}
          <div id="tdr-mapa">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-map-2-line"></i> Visualização de Rota
            </h3>
            <RouteMapPlaceholder transfer={transfer} />
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-sand-200 flex-shrink-0 bg-sand-50/60">
          <div className="flex gap-2 mb-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Ver Reserva
            </button>
            {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
              <>
                <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
                  Alterar Veículo
                </button>
                <button type="button" className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                  {transfer.driver_name ? 'Reatribuir Motorista' : 'Alocar Motorista'}
                </button>
              </>
            )}
          </div>
          {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
            <button type="button" className="w-full py-2 bg-teal-500/10 hover:bg-teal-500/15 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200 transition-colors cursor-pointer">
              <i className="ri-refresh-line mr-1.5"></i>
              Atualizar Status
            </button>
          )}
        </div>
      </div>
    </>
  );
}