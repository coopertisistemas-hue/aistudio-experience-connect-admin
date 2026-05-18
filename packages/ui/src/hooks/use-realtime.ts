import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@connect/core/supabase';
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from '@supabase/supabase-js';

export type TableChangeEvent<T extends Record<string, unknown>> = RealtimePostgresChangesPayload<T>;

export interface UseRealtimeOptions<T extends Record<string, unknown>> {
  table: string;
  schema?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onChange: (payload: TableChangeEvent<T>) => void;
}

/**
 * Hook genérico para subscription realtime do Supabase.
 * Automaticamente unsubscribe on unmount.
 *
 * @example
 * useRealtime(supabase, {
 *   table: 'bookings',
 *   event: 'INSERT',
 *   onChange: (payload) => addBooking(payload.new),
 * });
 */
export function useRealtime<T extends Record<string, unknown>>(
  client: SupabaseClient | null,
  options: UseRealtimeOptions<T>
): void {
  const { table, schema = 'public', event = '*', filter, onChange } = options;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!client) return;

    const channel: RealtimeChannel = client.channel(`realtime:${table}`);

    // Type assertion necessária porque event é union runtime;
    // os overloads do Supabase esperam literais de enum em tempo de compilação.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channel.on as any)(
      'postgres_changes',
      { event, schema, table, filter },
      (payload: unknown) => onChangeRef.current(payload as TableChangeEvent<T>)
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [client, table, schema, event, filter]);
}
