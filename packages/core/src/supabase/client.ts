import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Factory para criar um cliente Supabase tipado.
 * Cada app deve chamar esta função com suas próprias variáveis de ambiente.
 *
 * @example
 * const supabase = createSupabaseClient(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY
 * );
 */
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      '[@connect/core] Missing Supabase URL or Anon Key. Pass valid credentials to createSupabaseClient().'
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}
