import { supabase } from '@/lib/supabase';

export interface Slot {
  id: string;
  vehicle_id: string;
  status: string;
  held_seats: number;
  reserved_seats: number;
  remaining_seats: number;
  seat_count: number;
  start_time: string;
  end_time: string;
  vehicles: { name: string; plate: string; type: string } | null;
  routes: { name: string; origin: string; destination: string } | null;
}

export const availabilityService = {
  async list(): Promise<{ data: Slot[]; total: number }> {
    const { data, error, count } = await supabase
      .from('vehicle_slots')
      .select('*, vehicles(name, plate, type), routes(name, origin, destination)', { count: 'exact' })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[availabilityService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Slot[],
      total: count ?? 0,
    };
  },
};
