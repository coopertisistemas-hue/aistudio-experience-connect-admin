const driverFeatures = [
  { icon: 'ri-calendar-2-line', label: 'Agenda do Motorista', desc: 'Visualize todos os transfers do dia com detalhes completos' },
  { icon: 'ri-route-line', label: 'Rotas e Navegação', desc: 'Rotas otimizadas com navegação integrada e pontos de parada' },
  { icon: 'ri-user-2-line', label: 'Dados dos Passageiros', desc: 'Preferências, histórico e informações de contato em tempo real' },
  { icon: 'ri-checkbox-circle-line', label: 'Check-in Operacional', desc: 'Confirmação de embarque e atualização de status instantânea' },
];

function DriverPhoneMockup() {
  return (
    <div className="relative mx-auto w-64 md:w-72">
      {/* Phone Frame */}
      <div className="relative bg-navy-950 rounded-[2.5rem] p-3 border-4 border-navy-800">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-navy-950 rounded-full z-10"></div>

        {/* Screen */}
        <div className="relative bg-navy-900 rounded-[2rem] overflow-hidden" style={{ height: '560px' }}>
          {/* Header */}
          <div className="bg-navy-950 px-5 pt-9 pb-4 border-b border-white/8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white/40 text-xs">Bom dia,</div>
                <div className="text-white text-sm font-semibold">Carlos Silva</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="text-teal-400 text-xs font-medium">Online</span>
              </div>
            </div>
            {/* Today summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/6 rounded-xl p-3 border border-white/8">
                <div className="text-white/40 text-xs mb-1">Transfers hoje</div>
                <div className="text-white text-xl font-serif font-semibold">6</div>
              </div>
              <div className="bg-white/6 rounded-xl p-3 border border-white/8">
                <div className="text-white/40 text-xs mb-1">Próximo em</div>
                <div className="text-amber-400 text-xl font-serif font-semibold">14 min</div>
              </div>
            </div>
          </div>

          {/* Transfer List */}
          <div className="p-4 flex flex-col gap-2.5 overflow-hidden">
            <div className="text-white/35 text-xs uppercase tracking-widest font-medium mb-1">Agenda do Dia</div>

            {[
              {
                time: '08:30',
                from: 'Congonhas',
                to: 'Jardins Hotel',
                pax: '2 pax',
                status: 'Concluído',
                statusBg: 'bg-white/10 text-white/40',
                done: true,
              },
              {
                time: '10:15',
                from: 'GRU Terminal 2',
                to: 'Fasano SP',
                pax: '3 pax',
                status: 'Em Andamento',
                statusBg: 'bg-teal-500/20 text-teal-300',
                done: false,
              },
              {
                time: '13:00',
                from: 'Fasano SP',
                to: 'Tour Paulistano',
                pax: '4 pax',
                status: 'Próximo',
                statusBg: 'bg-amber-500/20 text-amber-300',
                done: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 ${
                  item.done
                    ? 'bg-white/3 border-white/6 opacity-50'
                    : 'bg-white/8 border-white/12'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-xs font-medium">{item.time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.statusBg}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                  <span className="truncate">{item.from}</span>
                  <i className="ri-arrow-right-line text-white/30 shrink-0"></i>
                  <span className="truncate">{item.to}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <i className="ri-user-line text-white/30 text-xs"></i>
                  <span className="text-white/35 text-xs">{item.pax}</span>
                </div>
              </div>
            ))}

            {/* Navigation CTA */}
            <div className="mt-1 bg-teal-600 rounded-xl p-3 flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-white text-xs font-semibold">Iniciar Navegação</div>
                <div className="text-white/70 text-xs">GRU Terminal 2 · 14 min</div>
              </div>
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                <i className="ri-navigation-line text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -left-6 top-1/3 bg-white rounded-xl px-3 py-2 border border-sand-200 animate-float hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-navigation-fill text-white text-xs"></i>
          </div>
          <div>
            <div className="text-navy-800 text-xs font-semibold">Em Rota</div>
            <div className="text-navy-400 text-xs">14 min restantes</div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl px-3 py-2 border border-sand-200 animate-float-delayed hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="ri-notification-3-line text-white text-xs"></i>
          </div>
          <div>
            <div className="text-navy-800 text-xs font-semibold">Novo transfer</div>
            <div className="text-navy-400 text-xs">13:00 · 4 pax</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverApp() {
  return (
    <section className="bg-white py-24 px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div>
            <span className="reveal-fade text-teal-600 text-xs font-semibold tracking-widest uppercase mb-4 block">
              Ecossistema · App do Motorista
            </span>
            <h2 className="reveal font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight mb-6">
              Motoristas Sempre
              <span className="italic text-amber-500 block">Conectados e Preparados</span>
            </h2>
            <p className="reveal delay-200 text-navy-500 text-base font-light leading-relaxed mb-10">
              O App do Motorista entrega toda a operação na palma da mão — agenda do dia,
              rotas otimizadas, dados dos passageiros, check-in digital e comunicação
              direta com a central. Operação eficiente, em tempo real.
            </p>

            {/* Features List */}
            <div className="flex flex-col gap-5 mb-10">
              {driverFeatures.map((feat, i) => (
                <div
                  key={feat.label}
                  className={`reveal delay-${(i + 2) * 100} flex items-start gap-4`}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sand-50 border border-sand-200 shrink-0 mt-0.5">
                    <i className={`${feat.icon} text-teal-600 text-base`}></i>
                  </div>
                  <div>
                    <div className="text-navy-800 text-sm font-semibold mb-0.5">{feat.label}</div>
                    <div className="text-navy-500 text-sm font-light">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="reveal delay-500 flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap">
                <i className="ri-apple-line text-base"></i>
                App Store
              </button>
              <button className="flex items-center justify-center gap-2.5 border border-navy-200 hover:border-navy-300 text-navy-800 text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap">
                <i className="ri-google-play-line text-base"></i>
                Google Play
              </button>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="reveal delay-300 flex justify-center lg:justify-end">
            <DriverPhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}