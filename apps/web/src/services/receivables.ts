import { supabase } from '@/lib/supabase';

export interface Receivable {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  bookings: {
    passenger_count: number;
    total_amount: number;
    routes: { name: string } | null;
  } | null;
}

export const receivablesService = {
  async list(): Promise<{ data: Receivable[]; total: number }> {
    const { data, error, count } = await supabase
      .from('payments')
      .select('*, bookings(passenger_count, total_amount, routes(name))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[receivablesService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Receivable[],
      total: count ?? 0,
    };
  },

  async markAsPaid(id: string): Promise<boolean> {
    const client = supabase as any;
    const { error } = await client
      .from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[receivablesService.markAsPaid]', error);
      return false;
    }

    return true;
  },
};
