import { createSupabaseClient } from '@connect/core/supabase';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[@connect/web] Missing Supabase environment variables. ' +
      'Ensure VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Canonical Supabase client singleton for @connect/web.
 * Created via @connect/core factory to ensure consistent auth options
 * (autoRefreshToken, persistSession, detectSessionInUrl).
 *
 * All Supabase auth/data operations in apps/web should import from here.
 * Do NOT create additional Supabase client instances in the web app.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
