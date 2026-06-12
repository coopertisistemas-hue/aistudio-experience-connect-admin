import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categories';

export function useCategories(tenantId: string) {
  return useQuery({
    queryKey: ['categories', tenantId],
    queryFn: () => categoryService.list(tenantId),
    enabled: !!tenantId,
  });
}

export function useCategory(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['category', id, tenantId],
    queryFn: () => categoryService.getById(id!, tenantId),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, tenantId }: { id: string; data: any; tenantId: string }) =>
      categoryService.update(id, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) =>
      categoryService.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
