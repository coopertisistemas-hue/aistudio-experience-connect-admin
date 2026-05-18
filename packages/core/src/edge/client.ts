import type { SupabaseClient } from '../supabase/client';

/**
 * Invoca uma Edge Function do Supabase com tipagem e headers de auth.
 *
 * @example
 * const result = await invokeEdgeFunction(supabase, 'payments/process', {
 *   booking_id: '123',
 *   amount: 50000,
 * });
 */
export async function invokeEdgeFunction<T = unknown>(
  client: SupabaseClient,
  functionName: string,
  body?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await client.functions.invoke<T>(functionName, { body });
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
