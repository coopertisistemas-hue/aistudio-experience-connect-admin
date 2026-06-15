import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  booking_id: string | null;
}

export const notificationsService = {
  async list(): Promise<{ data: Notification[]; total: number }> {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('[notificationsService.list] Table not found. Returning empty.');
        return { data: [], total: 0 };
      }
      console.error('[notificationsService.list]', error);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as unknown as Notification[],
      total: count ?? 0,
    };
  },

  async markAsRead(id: string): Promise<boolean> {
    const client = supabase as any;
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('[notificationsService.markAsRead]', error);
      return false;
    }

    return true;
  },
};
