const appFeatures = [
  { icon: 'ri-map-2-line', label: 'Rastreamento de Transfer ao Vivo' },
  { icon: 'ri-notification-3-line', label: 'Notificações Instantâneas ao Hóspede' },
  { icon: 'ri-calendar-line', label: 'Gestão de Reservas e Itinerários' },
  { icon: 'ri-secure-payment-line', label: 'Pagamento Integrado e Seguro' },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-72 md:w-80">
      {/* Phone Frame */}
      <div className="relative bg-navy-950 rounded-[2.5rem] p-3 border-4 border-navy-800">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-navy-950 rounded-full z-10"></div>

        {/* Screen */}
        <div className="relative bg-sand-50 rounded-[2rem] overflow-hidden" style={{ height: '580px' }}>
          {/* Status Bar */}
          <div className="bg-navy-900 px-6 pt-8 pb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-xs">9:41</span>
              <div className="flex items-center gap-1">
                <i className="ri-wifi-line text-white/50 text-xs"></i>
                <i className="ri-battery-line text-white/50 text-xs"></i>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                <i className="ri-compass-3-line text-amber-400 text-xs"></i>
              </div>
              <div>
                <div className="text-white text-xs font-semibold">Experience Connect</div>
                <div className="text-white/40 text-xs">Painel do Hóspede</div>
              </div>
            </div>
            {/* Active Transfer Card */}
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs">Transfer Ativo</span>
                <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Ao Vivo</span>
              </div>
              <div className="text-white font-semibold text-sm">Congonhas → Jardins</div>
              <div className="text-white/50 text-xs mt-1">Mercedes E-Class · chega em 12 min</div>
              {/* Progress Bar */}
              <div className="mt-3 bg-white/10 rounded-full h-1.5">
                <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bg-sand-50 px-4 py-4 flex flex-col gap-3">
            <div className="text-navy-800 text-xs font-semibold tracking-wide mb-1">Próximos</div>

            {[
              { icon: 'ri-flight-takeoff-line', title: 'Transfer GRU', time: 'Amanhã 06:30', color: 'bg-teal-50 text-teal-600' },
              { icon: 'ri-map-pin-line', title: 'Tour em Paraty', time: '22 Dez · 09:00', color: 'bg-amber-50 text-amber-600' },
              { icon: 'ri-hotel-bed-line', title: 'Check-in na Pousada', time: '22 Dez · 14:00', color: 'bg-sand-100 text-navy-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-sand-200">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.color}`}>
                  <i className={`${item.icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-navy-800 text-xs font-semibold truncate">{item.title}</div>
                  <div className="text-navy-400 text-xs">{item.time}</div>
                </div>
                <i className="ri-arrow-right-s-line text-navy-300 text-sm"></i>
              </div>
            ))}

            {/* Rating Prompt */}
            <div className="bg-navy-900 rounded-xl p-3 mt-1">
              <div className="text-white text-xs font-semibold mb-1">Avalie sua experiência</div>
              <div className="text-white/50 text-xs mb-2">Tour nas Montanhas de Gramado · 19 Dez</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <i key={s} className="ri-star-fill text-amber-400 text-base"></i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute -right-4 top-1/4 bg-white rounded-xl px-3 py-2 border border-sand-200 animate-float">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-white text-xs"></i>
          </div>
          <div>
            <div className="text-navy-800 text-xs font-semibold">Confirmado</div>
            <div className="text-navy-400 text-xs">Reserva instantânea</div>
          </div>
        </div>
      </div>

      {/* Floating Badge 2 */}
      <div className="absolute -left-4 bottom-1/4 bg-white rounded-xl px-3 py-2 border border-sand-200 animate-float-delayed">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="ri-star-fill text-white text-xs"></i>
          </div>
          <div>
            <div className="text-navy-800 text-xs font-semibold">4,9 de avaliação</div>
            <div className="text-navy-400 text-xs">2.400+ avaliações</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileExperience() {
  return (
    <section className="bg-sand-100 py-24 px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="reveal-fade text-teal-600 text-xs font-semibold tracking-widest uppercase mb-4 block">
              Ecossistema · App do Hóspede
            </span>
            <h2 className="reveal font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight mb-6">
              Seus Hóspedes Merecem
              <span className="italic text-amber-500 block">Jornadas Impecáveis</span>
            </h2>
            <p className="reveal delay-200 text-navy-500 text-base font-light leading-relaxed mb-10">
              O App do Hóspede oferece visibilidade e controle total da jornada — rastreamento
              ao vivo, confirmações instantâneas, gestão de itinerário, pagamentos integrados
              e comunicação direta com a equipe de operações.
            </p>

            {/* Features List */}
            <div className="flex flex-col gap-4">
              {appFeatures.map((feat, i) => (
                <div
                  key={feat.label}
                  className={`reveal delay-${(i + 2) * 100} flex items-center gap-4`}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-sand-200 shrink-0">
                    <i className={`${feat.icon} text-teal-600 text-base`}></i>
                  </div>
                  <span className="text-navy-700 text-sm font-medium">{feat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="reveal delay-500 mt-10 flex flex-col sm:flex-row gap-4">
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
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}