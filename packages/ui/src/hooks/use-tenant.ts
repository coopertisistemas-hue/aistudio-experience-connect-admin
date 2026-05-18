import { createContext, useContext } from 'react';
import type { TenantId } from '@connect/core/tenant';

export interface TenantContextValue {
  tenantId: TenantId | null;
  organizationSlug: string | null;
  isLoading: boolean;
}

export const TenantContext = createContext<TenantContextValue>({
  tenantId: null,
  organizationSlug: null,
  isLoading: true,
});

/**
 * Hook para acessar o tenant atual.
 * Sempre use em páginas multi-tenant para garantir escopo correto.
 */
export function useTenant(): TenantContextValue {
  return useContext(TenantContext);
}
