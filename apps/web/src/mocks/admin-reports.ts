// PLACEHOLDER — schema-aware mock aligned with bookings, payments, routes, vehicles, users tables

export interface DailyTransferStat {
  date: string;
  label: string;
  transfers: number;
  revenue: number;
  occupancy_pct: number;
}

export interface RouteAnalytic {
  id: string;
  name: string;
  category: 'airport' | 'tourism' | 'corporate' | 'hotel';
  transfers: number;
  revenue: number;
  avg_occupancy_pct: number;
  avg_duration_min: number;
  trend: 'up' | 'down' | 'stable';
  trend_pct: number;
}

export interface DriverPerformanceStat {
  id: string;
  name: string;
  initials: string;
  transfers_completed: number;
  punctuality_pct: number;
  completion_pct: number;
  avg_rating: number;
  incidents: number;
  km_total: number;
  rank: number;
}

export interface VehicleUtilizationStat {
  id: string;
  name: string;
  plate: string;
  type: string;
  capacity: number;
  transfers: number;
  avg_occupancy_pct: number;
  km_total: number;
  km_today: number;
  maintenance_status: 'ok' | 'due_soon' | 'overdue';
  utilization_pct: number;
}

export interface RevenueByCategoryItem {
  category: string;
  revenue: number;
  transfers: number;
  pct: number;
  color: string;
}

export interface HourlyPeakStat {
  hour: string;
  transfers: number;
}

// 30-day daily stats
export const mockDailyStats: DailyTransferStat[] = [
  { date: '2026-04-18', label: '18/04', transfers: 8,  revenue: 3200,  occupancy_pct: 72 },
  { date: '2026-04-19', label: '19/04', transfers: 11, revenue: 4100,  occupancy_pct: 78 },
  { date: '2026-04-20', label: '20/04', transfers: 14, revenue: 5500,  occupancy_pct: 84 },
  { date: '2026-04-21', label: '21/04', transfers: 9,  revenue: 3600,  occupancy_pct: 70 },
  { date: '2026-04-22', label: '22/04', transfers: 16, revenue: 6200,  occupancy_pct: 89 },
  { date: '2026-04-23', label: '23/04', transfers: 18, revenue: 7100,  occupancy_pct: 91 },
  { date: '2026-04-24', label: '24/04', transfers: 12, revenue: 4800,  occupancy_pct: 80 },
  { date: '2026-04-25', label: '25/04', transfers: 7,  revenue: 2900,  occupancy_pct: 65 },
  { date: '2026-04-26', label: '26/04', transfers: 10, revenue: 4100,  occupancy_pct: 75 },
  { date: '2026-04-27', label: '27/04', transfers: 13, revenue: 5200,  occupancy_pct: 82 },
  { date: '2026-04-28', label: '28/04', transfers: 15, revenue: 5800,  occupancy_pct: 86 },
  { date: '2026-04-29', label: '29/04', transfers: 19, revenue: 7400,  occupancy_pct: 93 },
  { date: '2026-04-30', label: '30/04', transfers: 21, revenue: 8200,  occupancy_pct: 95 },
  { date: '2026-05-01', label: '01/05', transfers: 17, revenue: 6600,  occupancy_pct: 88 },
  { date: '2026-05-02', label: '02/05', transfers: 14, revenue: 5400,  occupancy_pct: 83 },
  { date: '2026-05-03', label: '03/05', transfers: 9,  revenue: 3500,  occupancy_pct: 69 },
  { date: '2026-05-04', label: '04/05', transfers: 11, revenue: 4300,  occupancy_pct: 76 },
  { date: '2026-05-05', label: '05/05', transfers: 16, revenue: 6100,  occupancy_pct: 87 },
  { date: '2026-05-06', label: '06/05', transfers: 20, revenue: 7800,  occupancy_pct: 92 },
  { date: '2026-05-07', label: '07/05', transfers: 22, revenue: 8600,  occupancy_pct: 96 },
  { date: '2026-05-08', label: '08/05', transfers: 18, revenue: 7100,  occupancy_pct: 90 },
  { date: '2026-05-09', label: '09/05', transfers: 15, revenue: 5900,  occupancy_pct: 85 },
  { date: '2026-05-10', label: '10/05', transfers: 10, revenue: 3900,  occupancy_pct: 71 },
  { date: '2026-05-11', label: '11/05', transfers: 12, revenue: 4600,  occupancy_pct: 79 },
  { date: '2026-05-12', label: '12/05', transfers: 17, revenue: 6500,  occupancy_pct: 88 },
  { date: '2026-05-13', label: '13/05', transfers: 21, revenue: 8100,  occupancy_pct: 94 },
  { date: '2026-05-14', label: '14/05', transfers: 19, revenue: 7400,  occupancy_pct: 91 },
  { date: '2026-05-15', label: '15/05', transfers: 16, revenue: 6200,  occupancy_pct: 87 },
  { date: '2026-05-16', label: '16/05', transfers: 14, revenue: 5500,  occupancy_pct: 84 },
  { date: '2026-05-17', label: '17/05', transfers: 12, revenue: 4800,  occupancy_pct: 82 },
];

