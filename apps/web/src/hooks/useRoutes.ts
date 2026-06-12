import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routeService } from '@/services/routes';

export function useRoutes(tenantId: string) {
  return useQuery({
    queryKey: ['routes', tenantId],
    queryFn: () => routeService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function useRoute(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['route', id, tenantId],
    queryFn: () => routeService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, tenantId }: { data: any; tenantId: string }) => routeService.create(data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, tenantId }: { id: string; data: any; tenantId: string }) =>
      routeService.update(id, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) => routeService.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
