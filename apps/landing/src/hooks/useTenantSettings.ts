import { useQuery } from '@tanstack/react-query';
import { tenantService } from '@/services/tenant';

export function useTenantSettings(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: () => tenantService.getSettings(tenantId as string),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}
