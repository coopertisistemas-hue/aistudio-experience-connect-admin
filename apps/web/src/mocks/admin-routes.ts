// admin-routes.ts — schema-aligned with routes + bookings + vehicles + users tables

export type RouteStatus = 'active' | 'inactive' | 'paused' | 'high_demand' | 'attention';
export type RouteCategory = 'airport' | 'hotel' | 'tourism' | 'corporate' | 'transfer';

export interface RouteTransferSummary {
  id: string;
  reference: string;
  scheduled_at: string;
  pax: number;
  status: 'scheduled' | 'driver_assigned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  vehicle_name: string;
  driver_name: string;
}

export interface RouteHistoryEntry {
  period: string;
  transfers: number;
  revenue: number;
  avg_pax: number;
  avg_occupancy: number;
}

export interface MockRoute {
  id: string;
  tenant_id: string;
  name: string;
  category: RouteCategory;
  origin_name: string;
  origin_detail: string;
  destination_name: string;
  destination_detail: string;
  distance_km: number;
  duration_min: number;
  base_price: number;
  is_active: boolean;
  status: RouteStatus;
  // Operational data
  transfers_today: number;
  transfers_this_month: number;
  transfers_total: number;
  avg_occupancy_pct: number;
  demand_level: 'low' | 'medium' | 'high' | 'peak';
  // Financial
  revenue_this_month: number;
  revenue_total: number;
  avg_ticket: number;
  // Associated resources
  preferred_vehicle_types: string[];
  associated_drivers: string[];
  // Today's transfers
  today_transfers: RouteTransferSummary[];
  // Monthly history
  monthly_history: RouteHistoryEntry[];
  // Notes
  notes: string | null;
  // Metadata
  created_at: string;
  last_used: string | null;
}

