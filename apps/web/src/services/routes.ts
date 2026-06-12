import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type RouteRow = Database['public']['Tables']['routes']['Row'];
type RouteCategoryRow = Database['public']['Tables']['route_categories']['Row'];

export interface RouteDisplay {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  category_name: string;
  origin_name: string | null;
  origin_detail: string | null;
  destination_name: string | null;
  destination_detail: string | null;
  distance_km: number | null;
  duration_min: number | null;
  base_price: number;
  is_active: boolean;
  status: string;
  transfers_today: number;
  transfers_this_month: number;
  transfers_total: number;
  avg_occupancy_pct: number;
  demand_level: string;
  revenue_this_month: number;
  revenue_total: number;
  avg_ticket: number;
  preferred_vehicle_types: string[];
  associated_drivers: string[];
  today_transfers: any[];
  monthly_history: any[];
  notes: string | null;
  created_at: string;
  last_used: string | null;
}

export const routeService = {
  async list(tenantId: string): Promise<RouteDisplay[]> {
    const { data: routes, error } = await supabase
      .from('routes')
      .select(`
        *,
        route_categories!routes_category_id_fkey(*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error || !routes) {
      console.error('[routeService.list]', error);
      return [];
    }

    return (routes as any[]).map((row) => {
      const r = row as RouteRow;
      const cat = row.route_categories as RouteCategoryRow | null;
      return {
        id: r.id,
        tenant_id: r.tenant_id,
        name: r.name,
        category: cat?.slug || 'transfer',
        category_name: cat?.name || 'Transfer',
        origin_name: r.origin,
        origin_detail: null,
        destination_name: r.destination,
        destination_detail: null,
        distance_km: r.distance_km,
        duration_min: r.duration_min,
        base_price: r.base_price,
        is_active: r.is_active,
        status: r.is_active ? 'active' : 'inactive',
        transfers_today: 0,
        transfers_this_month: 0,
        transfers_total: 0,
        avg_occupancy_pct: 0,
        demand_level: 'medium',
        revenue_this_month: 0,
        revenue_total: 0,
        avg_ticket: r.base_price,
        preferred_vehicle_types: [],
        associated_drivers: [],
        today_transfers: [],
        monthly_history: [],
        notes: r.operational_notes,
        created_at: r.created_at,
        last_used: null,
      };
    });
  },

  async getById(id: string, tenantId: string): Promise<RouteDisplay | null> {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        route_categories!routes_category_id_fkey(*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      console.error('[routeService.getById]', error);
      return null;
    }

    const row = data as any;
    const r = row as RouteRow;
    const cat = row.route_categories as RouteCategoryRow | null;
    return {
      id: r.id,
      tenant_id: r.tenant_id,
      name: r.name,
      category: cat?.slug || 'transfer',
      category_name: cat?.name || 'Transfer',
      origin_name: r.origin,
      origin_detail: null,
      destination_name: r.destination,
      destination_detail: null,
      distance_km: r.distance_km,
      duration_min: r.duration_min,
      base_price: r.base_price,
      is_active: r.is_active,
      status: r.is_active ? 'active' : 'inactive',
      transfers_today: 0,
      transfers_this_month: 0,
      transfers_total: 0,
      avg_occupancy_pct: 0,
      demand_level: 'medium',
      revenue_this_month: 0,
      revenue_total: 0,
      avg_ticket: r.base_price,
      preferred_vehicle_types: [],
      associated_drivers: [],
      today_transfers: [],
      monthly_history: [],
      notes: r.operational_notes,
      created_at: r.created_at,
      last_used: null,
    };
  },

  async create(data: any): Promise<RouteRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('routes')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('[routeService.create]', error);
      return null;
    }

    return result;
  },

  async update(id: string, data: any): Promise<RouteRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('routes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[routeService.update]', error);
      return null;
    }

    return result;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[routeService.delete]', error);
      return false;
    }

    return true;
  },
};
