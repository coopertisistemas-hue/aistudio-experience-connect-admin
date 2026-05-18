import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { value: '12.400+', label: 'Transfers Realizados' },
  { value: '98,3%', label: 'Satisfação dos Hóspedes' },
  { value: '340+', label: 'Hotéis Parceiros' },
];

const floatingCards = [
  {
    icon: 'ri-car-line',
    title: 'Transfer em Andamento',
    subtitle: 'GRU → Trancoso',
    badge: 'Ativo',
    badgeColor: 'bg-teal-500',
    detail: '2 hóspedes · SUV Executivo',
    position: 'left-8 top-1/3 xl:left-16',
  },
  {
    icon: 'ri-hotel-line',
    title: 'Reserva Confirmada',
    subtitle: 'Fera Palace Hotel',
    badge: 'Confirmado',
    badgeColor: 'bg-amber-500',
    detail: 'Check-in amanhã 14:00',
    position: 'right-8 top-1/4 xl:right-16',
  },
  {
    icon: 'ri-map-pin-line',
    title: 'Rota Otimizada',
    subtitle: 'Chapada Diamantina',
    badge: 'Em Rota',
    badgeColor: 'bg-teal-400',
    detail: '4 hóspedes · Tour Privativo',
    position: 'right-8 bottom-1/3 xl:right-16',
  },
];

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=cinematic%20aerial%20view%20of%20sleek%20luxury%20transfer%20vehicle%20arriving%20at%20stunning%20coastal%20resort%20entrance%20golden%20hour%20warm%20light%20premium%20hospitality%20setting%20lush%20tropical%20vegetation%20dramatic%20ocean%20backdrop%20elegant%20architecture%20five%20star%20property&width=1920&height=1080&seq=1&orientation=landscape"
          alt="Plataforma premium de transfers e experiências turísticas"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-900/50 to-navy-950/75"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/40 via-transparent to-navy-900/30"></div>
      </div>

      {/* Floating Decorative Orbs */}
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-32 left-1/3 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none"></div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 w-full">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="text-white/85 text-xs font-medium tracking-widest uppercase">
            Plataforma Premium de Hospitalidade
          </span>
        </div>

        {/* Main Title */}
        <h1
          className={`font-serif text-white leading-tight mb-6 transition-all duration-700 delay-100 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="block text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
            Gerencie Transfers,
          </span>
          <span className="block text-5xl md:text-6xl lg:text-7xl font-light italic text-amber-300 mt-1">
            Experiências e Jornadas
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-white/70 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-10 transition-all duration-700 delay-200 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Uma plataforma integrada para operações de turismo premium — conectando
          hóspedes, motoristas e parceiros em um ecossistema operacional completo.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 items-center transition-all duration-700 delay-300 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={() => navigate('/login')}
            className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-8 py-3.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap min-w-[180px]"
          >
            Explorar Transfers
          </button>
          <button
            onClick={() => navigate('/login')}
            className="border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-medium text-sm px-8 py-3.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap min-w-[180px]"
          >
            Reservar Experiência
          </button>
        </div>

        {/* Stats Row */}
        <div
          className={`flex flex-wrap justify-center gap-8 md:gap-12 mt-14 transition-all duration-700 delay-500 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-serif font-semibold text-white">{stat.value}</div>
              <div className="text-white/55 text-xs font-medium tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Operational Cards */}
      {floatingCards.map((card, i) => (
        <div
          key={i}
          className={`absolute ${card.position} hidden lg:block z-20 glass-card rounded-2xl p-4 min-w-[220px] animate-float transition-all duration-700`}
          style={{ animationDelay: `${i * 1.5}s`, opacity: loaded ? 1 : 0, transitionDelay: `${600 + i * 150}ms` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15">
              <i className={`${card.icon} text-white text-base`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{card.title}</div>
              <div className="text-white/60 text-xs truncate">{card.subtitle}</div>
            </div>
            <span className={`${card.badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap`}>
              {card.badge}
            </span>
          </div>
          <div className="text-white/50 text-xs pl-12">{card.detail}</div>
        </div>
      ))}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce opacity-60">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/60"></div>
        <i className="ri-arrow-down-line text-white text-sm"></i>
      </div>
    </section>
  );
}