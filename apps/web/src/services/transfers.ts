import { supabase } from '@/lib/supabase';

export interface Transfer {
  id: string;
  tenant_id: string;
  booking_type: string;
  status: string;
  scheduled_at: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  passenger_count: number;
  seat_count: number;
  total_amount: number;
  routes: {
    name: string;
    origin: string;
    destination: string;
  } | null;
  drivers: {
    name: string;
  } | null;
  vehicles: {
    name: string;
    plate: string;
  } | null;
}

export const transfersService = {
  async list(): Promise<{ data: Transfer[]; total: number }> {
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination), drivers(name), vehicles(name, plate)', { count: 'exact' })
      .eq('booking_type', 'transfer')
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('[transfersService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Transfer[],
      total: count ?? 0,
    };
  },

  async getById(id: string): Promise<Transfer | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination), drivers(name), vehicles(name, plate)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[transfersService.getById]', error);
      return null;
    }

    return data as unknown as Transfer;
  },
};