export const mockRoutes: MockRoute[] = [
  {
    id: 'rte-1',
    tenant_id: 'ten1',
    name: 'SDU → Ipanema',
    category: 'airport',
    origin_name: 'Aeroporto Santos Dumont',
    origin_detail: 'Praça Sen. Salgado Filho, s/n — Centro, Rio de Janeiro',
    destination_name: 'Ipanema / Leblon',
    destination_detail: 'Av. Vieira Souto — Ipanema, Rio de Janeiro',
    distance_km: 14.5,
    duration_min: 28,
    base_price: 185.0,
    is_active: true,
    status: 'high_demand',
    transfers_today: 7,
    transfers_this_month: 142,
    transfers_total: 1840,
    avg_occupancy_pct: 78,
    demand_level: 'peak',
    revenue_this_month: 26270.0,
    revenue_total: 340400.0,
    avg_ticket: 197.5,
    preferred_vehicle_types: ['Sedã', 'Van', 'SUV'],
    associated_drivers: ['João Silva', 'Ana Ferreira', 'Pedro Rocha'],
    today_transfers: [
      { id: 'tt-101', reference: 'TRF-2891', scheduled_at: '2026-05-17T08:00:00', pax: 2, status: 'completed', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
      { id: 'tt-102', reference: 'TRF-2895', scheduled_at: '2026-05-17T10:30:00', pax: 3, status: 'completed', vehicle_name: 'Sedã Executivo Preto', driver_name: 'Ana Ferreira' },
      { id: 'tt-103', reference: 'TRF-2901', scheduled_at: '2026-05-17T12:00:00', pax: 1, status: 'in_progress', vehicle_name: 'SUV Premium Blindado', driver_name: 'Roberto Lima' },
      { id: 'tt-104', reference: 'TRF-2907', scheduled_at: '2026-05-17T14:00:00', pax: 2, status: 'scheduled', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
      { id: 'tt-105', reference: 'TRF-2912', scheduled_at: '2026-05-17T16:30:00', pax: 4, status: 'scheduled', vehicle_name: 'Van Executive Grafite', driver_name: 'Pedro Rocha' },
      { id: 'tt-106', reference: 'TRF-2919', scheduled_at: '2026-05-17T19:00:00', pax: 2, status: 'scheduled', vehicle_name: 'Sedã Executivo Preto', driver_name: 'Ana Ferreira' },
      { id: 'tt-107', reference: 'TRF-2924', scheduled_at: '2026-05-17T21:30:00', pax: 3, status: 'scheduled', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 142, revenue: 26270, avg_pax: 2.4, avg_occupancy: 78 },
      { period: 'Abr 2026', transfers: 138, revenue: 25530, avg_pax: 2.3, avg_occupancy: 75 },
      { period: 'Mar 2026', transfers: 121, revenue: 22385, avg_pax: 2.1, avg_occupancy: 70 },
    ],
    notes: 'Rota mais demandada da operação. Priorizar veículos executivos. Requer motorista certificado SDU.',
    created_at: '2024-01-15',
    last_used: '2026-05-17T12:15:00',
  },
  {
    id: 'rte-2',
    tenant_id: 'ten1',
    name: 'GIG → Barra da Tijuca',
    category: 'airport',
    origin_name: 'Aeroporto Internacional Galeão',
    origin_detail: 'Av. 20 de Janeiro, s/n — Ilha do Governador, Rio de Janeiro',
    destination_name: 'Barra da Tijuca',
    destination_detail: 'Av. das Américas — Barra da Tijuca, Rio de Janeiro',
    distance_km: 52.0,
    duration_min: 55,
    base_price: 320.0,
    is_active: true,
    status: 'active',
    transfers_today: 4,
    transfers_this_month: 98,
    transfers_total: 1124,
    avg_occupancy_pct: 65,
    demand_level: 'high',
    revenue_this_month: 31360.0,
    revenue_total: 359680.0,
    avg_ticket: 338.5,
    preferred_vehicle_types: ['Van', 'Sprinter', 'SUV'],
    associated_drivers: ['Carlos Mendes', 'Roberto Lima'],
    today_transfers: [
      { id: 'tt-201', reference: 'TRF-2887', scheduled_at: '2026-05-17T07:00:00', pax: 8, status: 'completed', vehicle_name: 'Toyota Hiace Premium', driver_name: 'Carlos Mendes' },
      { id: 'tt-202', reference: 'TRF-2903', scheduled_at: '2026-05-17T13:00:00', pax: 4, status: 'driver_assigned', vehicle_name: 'SUV Premium Blindado', driver_name: 'Roberto Lima' },
      { id: 'tt-203', reference: 'TRF-2915', scheduled_at: '2026-05-17T17:30:00', pax: 6, status: 'scheduled', vehicle_name: 'Toyota Hiace Premium', driver_name: 'Carlos Mendes' },
      { id: 'tt-204', reference: 'TRF-2921', scheduled_at: '2026-05-17T22:00:00', pax: 5, status: 'scheduled', vehicle_name: 'Van Executive Grafite', driver_name: 'Pedro Rocha' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 98, revenue: 31360, avg_pax: 4.2, avg_occupancy: 65 },
      { period: 'Abr 2026', transfers: 91, revenue: 29120, avg_pax: 4.0, avg_occupancy: 62 },
      { period: 'Mar 2026', transfers: 85, revenue: 27200, avg_pax: 3.8, avg_occupancy: 60 },
    ],
    notes: 'Rota de longa distância. Exige motoristas com experiência em GIG. Reservar 15 min extras para congestionamento da Linha Amarela.',
    created_at: '2024-01-15',
    last_used: '2026-05-17T14:20:00',
  },
  {
    id: 'rte-3',
    tenant_id: 'ten1',
    name: 'Rio → Búzios',
    category: 'tourism',
    origin_name: 'Rio de Janeiro (Centro)',
    origin_detail: 'Área central e zona sul do Rio de Janeiro',
    destination_name: 'Búzios',
    destination_detail: 'Armação dos Búzios, RJ — 176 km do Rio',
    distance_km: 176.0,
    duration_min: 155,
    base_price: 780.0,
    is_active: true,
    status: 'active',
    transfers_today: 2,
    transfers_this_month: 64,
    transfers_total: 720,
    avg_occupancy_pct: 72,
    demand_level: 'high',
    revenue_this_month: 49920.0,
    revenue_total: 561600.0,
    avg_ticket: 812.0,
    preferred_vehicle_types: ['Van', 'Sprinter', 'SUV'],
    associated_drivers: ['Carlos Mendes', 'Pedro Rocha'],
    today_transfers: [
      { id: 'tt-301', reference: 'TRF-2885', scheduled_at: '2026-05-17T09:00:00', pax: 3, status: 'completed', vehicle_name: 'SUV Premium Blindado', driver_name: 'Roberto Lima' },
      { id: 'tt-302', reference: 'TRF-2896', scheduled_at: '2026-05-17T14:00:00', pax: 10, status: 'driver_assigned', vehicle_name: 'Toyota Hiace Premium', driver_name: 'Carlos Mendes' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 64, revenue: 49920, avg_pax: 3.8, avg_occupancy: 72 },
      { period: 'Abr 2026', transfers: 58, revenue: 45240, avg_pax: 3.5, avg_occupancy: 68 },
      { period: 'Mar 2026', transfers: 52, revenue: 40560, avg_pax: 3.3, avg_occupancy: 64 },
    ],
    notes: 'Rota premium de turismo. Incluir parada opcional na Região dos Lagos. Preferência por Sprinter para grupos acima de 6 pax.',
    created_at: '2024-02-01',
    last_used: '2026-05-17T15:30:00',
  },
  {
    id: 'rte-4',
    tenant_id: 'ten1',
    name: 'Rio → Paraty',
    category: 'tourism',
    origin_name: 'Rio de Janeiro (Zona Sul)',
    origin_detail: 'Ipanema, Copacabana, Leblon e arredores',
    destination_name: 'Paraty',
    destination_detail: 'Paraty, RJ — 261 km do Rio de Janeiro',
    distance_km: 261.0,
    duration_min: 210,
    base_price: 980.0,
    is_active: true,
    status: 'active',
    transfers_today: 1,
    transfers_this_month: 38,
    transfers_total: 412,
    avg_occupancy_pct: 68,
    demand_level: 'medium',
    revenue_this_month: 37240.0,
    revenue_total: 403760.0,
    avg_ticket: 1010.0,
    preferred_vehicle_types: ['Sprinter', 'Van'],
    associated_drivers: ['Ana Ferreira', 'Carlos Mendes'],
    today_transfers: [
      { id: 'tt-401', reference: 'TRF-2892', scheduled_at: '2026-05-17T06:30:00', pax: 12, status: 'completed', vehicle_name: 'Mercedes Sprinter Luxury', driver_name: 'Ana Ferreira' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 38, revenue: 37240, avg_pax: 4.2, avg_occupancy: 68 },
      { period: 'Abr 2026', transfers: 35, revenue: 34300, avg_pax: 4.0, avg_occupancy: 65 },
      { period: 'Mar 2026', transfers: 31, revenue: 30380, avg_pax: 3.8, avg_occupancy: 60 },
    ],
    notes: 'Rota longa — programar paradas na Costa Verde. Excelente demanda nos feriados e fins de semana prolongados.',
    created_at: '2024-02-15',
    last_used: '2026-05-17T13:45:00',
  },
  {
    id: 'rte-5',
    tenant_id: 'ten1',
    name: 'GIG → Copacabana',
    category: 'airport',
    origin_name: 'Aeroporto Internacional Galeão',
    origin_detail: 'Av. 20 de Janeiro, s/n — Ilha do Governador, Rio de Janeiro',
    destination_name: 'Copacabana',
    destination_detail: 'Av. Atlântica — Copacabana, Rio de Janeiro',
    distance_km: 47.0,
    duration_min: 48,
    base_price: 295.0,
    is_active: true,
    status: 'active',
    transfers_today: 3,
    transfers_this_month: 112,
    transfers_total: 1320,
    avg_occupancy_pct: 60,
    demand_level: 'high',
    revenue_this_month: 33040.0,
    revenue_total: 389400.0,
    avg_ticket: 315.0,
    preferred_vehicle_types: ['Van', 'Sedã', 'SUV'],
    associated_drivers: ['Carlos Mendes', 'João Silva'],
    today_transfers: [
      { id: 'tt-501', reference: 'TRF-2888', scheduled_at: '2026-05-17T07:30:00', pax: 8, status: 'completed', vehicle_name: 'Toyota Hiace Premium', driver_name: 'Carlos Mendes' },
      { id: 'tt-502', reference: 'TRF-2904', scheduled_at: '2026-05-17T15:00:00', pax: 3, status: 'scheduled', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
      { id: 'tt-503', reference: 'TRF-2917', scheduled_at: '2026-05-17T20:30:00', pax: 5, status: 'scheduled', vehicle_name: 'Van Executive Grafite', driver_name: 'Pedro Rocha' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 112, revenue: 33040, avg_pax: 3.5, avg_occupancy: 60 },
      { period: 'Abr 2026', transfers: 105, revenue: 30975, avg_pax: 3.2, avg_occupancy: 58 },
      { period: 'Mar 2026', transfers: 98, revenue: 28910, avg_pax: 3.0, avg_occupancy: 55 },
    ],
    notes: 'Rota aeroporto clássica. Alta demanda em temporada de alta e eventos no Rio.',
    created_at: '2024-01-15',
    last_used: '2026-05-17T08:15:00',
  },
  {
    id: 'rte-6',
    tenant_id: 'ten1',
    name: 'Ipanema → SDU',
    category: 'airport',
    origin_name: 'Ipanema / Leblon',
    origin_detail: 'Av. Vieira Souto e arredores — Ipanema, Rio de Janeiro',
    destination_name: 'Aeroporto Santos Dumont',
    destination_detail: 'Praça Sen. Salgado Filho, s/n — Centro, Rio de Janeiro',
    distance_km: 14.5,
    duration_min: 30,
    base_price: 185.0,
    is_active: true,
    status: 'active',
    transfers_today: 5,
    transfers_this_month: 131,
    transfers_total: 1690,
    avg_occupancy_pct: 74,
    demand_level: 'peak',
    revenue_this_month: 24235.0,
    revenue_total: 312650.0,
    avg_ticket: 195.0,
    preferred_vehicle_types: ['Sedã', 'Van', 'SUV'],
    associated_drivers: ['João Silva', 'Ana Ferreira'],
    today_transfers: [
      { id: 'tt-601', reference: 'TRF-2880', scheduled_at: '2026-05-17T06:00:00', pax: 2, status: 'completed', vehicle_name: 'SUV Premium Blindado', driver_name: 'Roberto Lima' },
      { id: 'tt-602', reference: 'TRF-2883', scheduled_at: '2026-05-17T07:30:00', pax: 1, status: 'completed', vehicle_name: 'Sedã Executivo Preto', driver_name: 'Ana Ferreira' },
      { id: 'tt-603', reference: 'TRF-2898', scheduled_at: '2026-05-17T11:00:00', pax: 3, status: 'completed', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
      { id: 'tt-604', reference: 'TRF-2909', scheduled_at: '2026-05-17T16:00:00', pax: 2, status: 'scheduled', vehicle_name: 'Sedã Executivo Preto', driver_name: 'Ana Ferreira' },
      { id: 'tt-605', reference: 'TRF-2920', scheduled_at: '2026-05-17T20:00:00', pax: 4, status: 'scheduled', vehicle_name: 'Van Executive Grafite', driver_name: 'Pedro Rocha' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 131, revenue: 24235, avg_pax: 2.2, avg_occupancy: 74 },
      { period: 'Abr 2026', transfers: 126, revenue: 23310, avg_pax: 2.1, avg_occupancy: 72 },
      { period: 'Mar 2026', transfers: 118, revenue: 21830, avg_pax: 2.0, avg_occupancy: 68 },
    ],
    notes: 'Espelho da rota SDU→Ipanema. Igualmente demandada para check-outs e embarques matinais.',
    created_at: '2024-01-15',
    last_used: '2026-05-17T11:45:00',
  },
  {
    id: 'rte-7',
    tenant_id: 'ten1',
    name: 'Rio → Petrópolis',
    category: 'tourism',
    origin_name: 'Rio de Janeiro',
    origin_detail: 'Zona Sul e Centro do Rio de Janeiro',
    destination_name: 'Petrópolis',
    destination_detail: 'Petrópolis, RJ — Cidade Imperial, 68 km do Rio',
    distance_km: 68.0,
    duration_min: 70,
    base_price: 420.0,
    is_active: true,
    status: 'active',
    transfers_today: 0,
    transfers_this_month: 28,
    transfers_total: 315,
    avg_occupancy_pct: 55,
    demand_level: 'medium',
    revenue_this_month: 11760.0,
    revenue_total: 132300.0,
    avg_ticket: 445.0,
    preferred_vehicle_types: ['Van', 'Sedã', 'SUV'],
    associated_drivers: ['João Silva', 'Pedro Rocha'],
    today_transfers: [],
    monthly_history: [
      { period: 'Mai 2026', transfers: 28, revenue: 11760, avg_pax: 2.8, avg_occupancy: 55 },
      { period: 'Abr 2026', transfers: 26, revenue: 10920, avg_pax: 2.6, avg_occupancy: 52 },
      { period: 'Mar 2026', transfers: 24, revenue: 10080, avg_pax: 2.5, avg_occupancy: 50 },
    ],
    notes: 'Rota turística para Cidade Imperial. Demanda elevada em alta temporada e eventos locais.',
    created_at: '2024-03-01',
    last_used: '2026-05-16T18:30:00',
  },
  {
    id: 'rte-8',
    tenant_id: 'ten1',
    name: 'SDU → Copacabana',
    category: 'airport',
    origin_name: 'Aeroporto Santos Dumont',
    origin_detail: 'Praça Sen. Salgado Filho, s/n — Centro, Rio de Janeiro',
    destination_name: 'Copacabana',
    destination_detail: 'Av. Atlântica — Copacabana, Rio de Janeiro',
    distance_km: 9.0,
    duration_min: 20,
    base_price: 145.0,
    is_active: true,
    status: 'active',
    transfers_today: 3,
    transfers_this_month: 89,
    transfers_total: 1040,
    avg_occupancy_pct: 62,
    demand_level: 'high',
    revenue_this_month: 12905.0,
    revenue_total: 150800.0,
    avg_ticket: 152.5,
    preferred_vehicle_types: ['Sedã', 'Van'],
    associated_drivers: ['João Silva', 'Ana Ferreira'],
    today_transfers: [
      { id: 'tt-801', reference: 'TRF-2882', scheduled_at: '2026-05-17T07:00:00', pax: 2, status: 'completed', vehicle_name: 'Sedã Executivo Preto', driver_name: 'Ana Ferreira' },
      { id: 'tt-802', reference: 'TRF-2897', scheduled_at: '2026-05-17T11:30:00', pax: 3, status: 'in_progress', vehicle_name: 'Mercedes Vito Executive', driver_name: 'João Silva' },
      { id: 'tt-803', reference: 'TRF-2913', scheduled_at: '2026-05-17T16:00:00', pax: 4, status: 'scheduled', vehicle_name: 'Van Executive Grafite', driver_name: 'Pedro Rocha' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 89, revenue: 12905, avg_pax: 2.2, avg_occupancy: 62 },
      { period: 'Abr 2026', transfers: 84, revenue: 12180, avg_pax: 2.1, avg_occupancy: 60 },
      { period: 'Mar 2026', transfers: 78, revenue: 11310, avg_pax: 2.0, avg_occupancy: 55 },
    ],
    notes: 'Curta distância. Alta rotatividade. Ideal para vans menores e sedãs.',
    created_at: '2024-01-20',
    last_used: '2026-05-17T11:55:00',
  },
  {
    id: 'rte-9',
    tenant_id: 'ten1',
    name: 'Rio → Angra dos Reis',
    category: 'tourism',
    origin_name: 'Rio de Janeiro',
    origin_detail: 'Zona Sul e Centro do Rio de Janeiro',
    destination_name: 'Angra dos Reis',
    destination_detail: 'Angra dos Reis, RJ — Costa Verde, 167 km do Rio',
    distance_km: 167.0,
    duration_min: 145,
    base_price: 720.0,
    is_active: false,
    status: 'paused',
    transfers_today: 0,
    transfers_this_month: 0,
    transfers_total: 185,
    avg_occupancy_pct: 58,
    demand_level: 'low',
    revenue_this_month: 0,
    revenue_total: 133200.0,
    avg_ticket: 760.0,
    preferred_vehicle_types: ['Van', 'Sprinter'],
    associated_drivers: ['Carlos Mendes'],
    today_transfers: [],
    monthly_history: [
      { period: 'Mai 2026', transfers: 0, revenue: 0, avg_pax: 0, avg_occupancy: 0 },
      { period: 'Abr 2026', transfers: 12, revenue: 8640, avg_pax: 3.2, avg_occupancy: 58 },
      { period: 'Mar 2026', transfers: 14, revenue: 10080, avg_pax: 3.4, avg_occupancy: 60 },
    ],
    notes: 'Temporariamente pausada por demanda baixa fora de temporada. Reativar em outubro.',
    created_at: '2024-04-01',
    last_used: '2026-04-28T16:00:00',
  },
  {
    id: 'rte-10',
    tenant_id: 'ten1',
    name: 'Grupo Corporativo — Centro',
    category: 'corporate',
    origin_name: 'Aeroporto Galeão / SDU',
    origin_detail: 'Chegadas domésticas e internacionais',
    destination_name: 'Centro Empresarial RJ',
    destination_detail: 'Centro e Porto Maravilha — Rio de Janeiro',
    distance_km: 35.0,
    duration_min: 40,
    base_price: 580.0,
    is_active: true,
    status: 'attention',
    transfers_today: 1,
    transfers_this_month: 22,
    transfers_total: 248,
    avg_occupancy_pct: 85,
    demand_level: 'high',
    revenue_this_month: 12760.0,
    revenue_total: 143840.0,
    avg_ticket: 610.0,
    preferred_vehicle_types: ['Sprinter', 'Ônibus'],
    associated_drivers: ['Carlos Mendes', 'Ana Ferreira'],
    today_transfers: [
      { id: 'tt-1001', reference: 'TRF-2890', scheduled_at: '2026-05-17T09:00:00', pax: 14, status: 'delayed', vehicle_name: 'Mercedes Sprinter Luxury', driver_name: 'Ana Ferreira' },
    ],
    monthly_history: [
      { period: 'Mai 2026', transfers: 22, revenue: 12760, avg_pax: 7.2, avg_occupancy: 85 },
      { period: 'Abr 2026', transfers: 20, revenue: 11600, avg_pax: 7.0, avg_occupancy: 82 },
      { period: 'Mar 2026', transfers: 18, revenue: 10440, avg_pax: 6.8, avg_occupancy: 80 },
    ],
    notes: 'Rota corporativa para grupos. Transfer TRF-2890 atrasado hoje — passageiros aguardando no GIG. Verificar status com motorista.',
    created_at: '2024-05-10',
    last_used: '2026-05-17T09:45:00',
  },
];