export const mockRouteAnalytics: RouteAnalytic[] = [
  { id: 'r1', name: 'GIG → Ipanema/Leblon', category: 'airport',    transfers: 142, revenue: 47800, avg_occupancy_pct: 88, avg_duration_min: 55, trend: 'up',     trend_pct: 12 },
  { id: 'r2', name: 'SDU → Zona Sul',        category: 'airport',    transfers: 118, revenue: 38200, avg_occupancy_pct: 84, avg_duration_min: 32, trend: 'up',     trend_pct: 8  },
  { id: 'r3', name: 'Rio → Búzios Premium',  category: 'tourism',    transfers: 67,  revenue: 72100, avg_occupancy_pct: 91, avg_duration_min: 148, trend: 'up',    trend_pct: 21 },
  { id: 'r4', name: 'GIG → Paraty Tour',     category: 'tourism',    transfers: 41,  revenue: 54900, avg_occupancy_pct: 93, avg_duration_min: 215, trend: 'stable', trend_pct: 2 },
  { id: 'r5', name: 'Zona Sul → GIG',        category: 'airport',    transfers: 128, revenue: 42600, avg_occupancy_pct: 82, avg_duration_min: 60, trend: 'up',     trend_pct: 6  },
  { id: 'r6', name: 'Tour Corcovado RJ',     category: 'tourism',    transfers: 53,  revenue: 38400, avg_occupancy_pct: 87, avg_duration_min: 180, trend: 'down',  trend_pct: -4 },
  { id: 'r7', name: 'Corporativo Centro',    category: 'corporate',  transfers: 89,  revenue: 28600, avg_occupancy_pct: 71, avg_duration_min: 35, trend: 'stable', trend_pct: 1  },
  { id: 'r8', name: 'Rio → Petrópolis',      category: 'tourism',    transfers: 29,  revenue: 31200, avg_occupancy_pct: 79, avg_duration_min: 90, trend: 'down',   trend_pct: -8 },
];

export const mockDriverPerformance: DriverPerformanceStat[] = [
  { id: 'd1', name: 'João Silva',          initials: 'JS', transfers_completed: 87, punctuality_pct: 97, completion_pct: 99, avg_rating: 4.9, incidents: 0, km_total: 5840, rank: 1 },
  { id: 'd2', name: 'Ana Ferreira',        initials: 'AF', transfers_completed: 74, punctuality_pct: 95, completion_pct: 98, avg_rating: 4.8, incidents: 1, km_total: 4920, rank: 2 },
  { id: 'd3', name: 'Carlos Mendes',       initials: 'CM', transfers_completed: 68, punctuality_pct: 92, completion_pct: 97, avg_rating: 4.7, incidents: 1, km_total: 6110, rank: 3 },
  { id: 'd4', name: 'Marcus Vinicius',     initials: 'MV', transfers_completed: 61, punctuality_pct: 89, completion_pct: 96, avg_rating: 4.6, incidents: 2, km_total: 4380, rank: 4 },
  { id: 'd5', name: 'Pedro Rocha',         initials: 'PR', transfers_completed: 55, punctuality_pct: 88, completion_pct: 95, avg_rating: 4.5, incidents: 2, km_total: 3970, rank: 5 },
  { id: 'd6', name: 'Roberta Vasconcelos', initials: 'RV', transfers_completed: 49, punctuality_pct: 84, completion_pct: 93, avg_rating: 4.4, incidents: 3, km_total: 3200, rank: 6 },
];

