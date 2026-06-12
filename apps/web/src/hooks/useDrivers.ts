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
    mutationFn: (data: Parameters<typeof driverService.create>[0]) => driverService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof driverService.update>[1] }) =>
      driverService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driverService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
