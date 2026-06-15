import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receivablesService } from '@/services/receivables';

export function useReceivables() {
  return useQuery({
    queryKey: ['receivables'],
    queryFn: () => receivablesService.list(),
  });
}

export function useMarkReceivablePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => receivablesService.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
