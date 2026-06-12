import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customers';

export function useCustomers(tenantId: string) {
  return useQuery({
    queryKey: ['customers', tenantId],
    queryFn: () => customerService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function useCustomer(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['customer', id, tenantId],
    queryFn: () => customerService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCustomerStats(tenantId: string) {
  return useQuery({
    queryKey: ['customer-stats', tenantId],
    queryFn: () => customerService.getStats(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}
