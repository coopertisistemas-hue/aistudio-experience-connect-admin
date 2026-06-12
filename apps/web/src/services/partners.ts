import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

export const partnerTypeLabels: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  agencia: 'Agência',
  guia: 'Guia',
  experiencia: 'Experiência',
  operador_turistico: 'Operador Turístico',
};

export interface PartnerDisplay {
  id: string;
  name: string;
  type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  country: string;
  experiences_count: number;
  bookings_generated: number;
  revenue_generated: number;
  status: string;
  notes: string;
  since: string;
  last_booking: string;
  tags: string[];
}

function mapToDisplay(row: PartnerRow, stats?: { experiences_count: number; bookings_generated: number; revenue_generated: number; last_booking: string }): PartnerDisplay {
  const tags = row.tags;
  const tagsArray = Array.isArray(tags) ? tags as string[] : [];

  return {
    id: row.id,
    name: row.name,
    type: row.partner_type,
    contact_name: row.contact_name || '',
    contact_email: row.contact_email || '',
    contact_phone: row.phone || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || 'Brasil',
    experiences_count: stats?.experiences_count ?? 0,
    bookings_generated: stats?.bookings_generated ?? 0,
    revenue_generated: stats?.revenue_generated ?? 0,
    status: row.status,
    notes: row.notes || '',
    since: row.created_at,
    last_booking: stats?.last_booking ?? '',
    tags: tagsArray,
  };
}

interface PartnerStats {
  experiences_count: number;
  bookings_generated: number;
  revenue_generated: number;
  last_booking: string;
}

const _from = (table: string) => supabase.from(table) as any;

async function computePartnerStats(partnerId: string, tenantId: string): Promise<PartnerStats> {
  const { count: routesCount } = await supabase
    .from('routes')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partnerId)
    .eq('tenant_id', tenantId);

  const { data: rawRoutes } = await _from('routes')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('tenant_id', tenantId);

  const routeIds: string[] = (rawRoutes || []).map((r: any) => r.id);
  let bookingsGenerated = 0;
  let revenueGenerated = 0;
  let lastBooking = '';

  if (routeIds.length > 0) {
    const { data: rawBookings } = await _from('bookings')
      .select('total_amount, scheduled_at')
      .in('route_id', routeIds)
      .eq('tenant_id', tenantId)
      .order('scheduled_at', { ascending: false });

    const bookingData: { total_amount: number; scheduled_at: string }[] = rawBookings || [];
    bookingsGenerated = bookingData.length;
    revenueGenerated = bookingData.reduce((s, b) => s + b.total_amount, 0);
    if (bookingData.length > 0) {
      lastBooking = bookingData[0].scheduled_at;
    }
  }

  return {
    experiences_count: routesCount ?? 0,
    bookings_generated: bookingsGenerated,
    revenue_generated: revenueGenerated,
    last_booking: lastBooking,
  };
}

export const partnerService = {
  async list(tenantId: string): Promise<PartnerDisplay[]> {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error || !partners) {
      console.error('[partnerService.list]', error);
      if (error) throw error;
      return [];
    }

    const partnerStats = await Promise.all(
      (partners as PartnerRow[]).map((p) => computePartnerStats(p.id, tenantId)),
    );

    return (partners as PartnerRow[]).map((p, i) => mapToDisplay(p, partnerStats[i]));
  },

  async getById(id: string, tenantId: string): Promise<PartnerDisplay | null> {
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !partner) {
      console.error('[partnerService.getById]', error);
      if (error) throw error;
      return null;
    }

    const stats = await computePartnerStats((partner as PartnerRow).id, tenantId);
    return mapToDisplay(partner as PartnerRow, stats);
  },

  async create(data: PartnerInsert): Promise<PartnerRow | null> {
    const { data: result, error } = await _from('partners')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('[partnerService.create]', error);
      throw error;
    }

    return result as PartnerRow;
  },

  async update(id: string, data: PartnerUpdate, tenantId: string): Promise<PartnerRow | null> {
    const { data: result, error } = await _from('partners')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('[partnerService.update]', error);
      throw error;
    }

    return result as PartnerRow;
  },

  async delete(id: string, tenantId: string): Promise<boolean> {
    const { error } = await _from('partners')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) {
      console.error('[partnerService.delete]', error);
      throw error;
    }

    return true;
  },
};