export const mockVehicleUtilization: VehicleUtilizationStat[] = [
  { id: 'v1', name: 'Mercedes Vito',       plate: 'ABC-1D23', type: 'Van Premium',    capacity: 7,  transfers: 112, avg_occupancy_pct: 88, km_total: 8420, km_today: 180, maintenance_status: 'ok',        utilization_pct: 91 },
  { id: 'v2', name: 'Toyota Hiace',        plate: 'DEF-2E34', type: 'Minibus',        capacity: 12, transfers: 98,  avg_occupancy_pct: 82, km_total: 9100, km_today: 240, maintenance_status: 'ok',        utilization_pct: 87 },
  { id: 'v3', name: 'Sprinter Premium',    plate: 'GHI-3F45', type: 'Van Executiva',  capacity: 15, transfers: 76,  avg_occupancy_pct: 74, km_total: 7200, km_today: 95,  maintenance_status: 'due_soon',  utilization_pct: 79 },
  { id: 'v4', name: 'Van Executive',       plate: 'JKL-4G56', type: 'Van Executiva',  capacity: 9,  transfers: 61,  avg_occupancy_pct: 91, km_total: 5900, km_today: 310, maintenance_status: 'ok',        utilization_pct: 94 },
  { id: 'v5', name: 'Toyota Land Cruiser', plate: 'STU-9L01', type: 'SUV Premium',    capacity: 7,  transfers: 44,  avg_occupancy_pct: 86, km_total: 4100, km_today: 0,   maintenance_status: 'overdue',   utilization_pct: 68 },
  { id: 'v6', name: 'Mercedes C-Class',    plate: 'PQR-8K90', type: 'Sedan Premium',  capacity: 4,  transfers: 38,  avg_occupancy_pct: 78, km_total: 3400, km_today: 145, maintenance_status: 'ok',        utilization_pct: 73 },
];

export const mockRevenueByCategory: RevenueByCategoryItem[] = [
  { category: 'Aeroporto',   revenue: 128600, transfers: 388, pct: 42, color: '#0f766e' },
  { category: 'Turismo',     revenue: 196600, transfers: 190, pct: 38, color: '#1e3a5f' },
  { category: 'Corporativo', revenue: 28600,  transfers: 89,  pct: 9,  color: '#d97706' },
  { category: 'Hotel',       revenue: 34200,  transfers: 71,  pct: 11, color: '#78716c' },
];

export const mockHourlyPeaks: HourlyPeakStat[] = [
  { hour: '05h', transfers: 3  },
  { hour: '06h', transfers: 7  },
  { hour: '07h', transfers: 14 },
  { hour: '08h', transfers: 18 },
  { hour: '09h', transfers: 12 },
  { hour: '10h', transfers: 9  },
  { hour: '11h', transfers: 8  },
  { hour: '12h', transfers: 6  },
  { hour: '13h', transfers: 7  },
  { hour: '14h', transfers: 11 },
  { hour: '15h', transfers: 15 },
  { hour: '16h', transfers: 19 },
  { hour: '17h', transfers: 22 },
  { hour: '18h', transfers: 16 },
  { hour: '19h', transfers: 13 },
  { hour: '20h', transfers: 9  },
  { hour: '21h', transfers: 5  },
  { hour: '22h', transfers: 3  },
];

export const mockExecutiveSummary = {
  receita_total: 388000,
  receita_mes: 124600,
  receita_semana: 32400,
  transfers_realizados: 738,
  transfers_mes: 186,
  taxa_ocupacao_pct: 85,
  ticket_medio: 526,
  motoristas_ativos: 6,
  checkins_confirmados: 621,
  pagamentos_pendentes: 14800,
  crescimento_receita_pct: 18,
  crescimento_transfers_pct: 12,
};

export const mockMonthlyRevenue: { month: string; revenue: number; transfers: number }[] = [
  { month: 'Nov', revenue: 68200,  transfers: 112 },
  { month: 'Dez', revenue: 94100,  transfers: 148 },
  { month: 'Jan', revenue: 71400,  transfers: 121 },
  { month: 'Fev', revenue: 58900,  transfers: 98  },
  { month: 'Mar', revenue: 82300,  transfers: 136 },
  { month: 'Abr', revenue: 109500, transfers: 162 },
  { month: 'Mai', revenue: 124600, transfers: 186 },
];