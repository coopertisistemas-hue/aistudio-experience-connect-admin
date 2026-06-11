import { useState, useEffect, useMemo, useCallback } from 'react';
import { TenantContext } from '../hooks/use-tenant';
import type { TenantContextValue } from '../hooks/use-tenant';
import type { TenantId } from '@connect/core/tenant';
import type { ReactNode } from 'react';
import type { SupabaseClient } from '@connect/core/supabase';
import type { User } from '@supabase/supabase-js';

export interface TenantProviderProps {
  children: ReactNode;
  /** Cliente Supabase para consultar user_tenants */
  supabase: SupabaseClient;
  /** Tenant inicial (ex: vindo de URL ou localStorage) */
  initialTenantId?: TenantId;
  /** Usuário logado (do AuthContext) */
  user?: User | null;
}

interface UserTenantRow {
  tenant_id: TenantId;
  role: string;
}

/**
 * Provider de contexto para tenant atual.
 * Resolve tenant_id e role do usuário logado via Supabase (tabela user_tenants).
 * Deve envolver o AppShell para que todas as rotas/admin tenham acesso ao tenant.
 */
export function TenantProvider({
  children,
  supabase,
  initialTenantId,
  user,
}: TenantProviderProps) {
  const [tenantId, setTenantId] = useState<TenantId | null>(initialTenantId ?? null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveUserTenant = useCallback(
    async (currentUser: User | null): Promise<{ tenantId: TenantId | null; role: string | null }> => {
      if (!currentUser) {
        return { tenantId: null, role: null };
      }

      const { data, error } = await supabase
        .from('user_tenants')
        .select('tenant_id, role')
        .eq('user_id', currentUser.id)
        .single();

      if (error || !data) {
        console.error('[TenantProvider] Failed to resolve tenant:', error?.message);
        return { tenantId: null, role: null };
      }

      const row = data as UserTenantRow;
      return { tenantId: row.tenant_id, role: row.role };
    },
    [supabase]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      if (user) {
        const result = await resolveUserTenant(user);
        if (!cancelled) {
          setTenantId(result.tenantId);
          setUserRole(result.role);
        }
      } else {
        if (!cancelled) {
          setTenantId(initialTenantId ?? null);
          setUserRole(null);
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, initialTenantId, resolveUserTenant]);

  const organizationSlug = useMemo(() => tenantId, [tenantId]);

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      organizationSlug,
      userRole,
      isLoading,
    }),
    [tenantId, organizationSlug, userRole, isLoading]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
