import { useState } from 'react';

interface VehicleDetailDrawerProps {
  vehicle: any;
  onClose: () => void;
}

type DrawerTab = 'perfil' | 'operacao' | 'motorista' | 'capacidade' | 'manutencao' | 'historico';

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'perfil',     label: 'Perfil',      icon: 'ri-car-line' },
  { id: 'operacao',   label: 'Hoje',        icon: 'ri-route-line' },
  { id: 'motorista',  label: 'Motorista',   icon: 'ri-steering-2-line' },
  { id: 'capacidade', label: 'Capacidade',  icon: 'ri-group-line' },
  { id: 'manutencao', label: 'Manutenção',  icon: 'ri-tools-line' },
  { id: 'historico',  label: 'Histórico',   icon: 'ri-history-line' },
];

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  available:    { label: 'Disponível',   badge: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500' },
  in_operation: { label: 'Em Operação',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     dot: 'bg-navy-500' },
  maintenance:  { label: 'Manutenção',   badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  inactive:     { label: 'Inativo',      badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
  reserved:     { label: 'Reservado',    badge: 'bg-sand-100 text-navy-600 border-sand-300',    dot: 'bg-sand-500' },
  attention:    { label: 'Atenção',      badge: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400' },
};

const typeLabel: Record<string, string> = {
  van: 'Van', sprinter: 'Sprinter', sedan: 'Sedã', suv: 'SUV', bus: 'Ônibus',
};

const typeIcon: Record<string, string> = {
  van: 'ri-car-line', sprinter: 'ri-bus-2-line', sedan: 'ri-taxi-line', suv: 'ri-car-line', bus: 'ri-bus-line',
};

const tripStatusConfig: Record<string, { label: string; dot: string }> = {
  completed:       { label: 'Concluído',         dot: 'bg-sand-400' },
  in_progress:     { label: 'Em Andamento',       dot: 'bg-teal-500' },
  driver_assigned: { label: 'Motorista Alocado',  dot: 'bg-navy-500' },
  scheduled:       { label: 'Agendado',           dot: 'bg-stone-400' },
  delayed:         { label: 'Atrasado',           dot: 'bg-red-400' },
};

const maintStatusLabel: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
  ok:             { label: 'Em dia',          color: 'text-teal-700',  icon: 'ri-shield-check-line', bg: 'bg-teal-50',   border: 'border-teal-200' },
  due_soon:       { label: 'Revisão próxima', color: 'text-amber-700', icon: 'ri-time-line',          bg: 'bg-amber-50',  border: 'border-amber-200' },
  overdue:        { label: 'Atrasada',        color: 'text-red-600',   icon: 'ri-alarm-warning-line', bg: 'bg-red-50',    border: 'border-red-200' },
  in_maintenance: { label: 'Em manutenção',   color: 'text-amber-700', icon: 'ri-tools-line',         bg: 'bg-amber-50',  border: 'border-amber-200' },
};

const timelineTypeConfig: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'ri-information-line', color: 'text-navy-500' },
  success: { icon: 'ri-checkbox-circle-line', color: 'text-teal-500' },
  warning: { icon: 'ri-alert-line', color: 'text-amber-500' },
  error:   { icon: 'ri-close-circle-line', color: 'text-red-500' },
};

function OccupancyVisual({ current, capacity }: { current: number; capacity: number }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
  const textColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-teal-600';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-600">Ocupação atual</span>
        <span className={`text-xs font-bold ${textColor}`}>{pct}% ({current}/{capacity})</span>
      </div>
      <div className="h-3 bg-sand-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
      </div>
      {pct >= 90 && (
        <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
          <i className="ri-alert-line text-xs"></i>
          Capacidade crítica — quase lotado
        </p>
      )}
    </div>
  );
}

