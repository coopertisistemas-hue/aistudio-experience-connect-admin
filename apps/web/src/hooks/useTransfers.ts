import { useQuery } from '@tanstack/react-query';
import { transfersService } from '@/services/transfers';

export function useTransfers(tenantId?: string) {
  return useQuery({
    queryKey: ['transfers', tenantId],
    queryFn: () => transfersService.list(),
    enabled: true,
  });
}

export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: ['transfer', id],
    queryFn: () => transfersService.getById(id as string),
    enabled: !!id,
  });
}
