import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

export interface VehicleDisplay {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  plate: string | null;
  make: string;
  model: string | null;
  year: number;
  color: string | null;
  capacity: number;
  photo_url: string | null;
  status: string;
  default_driver_id: string | null;
  assigned_driver: string | null;
  assigned_driver_phone: string | null;
  assigned_driver_initials: string;
  notes: string | null;
  km_total: number;
  km_today: number;
  transfers_today: number;
  transfers_total: number;
  current_occupancy: number;
  maintenance_status: string;
  last_service: string;
  next_service: string;
  last_service_km: number;
  next_service_km: number;
  maintenance_notes: string | null;
  last_activity: string | null;
  today_transfers: any[];
  timeline: any[];
  maintenance_history: any[];
  created_at: string;
  updated_at: string;
}

export const vehicleService = {
  async list(tenantId: string): Promise<VehicleDisplay[]> {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        drivers!vehicles_default_driver_id_fkey(*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error || !vehicles) {
      console.error('[vehicleService.list]', error);
      return [];
    }

    return (vehicles as any[]).map(mapToDisplay);
  },

  async getById(id: string, tenantId: string): Promise<VehicleDisplay | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        drivers!vehicles_default_driver_id_fkey(*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      console.error('[vehicleService.getById]', error);
      return null;
    }

    return mapToDisplay(data as any);
  },

  async create(data: any): Promise<VehicleRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('vehicles')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('[vehicleService.create]', error);
      return null;
    }

    return result;
  },

  async update(id: string, data: any): Promise<VehicleRow | null> {
    const { data: result, error } = await (supabase as any)
      .from('vehicles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[vehicleService.update]', error);
      return null;
    }

    return result;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[vehicleService.delete]', error);
      return false;
    }

    return true;
  },
};

function mapToDisplay(row: any): VehicleDisplay {
  const driver = row.drivers || null;
  const driverName = driver?.name || null;
  const driverPhone = driver?.phone || null;

  function initials(name: string | null): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    type: row.type,
    plate: row.plate,
    make: row.make || row.model?.split(' ')[0] || '',
    model: row.model,
    year: row.year || 2024,
    color: row.color,
    capacity: row.capacity,
    photo_url: row.photo_url,
    status: row.status || 'available',
    default_driver_id: row.default_driver_id,
    assigned_driver: driverName,
    assigned_driver_phone: driverPhone,
    assigned_driver_initials: initials(driverName),
    notes: row.notes,
    km_total: 0,
    km_today: 0,
    transfers_today: 0,
    transfers_total: 0,
    current_occupancy: 0,
    maintenance_status: 'ok',
    last_service: new Date().toISOString(),
    next_service: new Date(Date.now() + 90 * 86400000).toISOString(),
    last_service_km: 0,
    next_service_km: 5000,
    maintenance_notes: null,
    last_activity: null,
    today_transfers: [],
    timeline: [],
    maintenance_history: [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
