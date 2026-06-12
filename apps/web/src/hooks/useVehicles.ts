import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles';

export function useVehicles(tenantId: string) {
  return useQuery({
    queryKey: ['vehicles', tenantId],
    queryFn: () => vehicleService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function useVehicle(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['vehicle', id, tenantId],
    queryFn: () => vehicleService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof vehicleService.create>[0]) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof vehicleService.update>[1] }) =>
      vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) => vehicleService.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