function MaintenanceProgressBar({ last, next }: { last: string; next: string }) {
  const lastDate = new Date(last).getTime();
  const nextDate = new Date(next).getTime();
  const now = Date.now();
  const total = nextDate - lastDate;
  const elapsed = now - lastDate;
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const daysLeft = Math.round((nextDate - now) / 86400000);
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-navy-400">
        <span>{new Date(last).toLocaleDateString('pt-BR')}</span>
        <span className={`font-semibold ${daysLeft < 0 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-600' : 'text-navy-600'}`}>
          {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasado` : `${daysLeft}d restantes`}
        </span>
        <span>{new Date(next).toLocaleDateString('pt-BR')}</span>
      </div>
      <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

export default function VehicleDetailDrawer({ vehicle, onClose }: VehicleDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('perfil');
  const s = statusConfig[vehicle.status];
  const mc = maintStatusLabel[vehicle.maintenance_status];
  const icon = typeIcon[vehicle.type];

  const scrollTo = (id: DrawerTab) => {
    setActiveTab(id);
    const el = document.getElementById(`vdr-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${
                vehicle.status === 'maintenance' || vehicle.status === 'attention' ? 'bg-amber-50 border-amber-100' :
                vehicle.status === 'inactive' ? 'bg-stone-50 border-stone-200' :
                'bg-navy-50 border-navy-100'
              }`}>
                <i className={`${icon} text-xl ${
                  vehicle.status === 'maintenance' ? 'text-amber-500' :
                  vehicle.status === 'attention' ? 'text-red-400' :
                  vehicle.status === 'inactive' ? 'text-stone-400' : 'text-navy-600'
                }`}></i>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot}`}></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-900 truncate">{vehicle.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-mono text-navy-500 bg-sand-100 px-1.5 py-0.5 rounded">{vehicle.plate}</span>
                <span className="text-[10px] text-navy-400">{typeLabel[vehicle.type]} · {vehicle.year}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border ${s.badge}`}>{s.label}</span>
                <span className={`text-[9px] font-semibold flex items-center gap-1 ${mc.color}`}>
                  <i className={`${mc.icon} text-[10px]`}></i>
                  {mc.label}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer flex-shrink-0 ml-2"
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
                activeTab === tab.id ? 'bg-navy-950 text-white' : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <i className={`${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* ── Perfil ── */}
          <div id="vdr-perfil">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-car-line"></i> Dados do Veículo
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Marca / Modelo</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{vehicle.make}</p>
                  <p className="text-[10px] text-navy-500">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Ano</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Placa</p>
                  <p className="text-xs font-mono font-bold text-navy-800 mt-0.5">{vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Tipo</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{typeLabel[vehicle.type]}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Cor</p>
                  <p className="text-xs text-navy-700 mt-0.5">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Capacidade</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{vehicle.capacity} passageiros</p>
                </div>
              </div>
              {vehicle.notes && (
                <div className="pt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{vehicle.notes}</p>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="mt-3 bg-navy-950 rounded-xl p-4 grid grid-cols-3 gap-4">
              {[
                { label: 'Transfers Total', value: vehicle.transfers_total },
                { label: 'km Total', value: vehicle.km_total.toLocaleString('pt-BR') },
                { label: 'km Hoje', value: vehicle.km_today },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-xl font-semibold text-white">{stat.value}</p>
                  <p className="text-[9px] text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Operação de Hoje ── */}
          <div id="vdr-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-route-line"></i> Operação de Hoje ({vehicle.transfers_today})
            </h3>
            {vehicle.today_transfers.length === 0 ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-center">
                <i className="ri-calendar-check-line text-navy-300 text-xl block mb-2"></i>
                <p className="text-xs text-navy-500 font-medium">
                  {vehicle.status === 'maintenance' ? 'Veículo em manutenção — sem operação' : 'Sem transfers para hoje'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicle.today_transfers.map((t) => {
                  const ts = tripStatusConfig[t.status] ?? tripStatusConfig.scheduled;
                  const dt = new Date(t.scheduled_at);
                  return (
                    <div key={t.id} className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ts.dot} ${t.status === 'in_progress' ? 'animate-pulse' : ''}`}></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-mono font-bold text-navy-700">{t.reference}</p>
                            <p className="text-[10px] text-navy-400">
                              {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-[10px] text-navy-500 truncate mt-0.5">{t.origin} → {t.destination}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[9px] text-navy-500 font-medium">{ts.label}</p>
                          <p className="text-[9px] text-navy-400 flex items-center gap-0.5 mt-0.5 justify-end">
                            <i className="ri-group-line text-[9px]"></i>{t.pax} pax
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Today's timeline */}
            {vehicle.timeline.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2">Timeline operacional</p>
                <div className="space-y-1">
                  {vehicle.timeline.map((ev, i) => {
                    const tc = timelineTypeConfig[ev.type];
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                          <div className={`w-5 h-5 flex items-center justify-center rounded-full border bg-white border-sand-200 flex-shrink-0`}>
                            <i className={`${tc.icon} text-[9px] ${tc.color}`}></i>
                          </div>
                          {i < vehicle.timeline.length - 1 && <div className="w-px h-3 bg-sand-200 mt-0.5"></div>}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-navy-500 flex-shrink-0">{ev.time}</span>
                            <p className="text-[10px] text-navy-700 truncate">{ev.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Motorista ── */}
          <div id="vdr-motorista">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Motorista Vinculado
            </h3>
            {vehicle.assigned_driver ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-navy-950 text-white text-sm font-bold flex-shrink-0">
                    {vehicle.assigned_driver_initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{vehicle.assigned_driver}</p>
                    <p className="text-[11px] text-navy-500 mt-0.5">{vehicle.assigned_driver_phone}</p>
                  </div>
                  <div className="flex items-center gap-1 text-teal-600 flex-shrink-0">
                    <i className="ri-smartphone-line text-sm"></i>
                    <span className="text-[10px] font-medium">App ativo</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-sand-200 flex gap-2">
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-phone-line text-xs"></i>
                    Ligar
                  </button>
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-user-line text-xs"></i>
                    Ver Perfil
                  </button>
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-link text-xs"></i>
                    Alterar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                    <i className="ri-steering-2-line text-amber-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Sem motorista vinculado</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Veículo não pode operar sem motorista designado</p>
                  </div>
                </div>
                <button type="button" className="w-full h-8 flex items-center justify-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-link text-xs"></i>
                  Vincular Motorista
                </button>
              </div>
            )}
          </div>

          {/* ── Capacidade ── */}
          <div id="vdr-capacidade">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-group-line"></i> Capacidade Operacional
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-4">
              {/* Visual seat grid */}
              <div>
                <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-2">Assentos — visualização</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: vehicle.capacity }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                        i < vehicle.current_occupancy
                          ? 'bg-navy-950 border-navy-950'
                          : 'bg-white border-sand-300'
                      }`}
                    >
                      <i className={`ri-user-line text-[9px] ${i < vehicle.current_occupancy ? 'text-white' : 'text-sand-300'}`}></i>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {vehicle.status === 'in_operation' && (
                <OccupancyVisual current={vehicle.current_occupancy} capacity={vehicle.capacity} />
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-sand-200">
                <div className="text-center">
                  <p className="font-serif text-lg font-semibold text-navy-800">{vehicle.capacity}</p>
                  <p className="text-[9px] text-navy-400 mt-0.5">Capacidade</p>
                </div>
                <div className="text-center">
                  <p className="font-serif text-lg font-semibold text-navy-800">{vehicle.current_occupancy}</p>
                  <p className="text-[9px] text-navy-400 mt-0.5">Atual</p>
                </div>
                <div className="text-center">
                  <p className="font-serif text-lg font-semibold text-navy-800">{vehicle.capacity - vehicle.current_occupancy}</p>
                  <p className="text-[9px] text-navy-400 mt-0.5">Disponível</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Manutenção ── */}
          <div id="vdr-manutencao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-tools-line"></i> Manutenção
            </h3>

            {/* Status card */}
            <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border mb-3 ${mc.bg} ${mc.border}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white border ${mc.border} flex-shrink-0 mt-0.5`}>
                <i className={`${mc.icon} text-sm ${mc.color}`}></i>
              </div>
              <div>
                <p className={`text-xs font-bold ${mc.color}`}>{mc.label}</p>
                {vehicle.maintenance_notes && (
                  <p className="text-[11px] text-navy-600 mt-0.5 leading-relaxed">{vehicle.maintenance_notes}</p>
                )}
              </div>
            </div>

            {/* Progress bar between last and next service */}
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Última revisão</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">
                    {new Date(vehicle.last_service).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-navy-400">{vehicle.last_service_km.toLocaleString('pt-BR')} km</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Próxima revisão</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">
                    {new Date(vehicle.next_service).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-navy-400">{vehicle.next_service_km.toLocaleString('pt-BR')} km</p>
                </div>
              </div>

              <MaintenanceProgressBar last={vehicle.last_service} next={vehicle.next_service} />
            </div>

            {/* Checklist placeholder */}
            <div className="mt-3 bg-sand-50 border border-sand-200 rounded-xl p-4">
              <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-3">Checklist de revisão</p>
              <div className="space-y-2">
                {[
                  { label: 'Óleo do motor', ok: vehicle.maintenance_status === 'ok' || vehicle.maintenance_status === 'due_soon' },
                  { label: 'Filtro de ar', ok: vehicle.maintenance_status === 'ok' },
                  { label: 'Sistema de freios', ok: vehicle.maintenance_status === 'ok' || vehicle.maintenance_status === 'due_soon' },
                  { label: 'Pneus e calibragem', ok: vehicle.maintenance_status !== 'overdue' },
                  { label: 'Luzes e sinalização', ok: vehicle.maintenance_status === 'ok' || vehicle.maintenance_status === 'due_soon' },
                  { label: 'Sistema de ar-condicionado', ok: vehicle.maintenance_status !== 'in_maintenance' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 flex items-center justify-center rounded-md border flex-shrink-0 ${
                      item.ok ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <i className={`text-[9px] ${item.ok ? 'ri-check-line text-teal-600' : 'ri-time-line text-amber-600'}`}></i>
                    </div>
                    <p className={`text-xs ${item.ok ? 'text-navy-700' : 'text-amber-700 font-medium'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Histórico ── */}
          <div id="vdr-historico">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-history-line"></i> Histórico de Manutenções
            </h3>
            {vehicle.maintenance_history.length === 0 ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-center">
                <i className="ri-file-list-line text-navy-300 text-xl block mb-2"></i>
                <p className="text-xs text-navy-500 font-medium">Sem histórico registrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicle.maintenance_history.map((ev, i) => (
                  <div key={i} className="flex gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-navy-400 flex-shrink-0"></div>
                      {i < vehicle.maintenance_history.length - 1 && <div className="w-px flex-1 bg-sand-300 mt-1 min-h-4"></div>}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-navy-800">{ev.type}</p>
                          <p className="text-[10px] text-navy-500 mt-0.5 leading-relaxed">{ev.description}</p>
                          <p className="text-[10px] text-navy-400 mt-1">{ev.technician} · {ev.km.toLocaleString('pt-BR')} km</p>
                        </div>
                        <span className="text-[10px] text-navy-400 whitespace-nowrap flex-shrink-0">
                          {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sand-200 flex-shrink-0 bg-sand-50/60">
          <div className="flex gap-2 mb-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              {vehicle.assigned_driver ? 'Alterar Motorista' : 'Vincular Motorista'}
            </button>
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Agendar Manutenção
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Ver Transfers
            </button>
            <button type="button" className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              Editar Veículo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

