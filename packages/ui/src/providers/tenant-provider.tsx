import { useState, useEffect, useMemo } from 'react';
import { TenantContext } from '../hooks/use-tenant';
import type { TenantContextValue } from '../hooks/use-tenant';
import type { TenantId } from '@connect/core/tenant';
import type { ReactNode } from 'react';

export interface TenantProviderProps {
  children: ReactNode;
  /** Tenant inicial (ex: vindo de URL ou localStorage) */
  initialTenantId?: TenantId;
  /** Resolver slug → tenant_id (próxima fase: via Supabase) */
  resolveTenant?: (slug: string) => Promise<TenantId | null>;
}

/**
 * Provider de contexto para tenant atual.
 * Deve envolver o AppShell para que todas as rotas/admin tenham acesso ao tenant.
 *
 * Próxima fase:
 * - Buscar tenant_id do perfil do usuário logado
 * - Suportar switch de organização
 * - Persistir seleção no localStorage
 */
export function TenantProvider({ children, initialTenantId }: TenantProviderProps) {
  const [tenantId] = useState<TenantId | null>(initialTenantId ?? null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Stub: próxima fase buscará do Supabase / user_tenants
    setIsLoading(false);
  }, []);

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      organizationSlug: tenantId,
      isLoading,
    }),
    [tenantId, isLoading]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
