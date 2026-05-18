// ─── Types ────────────────────────────────────────────────────────────────────

export type ExperienceStatus = 'active' | 'paused' | 'high_demand' | 'unavailable' | 'draft';
export type DemandLevel = 'high' | 'medium' | 'low';
export type PartnerType = 'hotel' | 'pousada' | 'agencia' | 'guia' | 'experiencia' | 'operador_turistico';
export type PartnerStatus = 'active' | 'paused' | 'inactive';
export type CategoryVisibility = 'visible' | 'hidden';

export interface MockExperience {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  partner_id: string;
  partner_name: string;
  route_id: string | null;
  route_name: string | null;
  description: string;
  duration_hours: number;
  base_price: number;
  capacity: number;
  status: ExperienceStatus;
  demand: DemandLevel;
  bookings_count: number;
  bookings_this_month: number;
  rating: number;
  image_hint: string;
  tags: string[];
  included: string[];
  created_at: string;
  next_available: string;
}

export interface MockPartner {
  id: string;
  name: string;
  type: PartnerType;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  country: string;
  experiences_count: number;
  bookings_generated: number;
  revenue_generated: number;
  status: PartnerStatus;
  notes: string;
  since: string;
  last_booking: string;
  tags: string[];
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  experiences_count: number;
  bookings_count: number;
  demand: DemandLevel;
  visibility: CategoryVisibility;
  sort_order: number;
  tags: string[];
}

// ─── Experiences ──────────────────────────────────────────────────────────────

