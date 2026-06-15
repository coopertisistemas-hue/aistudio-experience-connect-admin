import { useQuery } from '@tanstack/react-query';
import { transfersService } from '@/services/transfers';

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => transfersService.list(),
  });
}

export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: ['transfer', id],
    queryFn: () => transfersService.getById(id as string),
    enabled: !!id,
  });
}
