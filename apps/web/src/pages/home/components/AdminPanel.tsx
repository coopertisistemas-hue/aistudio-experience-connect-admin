const adminModules = [
  { icon: 'ri-calendar-check-line', title: 'Reservas', desc: 'Gestão completa de reservas e disponibilidade', color: 'teal' },
  { icon: 'ri-car-line', title: 'Transfers', desc: 'Coordenação e monitoramento de transfers', color: 'amber' },
  { icon: 'ri-sparkling-line', title: 'Experiências', desc: 'Catálogo e operação de experiências', color: 'teal' },
  { icon: 'ri-route-line', title: 'Rotas', desc: 'Planejamento e otimização de rotas', color: 'amber' },
  { icon: 'ri-steering-2-line', title: 'Motoristas', desc: 'Agenda, desempenho e comunicação', color: 'teal' },
  { icon: 'ri-car-fill', title: 'Veículos', desc: 'Frota, manutenção e disponibilidade', color: 'amber' },
  { icon: 'ri-checkbox-circle-line', title: 'Check-ins', desc: 'Controle operacional de embarques', color: 'teal' },
  { icon: 'ri-secure-payment-line', title: 'Pagamentos', desc: 'Faturamento, recebimentos e conciliação', color: 'amber' },
  { icon: 'ri-building-line', title: 'Parceiros', desc: 'Hotéis, pousadas e operadoras', color: 'teal' },
];

const liveItems = [
  {
    icon: 'ri-car-line',
    iconBg: 'bg-teal-500/15 border-teal-500/25',
    iconColor: 'text-teal-400',
    label: 'Transfer Ativo',
    value: 'GRU → Itaim',
    badge: 'Em Andamento',
    badgeBg: 'bg-teal-500/20 text-teal-300',
    sub: 'Carlos Silva · Mercedes E300',
  },
  {
    icon: 'ri-calendar-check-line',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    iconColor: 'text-amber-400',
    label: 'Nova Reserva',
    value: 'Tour Chapada — 4 pax',
    badge: 'Confirmada',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    sub: 'Check-in amanhã 08:00',
  },
  {
    icon: 'ri-notification-3-line',
    iconBg: 'bg-white/8 border-white/12',
    iconColor: 'text-white/60',
    label: 'Alerta Operacional',
    value: 'Rota 7 — atraso 8 min',
    badge: 'Atenção',
    badgeBg: 'bg-white/10 text-white/50',
    sub: 'Motorista notificado',
  },
];

function AdminMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Main panel frame */}
      <div className="bg-navy-950 rounded-2xl border border-white/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <i className="ri-compass-3-line text-amber-400 text-xs"></i>
            </div>
            <span className="text-white text-xs font-semibold">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-teal-400 text-xs font-medium">Operação ao vivo</span>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/8">
          {[
            { label: 'Transfers Hoje', value: '24', icon: 'ri-car-line', color: 'text-teal-400' },
            { label: 'Reservas Ativas', value: '138', icon: 'ri-calendar-check-line', color: 'text-amber-400' },
            { label: 'Motoristas Online', value: '18', icon: 'ri-steering-2-line', color: 'text-white/70' },
          ].map((s) => (
            <div key={s.label} className="bg-navy-950 px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <i className={`${s.icon} text-xs ${s.color}`}></i>
                <span className="text-white/40 text-xs">{s.label}</span>
              </div>
              <span className={`text-2xl font-serif font-semibold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Live feed */}
        <div className="p-4 flex flex-col gap-2.5">
          <div className="text-white/35 text-xs uppercase tracking-widest mb-1 font-medium">Atividade em Tempo Real</div>
          {liveItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl p-3">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg border ${item.iconBg} shrink-0`}>
                <i className={`${item.icon} text-sm ${item.iconColor}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/55 text-xs">{item.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.badgeBg} whitespace-nowrap`}>
                    {item.badge}
                  </span>
                </div>
                <div className="text-white text-sm font-semibold truncate">{item.value}</div>
                <div className="text-white/35 text-xs truncate">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating module badge */}
      <div className="absolute -right-5 top-1/3 bg-white rounded-xl px-4 py-3 border border-sand-200 animate-float hidden lg:block">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <i className="ri-building-line text-teal-600 text-sm"></i>
          </div>
          <div>
            <div className="text-navy-900 text-xs font-semibold">340+ Parceiros</div>
            <div className="text-navy-400 text-xs">ativos na plataforma</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <section className="bg-sand-50 py-24 px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Mockup */}
          <div className="reveal delay-200 flex justify-center lg:justify-start order-2 lg:order-1">
            <AdminMockup />
          </div>

          {/* Right — Content */}
          <div className="order-1 lg:order-2">
            <span className="reveal-fade text-teal-600 text-xs font-semibold tracking-widest uppercase mb-4 block">
              Ecossistema · Painel Administrativo
            </span>
            <h2 className="reveal font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight mb-6">
              Controle Total da
              <span className="italic text-amber-500 block">Operação em Tempo Real</span>
            </h2>
            <p className="reveal delay-200 text-navy-500 text-base font-light leading-relaxed mb-10">
              O Painel Admin reúne toda a operação em uma interface elegante — reservas,
              transfers, motoristas, veículos e parceiros — coordenados em tempo real
              com visibilidade completa da jornada de cada hóspede.
            </p>

            {/* Module Grid */}
            <div className="reveal delay-300 grid grid-cols-3 gap-3 mb-10">
              {adminModules.map((mod) => (
                <div
                  key={mod.title}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-sand-200 hover:border-teal-200 transition-all duration-200 cursor-default"
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${
                    mod.color === 'teal' ? 'bg-teal-50' : 'bg-amber-50'
                  }`}>
                    <i className={`${mod.icon} text-base ${
                      mod.color === 'teal' ? 'text-teal-600' : 'text-amber-600'
                    }`}></i>
                  </div>
                  <span className="text-navy-800 text-xs font-semibold text-center leading-tight">{mod.title}</span>
                </div>
              ))}
            </div>

            <div className="reveal delay-400 flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap">
                <i className="ri-dashboard-3-line text-base"></i>
                Ver Painel Admin
              </button>
              <button className="flex items-center justify-center gap-2 border border-navy-200 hover:border-teal-300 text-navy-700 hover:text-teal-700 text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap">
                Agendar Demonstração
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}