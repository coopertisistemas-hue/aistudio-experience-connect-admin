const features = [
  {
    icon: 'ri-calendar-check-line',
    title: 'Gestão de Reservas',
    description:
      'Coordene reservas de transfers e experiências com confirmação imediata, lembretes automáticos e disponibilidade em tempo real.',
    color: 'teal',
  },
  {
    icon: 'ri-route-line',
    title: 'Coordenação de Rotas',
    description:
      'Planejamento inteligente de rotas para frotas de qualquer porte — garantindo coletas pontuais, trajetos otimizados e zero conflitos.',
    color: 'amber',
  },
  {
    icon: 'ri-steering-2-line',
    title: 'Agenda de Veículos',
    description:
      'Visibilidade total da frota com atribuição de motoristas, rastreamento de manutenção e atualizações de disponibilidade em tempo real.',
    color: 'teal',
  },
  {
    icon: 'ri-user-heart-line',
    title: 'Jornada do Hóspede',
    description:
      'Crie itinerários personalizados do desembarque à partida — com preferências, solicitações e histórico do hóspede centralizados.',
    color: 'amber',
  },
  {
    icon: 'ri-secure-payment-line',
    title: 'Integração de Pagamentos',
    description:
      'Pagamentos seguros em múltiplas moedas, faturamento automático, gestão de depósitos e conciliação completa para operações de hospitalidade.',
    color: 'teal',
  },
  {
    icon: 'ri-pulse-line',
    title: 'Operação em Tempo Real',
    description:
      'Monitoramento operacional ao vivo com rastreamento de motoristas, notificações aos hóspedes, alertas de atrasos e comunicação instantânea.',
    color: 'amber',
  },
];

const ecosystem = [
  { icon: 'ri-dashboard-3-line', label: 'Painel Admin', desc: 'Gestão operacional completa' },
  { icon: 'ri-steering-2-line', label: 'App do Motorista', desc: 'Agenda e rotas em tempo real' },
  { icon: 'ri-user-smile-line', label: 'App do Hóspede', desc: 'Reservas e jornada digital' },
];

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const delay = Math.min(index * 100, 500);
  return (
    <div
      className={`reveal delay-${delay} group p-7 rounded-2xl bg-white border border-sand-200 hover:border-teal-200 transition-all duration-300 cursor-default`}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl mb-5 transition-colors duration-300 ${
          feature.color === 'teal'
            ? 'bg-teal-50 group-hover:bg-teal-100'
            : 'bg-amber-50 group-hover:bg-amber-100'
        }`}
      >
        <i
          className={`${feature.icon} text-xl ${
            feature.color === 'teal' ? 'text-teal-600' : 'text-amber-600'
          }`}
        ></i>
      </div>
      <h3 className="font-serif text-lg font-semibold text-navy-900 mb-3">{feature.title}</h3>
      <p className="text-navy-500 text-sm leading-relaxed font-light">{feature.description}</p>
      <div className="mt-5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span
          className={`text-xs font-medium ${feature.color === 'teal' ? 'text-teal-600' : 'text-amber-600'}`}
        >
          Saiba mais
        </span>
        <i
          className={`ri-arrow-right-line text-xs ${
            feature.color === 'teal' ? 'text-teal-600' : 'text-amber-600'
          }`}
        ></i>
      </div>
    </div>
  );
}

export default function PlatformFeatures() {
  return (
    <section id="platform" className="bg-white py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Ecosystem Banner */}
        <div id="ecosystem" className="reveal mb-16 rounded-2xl bg-navy-950 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase mb-3 block">
                Ecossistema Integrado
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
                Uma plataforma, três experiências
              </h3>
              <p className="text-white/50 text-sm font-light max-w-md">
                Admin, motoristas e hóspedes — todos conectados em tempo real numa operação fluida e premium.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              {ecosystem.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 px-6 py-5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition-colors duration-200 cursor-default min-w-[130px]"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/25">
                    <i className={`${item.icon} text-teal-400 text-lg`}></i>
                  </div>
                  <div className="text-white text-sm font-semibold text-center">{item.label}</div>
                  <div className="text-white/40 text-xs text-center leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="reveal-fade text-teal-600 text-xs font-semibold tracking-widest uppercase mb-3 block">
            Capacidades da Plataforma
          </span>
          <h2 className="reveal font-serif text-4xl md:text-5xl font-semibold text-navy-950 leading-tight mb-5">
            Tudo que Você Precisa para{' '}
            <span className="italic text-amber-500">Operar com Excelência</span>
          </h2>
          <p className="reveal delay-200 text-navy-500 text-base font-light leading-relaxed">
            Desenvolvida para operações de hospitalidade premium — de operadores individuais
            a redes de turismo gerenciando milhares de experiências.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="reveal mt-14 rounded-2xl bg-sand-50 border border-sand-200 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-navy-900 mb-2">
              Confiado por 340+ parceiros de hospitalidade
            </h3>
            <p className="text-navy-500 text-sm font-light">
              De pousadas boutique a grandes redes hoteleiras por todo o Brasil.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            {['⭐ 4,9 Avaliação', '✓ Segurança Enterprise', '◎ 99,9% Disponibilidade'].map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 rounded-lg border border-sand-300 bg-white text-navy-600 text-sm font-medium whitespace-nowrap"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}