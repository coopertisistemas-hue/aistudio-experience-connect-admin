import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '@/services/partners';

export function usePartners(tenantId: string) {
  return useQuery({
    queryKey: ['partners', tenantId],
    queryFn: () => partnerService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function usePartner(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['partner', id, tenantId],
    queryFn: () => partnerService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => partnerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, tenantId }: { id: string; data: any; tenantId: string }) =>
      partnerService.update(id, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) =>
      partnerService.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}
