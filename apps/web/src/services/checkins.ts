import { supabase } from '@/lib/supabase';

export interface Checkin {
  id: string;
  status: string;
  scheduled_at: string;
  passenger_count: number;
  routes: { name: string; origin: string; destination: string } | null;
  drivers: { name: string } | null;
  vehicles: { name: string; plate: string } | null;
}

export const checkinsService = {
  async list(): Promise<{ data: Checkin[]; total: number }> {
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination), drivers(name), vehicles(name, plate)', { count: 'exact' })
      .in('status', ['confirmed', 'in_progress'])
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('[checkinsService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Checkin[],
      total: count ?? 0,
    };
  },

  async getById(id: string): Promise<Checkin | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, routes(name, origin, destination), drivers(name), vehicles(name, plate)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[checkinsService.getById]', error);
      return null;
    }

    return data as unknown as Checkin;
  },
};
