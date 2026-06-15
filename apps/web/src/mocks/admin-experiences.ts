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

export const mockExperiences: any[] = [];

// ─── Partners ─────────────────────────────────────────────────────────────────

export const mockPartners: any[] = [];

// ─── Categories ───────────────────────────────────────────────────────────────

export const mockCategories: any[] = [];

// ─── Summary Stats ────────────────────────────────────────────────────────────

export const mockExperienceStats: any = { today_total: 0, active: 0, high_demand: 0, paused: 0, draft: 0, unavailable: 0, bookings_this_month: 0, total_revenue: 0 };

export const statusLabels: Record<ExperienceStatus, string> = {} as any;

export const partnerTypeLabels: Record<PartnerType, string> = {} as any;

export const demandLabels: Record<DemandLevel, string> = {} as any;