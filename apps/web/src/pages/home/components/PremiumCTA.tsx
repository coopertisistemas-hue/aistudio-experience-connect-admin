import { useNavigate } from 'react-router-dom';

export default function PremiumCTA() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="bg-sand-50 py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main CTA Block */}
        <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[540px]">
          {/* Left — Image Side */}
          <div className="relative overflow-hidden min-h-[320px] lg:min-h-0">
            <img
              src="https://readdy.ai/api/search-image?query=aerial%20view%20stunning%20luxury%20coastal%20resort%20infinity%20pool%20with%20breathtaking%20ocean%20panorama%20lush%20tropical%20vegetation%20pristine%20white%20beach%20crystal%20turquoise%20water%20premium%20Brazilian%20destination%20birds%20eye%20golden%20hour%20photography&width=900&height=700&seq=8&orientation=portrait"
              alt="Destino premium de hospitalidade e turismo de luxo"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-transparent to-navy-950/60 lg:bg-gradient-to-r lg:from-transparent lg:to-navy-950/20"></div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <i className="ri-compass-3-line text-white text-xs"></i>
                </div>
                <span className="text-white/70 text-xs font-medium tracking-wide">Experience Connect</span>
              </div>
              <div>
                <h3 className="font-serif text-3xl lg:text-4xl font-semibold text-white leading-tight max-w-xs">
                  Onde Cada Jornada
                  <span className="italic text-amber-300 block">Torna-se Extraordinária</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Right — Content Side */}
          <div className="bg-navy-950 flex flex-col items-center justify-center text-center p-10 lg:p-14">
            <div className="max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-medium mb-7 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Gratuito por 30 dias · Sem cartão
              </span>

              <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-white leading-tight mb-5">
                Pronto para Transformar Sua
                <span className="italic text-amber-400 block">Operação?</span>
              </h2>

              <p className="text-white/55 text-sm font-light leading-relaxed mb-10">
                Junte-se a 340+ líderes em hospitalidade que confiam na Experience Connect
                para orquestrar transfers premium, tours privativos e jornadas de hóspedes —
                com escala, elegância e excelência operacional.
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Iniciar Minha Jornada
                  <i className="ri-arrow-right-line text-base"></i>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Agendar uma Demonstração
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex justify-center gap-6 mt-8 pt-7 border-t border-white/10">
                {[
                  { icon: 'ri-shield-check-line', label: 'Segurança Enterprise' },
                  { icon: 'ri-customer-service-2-line', label: 'Suporte 24/7' },
                  { icon: 'ri-global-line', label: 'Multilíngue' },
                ].map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 border border-white/12">
                      <i className={`${badge.icon} text-teal-400 text-sm`}></i>
                    </div>
                    <span className="text-white/40 text-xs text-center leading-tight">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary CTA Row */}
        <div className="reveal mt-8 flex flex-col md:flex-row gap-5">
          {[
            {
              icon: 'ri-calendar-check-line',
              title: 'Teste Gratuito por 30 Dias',
              desc: 'Acesso completo à plataforma, sem compromisso.',
              cta: 'Começar Gratuitamente',
              ctaStyle: 'bg-teal-600 hover:bg-teal-500 text-white',
            },
            {
              icon: 'ri-presentation-line',
              title: 'Demonstração ao Vivo',
              desc: 'Veja a plataforma em ação com nossos especialistas em hospitalidade.',
              cta: 'Agendar Demo',
              ctaStyle: 'border border-navy-200 hover:border-teal-300 text-navy-700 hover:text-teal-600',
            },
            {
              icon: 'ri-headphone-line',
              title: 'Fale com Vendas',
              desc: 'Planos personalizados para grupos e múltiplas propriedades.',
              cta: 'Entrar em Contato',
              ctaStyle: 'border border-navy-200 hover:border-navy-300 text-navy-700 hover:text-navy-900',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className={`flex-1 bg-white border border-sand-200 rounded-2xl p-7 flex flex-col gap-4 reveal delay-${i * 200}`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sand-50 border border-sand-200">
                <i className={`${card.icon} text-teal-600 text-base`}></i>
              </div>
              <div>
                <h4 className="text-navy-900 font-semibold text-base mb-1">{card.title}</h4>
                <p className="text-navy-400 text-sm font-light">{card.desc}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className={`mt-auto text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap self-start ${card.ctaStyle}`}
              >
                {card.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}