import { useState } from 'react';

interface RouteDetailDrawerProps {
  route: any;
  onClose: () => void;
  onCreateTransfer?: (routeId: string) => void;
}

type DrawerTab = 'perfil' | 'rota' | 'operacao' | 'recursos' | 'financeiro' | 'historico';

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'perfil',     label: 'Perfil',      icon: 'ri-route-line' },
  { id: 'rota',       label: 'Rota',        icon: 'ri-map-pin-line' },
  { id: 'operacao',   label: 'Hoje',        icon: 'ri-car-line' },
  { id: 'recursos',   label: 'Recursos',    icon: 'ri-steering-2-line' },
  { id: 'financeiro', label: 'Financeiro',  icon: 'ri-money-dollar-circle-line' },
  { id: 'historico',  label: 'Histórico',   icon: 'ri-bar-chart-line' },
];

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  active:       { label: 'Ativa',         badge: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500' },
  inactive:     { label: 'Inativa',       badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
  paused:       { label: 'Pausada',       badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  high_demand:  { label: 'Alta Demanda',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     dot: 'bg-navy-500' },
  attention:    { label: 'Atenção',       badge: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400' },
};

const categoryConfig: Record<string, { label: string; icon: string }> = {
  airport:   { label: 'Aeroporto',   icon: 'ri-flight-takeoff-line' },
  hotel:     { label: 'Hotel',       icon: 'ri-hotel-line' },
  tourism:   { label: 'Turismo',     icon: 'ri-compass-discover-line' },
  corporate: { label: 'Corporativo', icon: 'ri-building-4-line' },
  transfer:  { label: 'Transfer',    icon: 'ri-car-line' },
};

const tripStatusConfig: Record<string, { label: string; dot: string }> = {
  completed:       { label: 'Concluído',        dot: 'bg-sand-400' },
  in_progress:     { label: 'Em Andamento',      dot: 'bg-teal-500' },
  driver_assigned: { label: 'Motorista Alocado', dot: 'bg-navy-500' },
  scheduled:       { label: 'Agendado',          dot: 'bg-stone-400' },
  delayed:         { label: 'Atrasado',          dot: 'bg-red-400' },
  cancelled:       { label: 'Cancelado',         dot: 'bg-stone-300' },
};

export default function RouteDetailDrawer({ route, onClose, onCreateTransfer }: RouteDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('perfil');
  const routeStatus = route.status || (route.is_active ? 'active' : 'inactive');
  const routeCategory = route.category_name || route.category || 'transfer';
  const s = statusConfig[routeStatus] || statusConfig.active;
  const cat = categoryConfig[routeCategory] || categoryConfig.transfer;
  const durationMin = route.duration_min || 0;
  const durationLabel = durationMin >= 60
    ? `${Math.floor(durationMin / 60)}h ${durationMin % 60 > 0 ? `${durationMin % 60}min` : ''}`
    : `${durationMin}min`;

  const scrollTo = (id: DrawerTab) => {
    setActiveTab(id);
    const el = document.getElementById(`rdr-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const monthlyHistory = route.monthly_history || [];
  const totalRevenue = monthlyHistory.reduce((s: number, h: any) => s + (h.revenue || 0), 0);
  const totalTransfersHistory = monthlyHistory.reduce((s: number, h: any) => s + (h.transfers || 0), 0);

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-navy-50 border border-navy-100">
                <i className={`${cat.icon} text-xl text-navy-600`}></i>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot} ${route.status === 'high_demand' || route.status === 'attention' ? 'animate-pulse' : ''}`}></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-900 truncate">{route.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-navy-400">{cat.label}</span>
                <span className="text-[10px] text-navy-300">·</span>
                <span className="text-[10px] text-navy-400">{route.distance_km} km · {durationLabel}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border ${s.badge}`}>{s.label}</span>
                <span className="text-[10px] font-bold text-teal-600">
                  R$ {route.base_price.toFixed(0)}
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
          <div id="rdr-perfil">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-route-line"></i> Dados da Rota
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Nome</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{route.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Categoria</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{cat.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Distância</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{route.distance_km} km</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Duração</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{durationLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Preço Base</p>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">R$ {route.base_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Status</p>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border mt-0.5 inline-block ${s.badge}`}>{s.label}</span>
                </div>
              </div>
              {route.notes && (
                <div className="pt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{route.notes}</p>
                </div>
              )}
            </div>

            {/* Quick stats navy card */}
            <div className="mt-3 bg-navy-950 rounded-xl p-4 grid grid-cols-3 gap-4">
              {[
                { label: 'Transfers Total', value: route.transfers_total.toLocaleString('pt-BR') },
                { label: 'Este mês', value: route.transfers_this_month },
                { label: 'Ticket Médio', value: `R$ ${route.avg_ticket.toFixed(0)}` },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-xl font-semibold text-white">{stat.value}</p>
                  <p className="text-[9px] text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rota / Origem & Destino ── */}
          <div id="rdr-rota">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-map-pin-line"></i> Origem &amp; Destino
            </h3>

            {/* Map placeholder */}
            <div className="relative bg-sand-50 border border-sand-200 rounded-xl overflow-hidden mb-4" style={{ height: 160 }}>
              {/* Grid background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(rgba(100,120,140,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,120,140,0.3) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}></div>
              </div>

              {/* Route SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 160" preserveAspectRatio="none">
                <defs>
                  <marker id="rdr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#14b8a6" />
                  </marker>
                </defs>
                <path
                  d="M 80,120 C 180,40 340,40 440,120"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#rdr-arrow)"
                />
              </svg>

              {/* Origin marker */}
              <div className="absolute left-14 bottom-8 flex flex-col items-center">
                <div className="bg-white border-2 border-teal-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                </div>
                <div className="bg-white border border-sand-200 rounded-lg px-2 py-0.5 mt-1 max-w-[100px]">
                  <p className="text-[8px] font-semibold text-navy-700 text-center leading-tight truncate">{route.origin_name}</p>
                </div>
              </div>

              {/* Destination marker */}
              <div className="absolute right-14 bottom-8 flex flex-col items-center">
                <div className="bg-white border-2 border-navy-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-navy-500"></div>
                </div>
                <div className="bg-white border border-sand-200 rounded-lg px-2 py-0.5 mt-1 max-w-[100px]">
                  <p className="text-[8px] font-semibold text-navy-700 text-center leading-tight truncate">{route.destination_name}</p>
                </div>
              </div>

              {/* Distance / duration chip */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span className="bg-white/90 border border-sand-200 rounded-lg px-2 py-1 text-[9px] font-semibold text-navy-700">
                  {route.distance_km} km
                </span>
                <span className="bg-white/90 border border-sand-200 rounded-lg px-2 py-1 text-[9px] font-semibold text-navy-700">
                  {durationLabel}
                </span>
              </div>
            </div>

            {/* Origin & Destination details */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-100 border border-teal-300 flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">Origem</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{route.origin_name}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5 leading-relaxed">{route.origin_detail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-navy-100 border border-navy-300 flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-navy-600"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">Destino</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{route.destination_name}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5 leading-relaxed">{route.destination_detail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Operação de Hoje ── */}
          <div id="rdr-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-car-line"></i> Operação de Hoje ({route.transfers_today})
            </h3>
            {route.today_transfers.length === 0 ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-center">
                <i className="ri-calendar-check-line text-navy-300 text-xl block mb-2"></i>
                <p className="text-xs text-navy-500 font-medium">
                  {route.status === 'paused' ? 'Rota pausada — sem operação hoje' : 'Sem transfers nesta rota hoje'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {route.today_transfers.map((t) => {
                  const ts = tripStatusConfig[t.status] ?? tripStatusConfig.scheduled;
                  const dt = new Date(t.scheduled_at);
                  return (
                    <div key={t.id} className="flex items-center gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ts.dot} ${t.status === 'in_progress' || t.status === 'delayed' ? 'animate-pulse' : ''}`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono font-bold text-navy-700">{t.reference}</p>
                          <p className="text-[10px] text-navy-400">
                            {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-[10px] text-navy-500 truncate mt-0.5">{t.driver_name} · {t.vehicle_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[9px] font-medium text-navy-500">{ts.label}</p>
                        <p className="text-[9px] text-navy-400 flex items-center gap-0.5 mt-0.5 justify-end">
                          <i className="ri-group-line text-[9px]"></i>{t.pax} pax
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Operational load */}
            <div className="mt-4 bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">Carga operacional</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Hoje', value: route.transfers_today },
                  { label: 'Este mês', value: route.transfers_this_month },
                  { label: 'Total', value: route.transfers_total.toLocaleString('pt-BR') },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-lg font-semibold text-navy-800">{s.value}</p>
                    <p className="text-[9px] text-navy-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-sand-200 space-y-1.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-navy-400">Ocupação média</span>
                  <span className={`font-semibold ${route.avg_occupancy_pct >= 80 ? 'text-amber-600' : 'text-teal-600'}`}>
                    {route.avg_occupancy_pct}%
                  </span>
                </div>
                <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${route.avg_occupancy_pct >= 80 ? 'bg-amber-400' : 'bg-teal-500'}`}
                    style={{ width: `${route.avg_occupancy_pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recursos ── */}
          <div id="rdr-recursos">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-steering-2-line"></i> Veículos &amp; Motoristas
            </h3>

            {/* Preferred vehicles */}
            <div className="mb-3">
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-2">Veículos preferidos</p>
              <div className="flex flex-wrap gap-2">
                {route.preferred_vehicle_types.map((v) => (
                  <div key={v} className="flex items-center gap-1.5 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2">
                    <i className="ri-car-line text-navy-400 text-xs"></i>
                    <span className="text-xs font-medium text-navy-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Associated drivers */}
            <div>
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-2">
                Motoristas associados ({route.associated_drivers.length})
              </p>
              {route.associated_drivers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-800">Sem motoristas associados</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Associe motoristas para facilitar a alocação de transfers.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {route.associated_drivers.map((d) => (
                    <div key={d} className="flex items-center gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5">
                      <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-navy-950 text-white text-[10px] font-bold flex-shrink-0">
                        {d.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-xs font-medium text-navy-700 flex-1">{d}</p>
                      <i className="ri-arrow-right-s-line text-navy-300 text-sm"></i>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Financeiro ── */}
          <div id="rdr-financeiro">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-money-dollar-circle-line"></i> Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: 'Preço Base', value: `R$ ${route.base_price.toFixed(2)}`, icon: 'ri-price-tag-3-line', accent: false },
                { label: 'Ticket Médio', value: `R$ ${route.avg_ticket.toFixed(2)}`, icon: 'ri-ticket-line', accent: false },
                { label: 'Receita do Mês', value: `R$ ${route.revenue_this_month.toLocaleString('pt-BR')}`, icon: 'ri-calendar-check-line', accent: true },
                { label: 'Receita Total', value: `R$ ${(route.revenue_total / 1000).toFixed(1)}k`, icon: 'ri-bar-chart-2-line', accent: true },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-3 ${item.accent ? 'bg-teal-50 border-teal-100' : 'bg-sand-50 border-sand-200'}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <i className={`${item.icon} text-xs ${item.accent ? 'text-teal-600' : 'text-navy-400'}`}></i>
                    <p className="text-[9px] text-navy-400 uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className={`text-sm font-bold ${item.accent ? 'text-teal-700' : 'text-navy-800'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Receita mensal histórico */}
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-3">Receita mensal</p>
              <div className="space-y-2">
                {route.monthly_history.map((h) => {
                  const maxRev = Math.max(...route.monthly_history.map((m) => m.revenue), 1);
                  const pct = Math.round((h.revenue / maxRev) * 100);
                  return (
                    <div key={h.period} className="flex items-center gap-3">
                      <span className="text-[10px] text-navy-500 w-16 flex-shrink-0">{h.period}</span>
                      <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 w-20 text-right flex-shrink-0">
                        R$ {(h.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Histórico ── */}
          <div id="rdr-historico">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-bar-chart-line"></i> Histórico Operacional
            </h3>
            <div className="space-y-2">
              {route.monthly_history.map((h) => (
                <div key={h.period} className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-navy-700">{h.period}</p>
                    <span className="text-[10px] font-bold text-teal-700">R$ {h.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-sm font-bold text-navy-800">{h.transfers}</p>
                      <p className="text-[9px] text-navy-400">Transfers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-navy-800">{h.avg_pax}</p>
                      <p className="text-[9px] text-navy-400">Pax Médio</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${h.avg_occupancy >= 75 ? 'text-teal-600' : 'text-navy-800'}`}>{h.avg_occupancy}%</p>
                      <p className="text-[9px] text-navy-400">Ocupação</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-sand-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${h.avg_occupancy}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-3 bg-navy-950 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-wider">Receita (histórico)</p>
                <p className="font-serif text-xl font-semibold text-white mt-0.5">
                  R$ {(totalRevenue / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[9px] uppercase tracking-wider">Transfers (histórico)</p>
                <p className="font-serif text-xl font-semibold text-white mt-0.5">{totalTransfersHistory}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sand-200 flex-shrink-0 bg-sand-50/60">
          <div className="flex gap-2 mb-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Editar Rota
            </button>
            <button
              type="button"
              onClick={() => { onCreateTransfer?.(route.id); onClose(); }}
              className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Criar Transfer
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Ver Reservas
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-colors cursor-pointer border whitespace-nowrap ${
                route.is_active
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
              }`}
            >
              {route.is_active ? 'Pausar Rota' : 'Reativar Rota'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}