import { supabase } from '@/lib/supabase';

export type BookingStatus = 'draft' | 'hold_created' | 'payment_pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'refunded';

export interface TransferItem {
  id: string;
  reference: string;
  tenant_id: string;
  route_name: string;
  origin: string;
  destination: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_initials: string | null;
  driver_phone: string | null;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_type: string;
  capacity: number;
  scheduled_at: string;
  duration_min: number;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_count: number;
  status: BookingStatus;
  notes: string | null;
  total_amount: number;
  booking_reference: string | null;
}

function makeInitials(name: string): string {
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
}

function toTransferItem(r: Record<string, unknown>): TransferItem {
  const row = r as { [key: string]: any };
  return {
    id: row.id,
    reference: `#${row.id?.slice(0, 8) ?? ''}`,
    tenant_id: row.tenant_id ?? '',
    route_name: row.routes?.name ?? '—',
    origin: row.pickup_location || row.routes?.origin || '—',
    destination: row.dropoff_location || row.routes?.destination || '—',
    driver_id: row.driver_id ?? null,
    driver_name: row.drivers?.name ?? null,
    driver_initials: row.drivers?.name ? makeInitials(row.drivers.name) : null,
    driver_phone: row.drivers?.phone ?? null,
    vehicle_name: row.vehicles?.name ?? '—',
    vehicle_plate: row.vehicles?.plate ?? '',
    vehicle_type: row.vehicles?.type ?? '',
    capacity: row.vehicles?.capacity ?? 4,
    scheduled_at: row.scheduled_at ?? '',
    duration_min: row.routes?.duration_min ?? 0,
    passenger_name: row.users?.full_name ?? '—',
    passenger_email: row.users?.email ?? '',
    passenger_phone: row.users?.phone ?? '',
    passenger_count: row.passenger_count ?? 1,
    status: row.status ?? 'draft',
    notes: row.notes ?? null,
    total_amount: row.total_amount ?? 0,
    booking_reference: row.idempotency_key ?? null,
  };
}

export const transfersService = {
  async list(): Promise<{ data: TransferItem[]; total: number }> {
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination, duration_min), drivers(name, phone), vehicles(name, plate, type, capacity), users(full_name, email, phone)')
      .eq('booking_type', 'transfer')
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('[transfersService.list]', error);
      return { data: [], total: 0 };
    }

    const items = ((data ?? []) as Record<string, unknown>[]).map(toTransferItem);
    return { data: items, total: count ?? 0 };
  },

  async getById(id: string): Promise<TransferItem | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination, duration_min), drivers(name, phone), vehicles(name, plate, type, capacity), users(full_name, email, phone)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[transfersService.getById]', error);
      return null;
    }

    return toTransferItem(data as unknown as Record<string, unknown>);
  },
};