export const mockExperiences: MockExperience[] = [
  {
    id: 'exp-001',
    name: 'Transfer Aeroporto Premium',
    category_id: 'cat-001',
    category_name: 'Transfers Aeroporto',
    partner_id: 'par-001',
    partner_name: 'Grand Hyatt São Paulo',
    route_id: 'route-001',
    route_name: 'GRU → Paulista',
    description: 'Transfer executivo entre o Aeroporto Internacional de Guarulhos e a região da Avenida Paulista. Veículo premium, motorista bilíngue e amenities a bordo.',
    duration_hours: 1.5,
    base_price: 180,
    capacity: 4,
    status: 'active',
    demand: 'high',
    bookings_count: 324,
    bookings_this_month: 42,
    rating: 4.9,
    image_hint: 'premium executive car airport transfer luxury',
    tags: ['executivo', 'aeroporto', 'premium', 'bilíngue'],
    included: ['Água mineral', 'Wi-Fi a bordo', 'Amenities', 'Rastreamento em tempo real'],
    created_at: '2025-01-10',
    next_available: '2026-05-17T14:00:00',
  },
  {
    id: 'exp-002',
    name: 'Rota dos Vinhos — Serra Gaúcha',
    category_id: 'cat-004',
    category_name: 'Rotas de Vinho',
    partner_id: 'par-002',
    partner_name: 'Vinícola Miolo',
    route_id: 'route-002',
    route_name: 'Porto Alegre → Bento Gonçalves',
    description: 'Passeio privativo pelas principais vinícolas da Serra Gaúcha com degustações guiadas, almoço regional e retorno ao hotel. Guia especializado incluso.',
    duration_hours: 9,
    base_price: 650,
    capacity: 6,
    status: 'high_demand',
    demand: 'high',
    bookings_count: 186,
    bookings_this_month: 28,
    rating: 4.8,
    image_hint: 'wine tour vineyard mountains scenic landscape',
    tags: ['vinhos', 'gastronomia', 'privativo', 'guia'],
    included: ['Degustações', 'Almoço regional', 'Guia especializado', 'Transfer'],
    created_at: '2025-02-15',
    next_available: '2026-05-18T09:00:00',
  },
  {
    id: 'exp-003',
    name: 'Passeio Montanha Privativo',
    category_id: 'cat-003',
    category_name: 'Passeios de Montanha',
    partner_id: 'par-003',
    partner_name: 'Serra Negra Ecoturismo',
    route_id: 'route-003',
    route_name: 'Gramado → Canela → Caracol',
    description: 'Experiência privativa pelas principais atrações de montanha da região de Gramado e Canela. Veículo 4×4, trilhas guiadas e picnic panorâmico.',
    duration_hours: 8,
    base_price: 480,
    capacity: 5,
    status: 'active',
    demand: 'medium',
    bookings_count: 112,
    bookings_this_month: 15,
    rating: 4.7,
    image_hint: 'mountain tour hiking scenic nature luxury',
    tags: ['montanha', 'natureza', 'privativo', 'aventura'],
    included: ['Veículo 4×4', 'Guia de montanha', 'Picnic premium', 'Seguro viagem'],
    created_at: '2025-03-01',
    next_available: '2026-05-19T08:00:00',
  },
  {
    id: 'exp-004',
    name: 'Experiência Família Completa',
    category_id: 'cat-006',
    category_name: 'Turismo Familiar',
    partner_id: 'par-004',
    partner_name: 'Família & Cia Turismo',
    route_id: null,
    route_name: null,
    description: 'Pacote completo para famílias com crianças: transfers, passeios temáticos, restaurantes kids-friendly e atividades ao ar livre adaptadas para todas as idades.',
    duration_hours: 12,
    base_price: 890,
    capacity: 8,
    status: 'active',
    demand: 'medium',
    bookings_count: 89,
    bookings_this_month: 11,
    rating: 4.6,
    image_hint: 'family tourism kids activities outdoor fun',
    tags: ['família', 'kids', 'completo', 'seguro'],
    included: ['Transfers', 'Atividades infantis', 'Almoço família', 'Kit criança'],
    created_at: '2025-03-20',
    next_available: '2026-05-20T09:00:00',
  },
  {
    id: 'exp-005',
    name: 'City Tour Executivo São Paulo',
    category_id: 'cat-002',
    category_name: 'Experiências Privadas',
    partner_id: 'par-001',
    partner_name: 'Grand Hyatt São Paulo',
    route_id: 'route-004',
    route_name: 'Centro SP → Itaim → Vila Madalena',
    description: 'City tour privativo pelos pontos históricos, culturais e gastronômicos de São Paulo. Guia executivo, veículo premium e roteiro personalizado.',
    duration_hours: 6,
    base_price: 320,
    capacity: 4,
    status: 'active',
    demand: 'medium',
    bookings_count: 145,
    bookings_this_month: 18,
    rating: 4.8,
    image_hint: 'sao paulo city tour luxury private executive',
    tags: ['city tour', 'executivo', 'cultura', 'gastronomia'],
    included: ['Guia executivo', 'Veículo premium', 'Ingressos', 'Jantar incluso'],
    created_at: '2025-01-25',
    next_available: '2026-05-17T15:00:00',
  },
  {
    id: 'exp-006',
    name: 'Noite Gastronômica Privativa',
    category_id: 'cat-002',
    category_name: 'Experiências Privadas',
    partner_id: 'par-005',
    partner_name: 'Restaurante D.O.M.',
    route_id: null,
    route_name: null,
    description: 'Experiência gastronômica exclusiva com jantar em restaurante estrelado, sommelier privativo e transfer premium. Reserva antecipada obrigatória.',
    duration_hours: 4,
    base_price: 1200,
    capacity: 6,
    status: 'paused',
    demand: 'low',
    bookings_count: 34,
    bookings_this_month: 0,
    rating: 4.9,
    image_hint: 'fine dining restaurant gourmet luxury night',
    tags: ['gastronomia', 'exclusivo', 'sommelier', 'luxo'],
    included: ['Jantar 8 tempos', 'Harmonização', 'Sommelier', 'Transfer'],
    created_at: '2025-04-01',
    next_available: '',
  },
  {
    id: 'exp-007',
    name: 'Rota de Acessibilidade Premium',
    category_id: 'cat-005',
    category_name: 'Executivo',
    partner_id: 'par-006',
    partner_name: 'Access & Go Mobilidade',
    route_id: null,
    route_name: null,
    description: 'Transfers e passeios adaptados para hóspedes com necessidades especiais. Veículos equipados, assistência especializada e roteiros sem barreiras.',
    duration_hours: 6,
    base_price: 290,
    capacity: 4,
    status: 'draft',
    demand: 'low',
    bookings_count: 0,
    bookings_this_month: 0,
    rating: 0,
    image_hint: 'accessible transportation wheelchair premium care',
    tags: ['acessibilidade', 'adaptado', 'especial', 'cuidado'],
    included: ['Veículo adaptado', 'Assistente especializado', 'Rampas de acesso', 'Seguro'],
    created_at: '2026-05-01',
    next_available: '',
  },
  {
    id: 'exp-008',
    name: 'Helitour Litoral Paulista',
    category_id: 'cat-002',
    category_name: 'Experiências Privadas',
    partner_id: 'par-002',
    partner_name: 'Vinícola Miolo',
    route_id: null,
    route_name: null,
    description: 'Sobrevoo panorâmico sobre o litoral norte paulista com champagne a bordo, pouso em mirante exclusivo e transfer de retorno ao hotel.',
    duration_hours: 2,
    base_price: 1800,
    capacity: 3,
    status: 'unavailable',
    demand: 'low',
    bookings_count: 18,
    bookings_this_month: 0,
    rating: 5.0,
    image_hint: 'helicopter tour coastal luxury aerial view',
    tags: ['helicóptero', 'litoral', 'premium', 'exclusivo'],
    included: ['Voo panorâmico 45min', 'Champagne', 'Pouso exclusivo', 'Transfer'],
    created_at: '2025-06-01',
    next_available: '',
  },
];

