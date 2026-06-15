import { supabase } from '@/lib/supabase';

export interface Experience {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  category: string | null;
  is_active: boolean;
}

export const experiencesService = {
  async list(): Promise<{ data: Experience[]; total: number }> {
    const { data, error, count } = await supabase
      .from('routes')
      .select('*', { count: 'exact' })
      .eq('booking_type', 'experience')
      .order('name', { ascending: true });

    if (error) {
      console.error('[experiencesService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Experience[],
      total: count ?? 0,
    };
  },

  async getById(id: string): Promise<Experience | null> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[experiencesService.getById]', error);
      return null;
    }

    return data as unknown as Experience;
  },
};
