const testimonials = [
  {
    quote:
      'A Experience Connect transformou nossa operação de transfers. A satisfação dos hóspedes subiu 32% e nossa equipe gasta 60% menos tempo em coordenação.',
    author: 'Mariana Câmara',
    role: 'Diretora de Operações',
    company: 'Fera Palace Hotel',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20hospitality%20hotel%20director%20elegant%20confident%20warm%20smile%20Brazilian%20woman%2030s%20professional%20headshot%20clean%20white%20background&width=120&height=120&seq=20&orientation=squarish',
    rating: 5,
  },
  {
    quote:
      'Nossos hóspedes adoram ter tudo em um só app — do transfer do aeroporto aos tours de vinhos. A plataforma é intuitiva e nossos parceiros amam as integrações.',
    author: 'Rafael Mendonça',
    role: 'Gerente Geral',
    company: 'Txai Resort Itacaré',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20resort%20hotel%20manager%20confident%20Brazilian%20man%2040s%20professional%20headshot%20clean%20white%20background%20warm%20smile&width=120&height=120&seq=21&orientation=squarish',
    rating: 5,
  },
  {
    quote:
      'Integramos 8 propriedades de luxo à Experience Connect em 6 meses. Só a coordenação de rotas nos economiza centenas de horas por semana.',
    author: 'Lucia Fonseca',
    role: 'Diretora de Turismo',
    company: 'Grupo Fasano',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20tourism%20director%20elegant%20Brazilian%20woman%2040s%20professional%20headshot%20clean%20white%20background%20confident%20warm%20expression&width=120&height=120&seq=22&orientation=squarish',
    rating: 5,
  },
];

const partners = [
  { name: 'Hotéis', icon: 'ri-building-line', count: '240+' },
  { name: 'Pousadas', icon: 'ri-home-heart-line', count: '85+' },
  { name: 'Operadoras de Turismo', icon: 'ri-compass-discover-line', count: '60+' },
  { name: 'Provedores de Experiência', icon: 'ri-sparkling-line', count: '130+' },
  { name: 'Agências de Turismo', icon: 'ri-global-line', count: '45+' },
];

export default function HospitalityPartners() {
  return (
    <section id="partners" className="bg-white py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="reveal-fade text-teal-600 text-xs font-semibold tracking-widest uppercase mb-3 block">
            Ecossistema de Parceiros
          </span>
          <h2 className="reveal font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight mb-5">
            Confiado pelo Melhor da
            <span className="italic text-amber-500 block">Hospitalidade Brasileira</span>
          </h2>
          <p className="reveal delay-200 text-navy-500 text-sm font-light leading-relaxed">
            De pousadas boutique a grupos hoteleiros de renome internacional —
            nossa plataforma opera nas melhores propriedades de hospitalidade do Brasil.
          </p>
        </div>

        {/* Partner Ecosystem Pills */}
        <div className="reveal flex flex-wrap justify-center gap-3 mb-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-sand-200 bg-sand-50 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 cursor-default"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-sand-200">
                <i className={`${partner.icon} text-teal-600 text-sm`}></i>
              </div>
              <span className="text-navy-700 text-sm font-medium">{partner.name}</span>
              <span className="text-teal-600 text-xs font-semibold">{partner.count}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.author}
              className={`reveal delay-${i * 200} relative bg-sand-50 border border-sand-200 rounded-2xl p-7 flex flex-col`}
            >
              {/* Quote Mark */}
              <div className="font-serif text-6xl leading-none text-sand-300 mb-4 select-none">&ldquo;</div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <i key={s} className="ri-star-fill text-amber-400 text-sm"></i>
                ))}
              </div>

              {/* Quote */}
              <p className="text-navy-700 text-sm font-light leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-sand-200">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-sand-200">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-navy-900 text-sm font-semibold">{t.author}</div>
                  <div className="text-navy-400 text-xs">{t.role}</div>
                  <div className="text-teal-600 text-xs font-medium mt-0.5">{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logo Strip */}
        <div className="reveal mt-14 py-8 border-y border-sand-200">
          <p className="text-center text-navy-400 text-xs tracking-widest uppercase mb-7 font-medium">
            Confiado pelas melhores propriedades do Brasil
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              'Fera Palace', 'Txai Resort', 'Grupo Fasano', 'Pousada do Toque',
              'Insólito Boutique', 'Kenoa Resort', 'Nannai Resort',
            ].map((name) => (
              <span
                key={name}
                className="font-serif text-navy-300 text-sm md:text-base font-medium tracking-wide select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}