// ─── Partners ─────────────────────────────────────────────────────────────────

export const mockPartners: MockPartner[] = [
  {
    id: 'par-001',
    name: 'Grand Hyatt São Paulo',
    type: 'hotel',
    contact_name: 'Isabela Corrêa',
    contact_email: 'concierge@grandhyatt.com.br',
    contact_phone: '+55 11 2838-1234',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    experiences_count: 3,
    bookings_generated: 469,
    revenue_generated: 142800,
    status: 'active',
    notes: 'Parceiro estratégico premium. Prioridade nas confirmações e alocação de veículos. Contrato anual renovado em Janeiro/2026.',
    since: '2025-01-10',
    last_booking: '2026-05-16',
    tags: ['hotel 5 estrelas', 'executivo', 'sp', 'vip'],
  },
  {
    id: 'par-002',
    name: 'Vinícola Miolo',
    type: 'experiencia',
    contact_name: 'Carlos Miolo Filho',
    contact_email: 'receptivo@miolo.com.br',
    contact_phone: '+55 54 3264-9100',
    city: 'Bento Gonçalves',
    state: 'RS',
    country: 'Brasil',
    experiences_count: 2,
    bookings_generated: 204,
    revenue_generated: 87600,
    status: 'active',
    notes: 'Parceiro premium para rotas de enoturismo. Alta satisfação dos hóspedes. Prioridade na temporada de vindima (Jan-Mar).',
    since: '2025-02-15',
    last_booking: '2026-05-15',
    tags: ['vinhos', 'enoturismo', 'gastronomia', 'serra gaúcha'],
  },
  {
    id: 'par-003',
    name: 'Serra Negra Ecoturismo',
    type: 'operador_turistico',
    contact_name: 'Rodrigo Almeida',
    contact_email: 'operacao@serranegra.tur.br',
    contact_phone: '+55 54 3286-4400',
    city: 'Gramado',
    state: 'RS',
    country: 'Brasil',
    experiences_count: 1,
    bookings_generated: 112,
    revenue_generated: 53760,
    status: 'active',
    notes: 'Especialistas em passeios de montanha e ecoturismo premium. Guias certificados em trilhas.',
    since: '2025-03-01',
    last_booking: '2026-05-14',
    tags: ['ecoturismo', 'montanha', 'gramado', 'natureza'],
  },
  {
    id: 'par-004',
    name: 'Família & Cia Turismo',
    type: 'agencia',
    contact_name: 'Mariana Fontana',
    contact_email: 'contato@familiaecia.tur.br',
    contact_phone: '+55 11 4567-8900',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    experiences_count: 1,
    bookings_generated: 89,
    revenue_generated: 79210,
    status: 'active',
    notes: 'Agência focada em turismo familiar premium. Excelente curadoria de atividades infantis.',
    since: '2025-03-20',
    last_booking: '2026-05-13',
    tags: ['família', 'kids', 'agência', 'sp'],
  },
  {
    id: 'par-005',
    name: 'Restaurante D.O.M.',
    type: 'experiencia',
    contact_name: 'Alex Atala',
    contact_email: 'reservas@domrestaurante.com.br',
    contact_phone: '+55 11 3088-0761',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    experiences_count: 1,
    bookings_generated: 34,
    revenue_generated: 40800,
    status: 'paused',
    notes: 'Parceria temporariamente pausada por reformas no restaurante. Retorno previsto Junho/2026.',
    since: '2025-04-01',
    last_booking: '2026-04-20',
    tags: ['gastronomia', 'estrelado', 'luxo', 'sp'],
  },
  {
    id: 'par-006',
    name: 'Access & Go Mobilidade',
    type: 'operador_turistico',
    contact_name: 'Fernando Neves',
    contact_email: 'operacao@accessgo.com.br',
    contact_phone: '+55 11 3322-5500',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    experiences_count: 1,
    bookings_generated: 0,
    revenue_generated: 0,
    status: 'active',
    notes: 'Novo parceiro especializado em mobilidade acessível. Experiência em fase de rascunho.',
    since: '2026-05-01',
    last_booking: '',
    tags: ['acessibilidade', 'inclusão', 'adaptado', 'novo'],
  },
  {
    id: 'par-007',
    name: 'Pousada Vila da Serra',
    type: 'pousada',
    contact_name: 'Beatriz Souza',
    contact_email: 'reservas@viladaserra.com.br',
    contact_phone: '+55 35 3341-2200',
    city: 'Monte Verde',
    state: 'MG',
    country: 'Brasil',
    experiences_count: 0,
    bookings_generated: 0,
    revenue_generated: 0,
    status: 'inactive',
    notes: 'Contato inicial feito. Aguardando proposta comercial para parceria em transfers locais.',
    since: '2026-04-15',
    last_booking: '',
    tags: ['pousada', 'monte verde', 'minas', 'pendente'],
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────

export const mockCategories: MockCategory[] = [
  {
    id: 'cat-001',
    name: 'Transfers Aeroporto',
    slug: 'transfers-aeroporto',
    description: 'Traslados premium entre aeroportos e hotéis. Motoristas bilíngues, veículos executivos e rastreamento em tempo real.',
    icon: 'ri-flight-land-line',
    color: 'teal',
    experiences_count: 1,
    bookings_count: 324,
    demand: 'high',
    visibility: 'visible',
    sort_order: 1,
    tags: ['aeroporto', 'executivo', 'premium'],
  },
  {
    id: 'cat-002',
    name: 'Experiências Privadas',
    slug: 'experiencias-privadas',
    description: 'Experiências exclusivas com atendimento 100% dedicado. City tours, eventos gastronômicos e sobrevoos panorâmicos.',
    icon: 'ri-vip-diamond-line',
    color: 'navy',
    experiences_count: 3,
    bookings_count: 197,
    demand: 'high',
    visibility: 'visible',
    sort_order: 2,
    tags: ['privativo', 'exclusivo', 'luxo'],
  },
  {
    id: 'cat-003',
    name: 'Passeios de Montanha',
    slug: 'passeios-de-montanha',
    description: 'Roteiros ecológicos e de aventura em regiões de montanha. Trilhas guiadas, mirantes exclusivos e natureza preservada.',
    icon: 'ri-landscape-line',
    color: 'emerald',
    experiences_count: 1,
    bookings_count: 112,
    demand: 'medium',
    visibility: 'visible',
    sort_order: 3,
    tags: ['natureza', 'aventura', 'trilhas'],
  },
  {
    id: 'cat-004',
    name: 'Rotas de Vinho',
    slug: 'rotas-de-vinho',
    description: 'Enoturismo premium com visitas às melhores vinícolas do Brasil. Degustações guiadas, harmonizações e gastronomia regional.',
    icon: 'ri-goblet-line',
    color: 'wine',
    experiences_count: 1,
    bookings_count: 186,
    demand: 'high',
    visibility: 'visible',
    sort_order: 4,
    tags: ['vinhos', 'gastronomia', 'enoturismo'],
  },
  {
    id: 'cat-005',
    name: 'Executivo',
    slug: 'executivo',
    description: 'Serviços e transfers para hóspedes corporativos. Veículos premium, motoristas profissionais e pontualidade garantida.',
    icon: 'ri-briefcase-4-line',
    color: 'slate',
    experiences_count: 1,
    bookings_count: 0,
    demand: 'low',
    visibility: 'visible',
    sort_order: 5,
    tags: ['corporativo', 'executivo', 'business'],
  },
  {
    id: 'cat-006',
    name: 'Turismo Familiar',
    slug: 'turismo-familiar',
    description: 'Roteiros pensados para famílias com crianças. Atividades seguras, veículos confortáveis e atendimento acolhedor.',
    icon: 'ri-parent-line',
    color: 'amber',
    experiences_count: 1,
    bookings_count: 89,
    demand: 'medium',
    visibility: 'visible',
    sort_order: 6,
    tags: ['família', 'kids', 'seguro'],
  },
  {
    id: 'cat-007',
    name: 'Acessibilidade',
    slug: 'acessibilidade',
    description: 'Transfers e passeios adaptados para hóspedes com necessidades especiais. Inclusão e conforto sem barreiras.',
    icon: 'ri-wheelchair-line',
    color: 'sky',
    experiences_count: 1,
    bookings_count: 0,
    demand: 'low',
    visibility: 'hidden',
    sort_order: 7,
    tags: ['inclusão', 'adaptado', 'especial'],
  },
];

// ─── Summary Stats ────────────────────────────────────────────────────────────

export const mockExperienceStats = {
  total_experiences: mockExperiences.length,
  active_experiences: mockExperiences.filter((e) => e.status === 'active').length,
  high_demand: mockExperiences.filter((e) => e.demand === 'high').length,
  total_partners: mockPartners.length,
  active_partners: mockPartners.filter((p) => p.status === 'active').length,
  total_categories: mockCategories.length,
  bookings_this_month: mockExperiences.reduce((s, e) => s + e.bookings_this_month, 0),
  total_bookings: mockExperiences.reduce((s, e) => s + e.bookings_count, 0),
  avg_rating:
    Math.round(
      (mockExperiences
        .filter((e) => e.rating > 0)
        .reduce((s, e) => s + e.rating, 0) /
        mockExperiences.filter((e) => e.rating > 0).length) *
        10
    ) / 10,
};

export const statusLabels: Record<ExperienceStatus, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  high_demand: 'Alta demanda',
  unavailable: 'Indisponível',
  draft: 'Rascunho',
};

export const partnerTypeLabels: Record<PartnerType, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  agencia: 'Agência',
  guia: 'Guia',
  experiencia: 'Experiência',
  operador_turistico: 'Operador Turístico',
};

export const demandLabels: Record<DemandLevel, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};