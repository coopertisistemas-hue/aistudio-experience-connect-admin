import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/drivers';

export function useDrivers(tenantId: string) {
  return useQuery({
    queryKey: ['drivers', tenantId],
    queryFn: () => driverService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function useDriver(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['driver', id, tenantId],
    queryFn: () => driverService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, tenantId }: { data: any; tenantId: string }) => driverService.create(data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, tenantId }: { id: string; data: any; tenantId: string }) =>
      driverService.update(id, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) => driverService.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
