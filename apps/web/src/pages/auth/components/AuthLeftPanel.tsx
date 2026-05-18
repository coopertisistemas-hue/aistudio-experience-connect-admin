const overlayItems = [
  {
    icon: 'ri-car-line',
    label: 'Transfer em Andamento',
    detail: 'GRU → Trancoso · SUV Executivo',
    badge: 'Ativo',
    badgeColor: 'bg-teal-500',
  },
  {
    icon: 'ri-hotel-line',
    label: 'Reserva Confirmada',
    detail: 'Fera Palace Hotel · Check-in 14:00',
    badge: 'Confirmado',
    badgeColor: 'bg-amber-500',
  },
  {
    icon: 'ri-map-pin-2-line',
    label: 'Rota Coordenada',
    detail: 'Chapada Diamantina · 4 hóspedes',
    badge: 'Em Rota',
    badgeColor: 'bg-teal-400',
  },
];

export default function AuthLeftPanel() {
  return (
    <div className="relative flex-1 hidden lg:flex flex-col overflow-hidden bg-navy-950">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=cinematic%20luxury%20private%20transfer%20vehicle%20at%20sunrise%20on%20scenic%20coastal%20road%20winding%20cliffs%20golden%20ocean%20light%20premium%20travel%20atmosphere%20elegant%20sophisticated%20mood%20soft%20bokeh%20wide%20angle%20dramatic%20natural%20lighting&width=1080&height=1400&seq=auth1&orientation=portrait"
          alt="Plataforma premium de transfers e experiências"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/30 via-transparent to-transparent"></div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none"></div>

      {/* Logo top left */}
      <div className="relative z-10 p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <i className="ri-compass-3-line text-amber-400 text-base"></i>
          </div>
          <div>
            <span className="font-serif font-semibold text-white text-lg leading-tight block">Experience Connect</span>
            <span className="text-white/50 text-xs tracking-widest uppercase font-sans">Transfers & Experiences</span>
          </div>
        </div>
      </div>

      {/* Center quote */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
        <blockquote className="max-w-sm">
          <p className="font-serif text-3xl lg:text-4xl font-light text-white leading-snug mb-5">
            Cada jornada começa com uma{' '}
            <span className="italic text-amber-300 font-normal">experiência</span>{' '}
            impecável.
          </p>
          <p className="text-white/50 text-sm font-sans font-light leading-relaxed">
            Plataforma integrada para operações de turismo premium — conectando
            hóspedes, motoristas e parceiros em um ecossistema operacional completo.
          </p>
        </blockquote>
      </div>

      {/* Floating Operational Cards */}
      <div className="relative z-10 px-10 pb-10 flex flex-col gap-3">
        <div className="text-white/30 text-xs tracking-widest uppercase font-sans mb-1">
          Operações ao Vivo
        </div>
        {overlayItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 transition-all duration-300 hover:bg-white/12"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
              <i className={`${item.icon} text-white text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{item.label}</div>
              <div className="text-white/45 text-xs truncate">{item.detail}</div>
            </div>
            <span className={`${item.badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0`}>
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}