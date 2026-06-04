import { useMemo } from 'react';
import { createSupabaseClient, type SupabaseClient } from '@connect/core/supabase';

/**
 * @deprecated S1.2 — This hook creates a new Supabase client instance on every
 * unique (url, anonKey) pair. Multiple instances lead to duplicate auth state
 * machines, token refresh timers, and potential listener leaks.
 *
 * Recommended: create ONE client singleton in your app (e.g., apps/web/src/lib/supabase.ts)
 * and pass it via React context or props. Do NOT use this hook in new code.
 * It will be removed in a future phase.
 */
export function useSupabase(url: string, anonKey: string): SupabaseClient {
  if (typeof window !== 'undefined') {
    console.warn(
      '[@connect/ui] useSupabase is deprecated. ' +
        'Use a single canonical Supabase client instance instead. ' +
        'See S1.2 Supabase Client Unification spec.'
    );
  }
  return useMemo(() => createSupabaseClient(url, anonKey), [url, anonKey]);
}
