import { useQuery } from '@tanstack/react-query';

import { publicRoutesService, type RouteFilters, type RouteWithCategory } from '@/services/routes';

export function usePublicRoutes(filters?: RouteFilters) {
  return useQuery<RouteWithCategory[], Error>({
    queryKey: ['public-routes', filters],
    queryFn: () => publicRoutesService.list(filters),
    staleTime: 1000 * 60 * 5,
  });
}
