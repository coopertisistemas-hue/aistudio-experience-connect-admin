import { useMemo } from 'react';
import { createSupabaseClient, type SupabaseClient } from '@connect/core/supabase';

/**
 * Hook para obter uma instância estável do cliente Supabase.
 * Recomendado: criar o cliente uma vez no app root e passar via context.
 * Este hook é um fallback para apps que não usam TenantProvider.
 */
export function useSupabase(url: string, anonKey: string): SupabaseClient {
  return useMemo(() => createSupabaseClient(url, anonKey), [url, anonKey]);
}
