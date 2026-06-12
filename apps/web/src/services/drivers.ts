import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type DriverRow = Database['public']['Tables']['drivers']['Row'];

export interface DriverDisplay {
  id: string;
  tenant_id: string;
  user_id: string | null;
  full_name: string;
  initials: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  license_type: string;
  role: string;
  status: string;
  joined_at: string;
  assigned_vehicle: string | null;
  assigned_vehicle_plate: string | null;
  assigned_vehicle_type: string | null;
  vehicle_capacity: number | null;
  transfers_today: number;
  transfers_total: number;
  last_activity: string | null;
  today_transfers: any[];
  performance: any;
  availability: any[];
  app_installed: boolean;
  app_last_login: string | null;
  app_device: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const driverService = {
  async list(tenantId: string): Promise<DriverDisplay[]> {
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        *,
        users!drivers_user_id_fkey(*),
        vehicles!drivers_default_vehicle_id_fkey(*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error || !drivers) {
      console.error('[driverService.list]', error);
      return [];
    }

    return (drivers as any[]).map(mapToDisplay);
  },

  async getById(id: string, tenantId: string): Promise<DriverDisplay | null> {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        users!drivers_user_id_fkey(*),
        vehicles!drivers_default_vehicle_id_fkey(*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      console.error('[driverService.getById]', error);
      return null;
    }

    return mapToDisplay(data as any);
  },

  async create(data: any, tenantId: string): Promise<DriverRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('drivers')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      console.error('[driverService.create]', error);
      return null;
    }

    return result;
  },

  async update(id: string, data: any, tenantId: string): Promise<DriverRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('drivers')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('[driverService.update]', error);
      return null;
    }

    return result;
  },

  async delete(id: string, tenantId: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('drivers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) {
      console.error('[driverService.delete]', error);
      return false;
    }

    return true;
  },
};

function mapToDisplay(row: any): DriverDisplay {
  const user = row.users || null;
  const vehicle = row.vehicles || null;

  function initials(name: string): string {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    full_name: row.name,
    initials: initials(row.name || '?'),
    email: user?.email || null,
    phone: row.phone,
    avatar_url: null,
    license_type: row.license_type || 'B',
    role: 'driver',
    status: row.status || 'available',
    joined_at: row.created_at,
    assigned_vehicle: vehicle?.name || null,
    assigned_vehicle_plate: vehicle?.plate || null,
    assigned_vehicle_type: vehicle?.type || null,
    vehicle_capacity: vehicle?.capacity || null,
    transfers_today: 0,
    transfers_total: 0,
    last_activity: null,
    today_transfers: [],
    performance: {
      acceptance_rate: 0,
      completion_rate: 0,
      on_time_rate: 0,
      avg_rating: 0,
      transfers_this_month: 0,
      transfers_this_week: 0,
      incidents: 0,
    },
    availability: [],
    app_installed: false,
    app_last_login: null,
    app_device: null,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
