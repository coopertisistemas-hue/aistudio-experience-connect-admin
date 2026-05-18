const categories = [
  {
    title: 'Transfers Aeroportuários',
    description: 'Chegadas e partidas impecáveis com veículos premium e motoristas profissionais certificados.',
    image: 'https://readdy.ai/api/search-image?query=luxury%20executive%20SUV%20vehicle%20at%20modern%20international%20airport%20terminal%20glass%20architecture%20evening%20warm%20lighting%20premium%20transfer%20service%20elegant%20black%20car%20awaiting%20passengers%20professional%20chauffeur&width=800&height=600&seq=2&orientation=landscape',
    tag: 'Mais Reservado',
    tagIcon: 'ri-star-line',
    dark: true,
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Tours Privativos',
    description: 'Roteiros exclusivos pelos destinos mais deslumbrantes do Brasil com guias especializados.',
    image: 'https://readdy.ai/api/search-image?query=scenic%20private%20tour%20van%20driving%20along%20lush%20coastal%20road%20golden%20hour%20dramatic%20ocean%20cliffs%20tropical%20vegetation%20beautiful%20Brazilian%20coastline%20premium%20tourism%20vehicle%20winding%20scenic%20route&width=600&height=400&seq=3&orientation=landscape',
    tag: 'Exclusivo',
    tagIcon: 'ri-vip-crown-line',
    dark: false,
    span: '',
  },
  {
    title: 'Rotas de Vinhos',
    description: 'Descubra vinícolas premium com guias especializados e degustações selecionadas.',
    image: 'https://readdy.ai/api/search-image?query=scenic%20wine%20route%20through%20lush%20green%20vineyard%20rows%20vehicle%20driving%20elegant%20wine%20country%20estate%20golden%20afternoon%20light%20grapes%20rows%20beautiful%20countryside%20rolling%20hills%20premium%20tour&width=600&height=400&seq=4&orientation=landscape',
    tag: 'Premium',
    tagIcon: 'ri-goblet-line',
    dark: false,
    span: '',
  },
  {
    title: 'Experiências na Montanha',
    description: 'Aventuras nas serras com veículos de luxo e guias locais experientes.',
    image: 'https://readdy.ai/api/search-image?query=luxury%204x4%20vehicle%20in%20dramatic%20mountain%20landscape%20Chapada%20Diamantina%20Brazil%20dramatic%20rocky%20cliffs%20waterfalls%20dramatic%20scenery%20adventure%20premium%20nature%20experience%20golden%20light&width=600&height=400&seq=5&orientation=landscape',
    tag: 'Aventura',
    tagIcon: 'ri-landscape-line',
    dark: false,
    span: '',
  },
  {
    title: 'Transporte Executivo',
    description: 'Mobilidade corporativa com gestão de frota, rotas prioritárias e relatórios completos.',
    image: 'https://readdy.ai/api/search-image?query=luxury%20executive%20black%20sedan%20limousine%20city%20skyline%20night%20lights%20business%20district%20premium%20corporate%20transport%20chauffeur%20driven%20elegant%20interior%20leather%20upholstery%20professional&width=600&height=400&seq=6&orientation=landscape',
    tag: 'Corporativo',
    tagIcon: 'ri-briefcase-line',
    dark: false,
    span: '',
  },
  {
    title: 'Parceiros de Hospitalidade',
    description: 'Integração com hotéis, pousadas e resorts para jornadas fluidas dos hóspedes.',
    image: 'https://readdy.ai/api/search-image?query=stunning%20luxury%20boutique%20pousada%20hotel%20exterior%20tropical%20garden%20pool%20infinity%20view%20ocean%20sunset%20golden%20hour%20premium%20Brazilian%20hospitality%20five%20star%20resort%20elegant%20architecture&width=600&height=400&seq=7&orientation=landscape',
    tag: 'Parceiros',
    tagIcon: 'ri-building-2-line',
    dark: false,
    span: '',
  },
];

export default function ExperienceCategories() {
  return (
    <section id="experiences" className="bg-sand-50 py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="reveal">
            <span className="text-teal-600 text-xs font-semibold tracking-widest uppercase mb-3 block">
              Nossas Ofertas
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight max-w-sm">
              Cada Experiência,
              <span className="italic text-amber-500 block">Perfeitamente Orquestrada</span>
            </h2>
          </div>
          <p className="reveal delay-200 text-navy-600 text-base font-light leading-relaxed max-w-md">
            De chegadas aeroportuárias a aventuras nas serras — nossa plataforma conecta
            prestadores de serviço premium com hóspedes que esperam o extraordinário.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-5">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`reveal delay-${Math.min(i * 100, 500)} group relative rounded-2xl overflow-hidden cursor-pointer ${cat.span} ${
                cat.dark ? 'min-h-[420px]' : 'min-h-[220px]'
              }`}
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  cat.dark
                    ? 'bg-gradient-to-b from-navy-900/40 via-navy-900/30 to-navy-950/90'
                    : 'bg-gradient-to-b from-navy-900/20 to-navy-950/75'
                }`}
              ></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                {/* Top Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
                    <i className={`${cat.tagIcon} text-amber-300`}></i>
                    {cat.tag}
                  </span>
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors duration-200">
                    <i className="ri-arrow-right-up-line text-white text-sm"></i>
                  </span>
                </div>

                {/* Bottom Text */}
                <div>
                  <h3 className={`font-serif font-semibold text-white mb-2 ${cat.dark ? 'text-2xl' : 'text-xl'}`}>
                    {cat.title}
                  </h3>
                  <p className={`text-white/65 font-light leading-relaxed ${cat.dark ? 'text-sm max-w-xs' : 'text-xs'}`}>
                    {cat.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-medium">
                      Explorar <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}