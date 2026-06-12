import { useQuery } from '@tanstack/react-query';

import {
  publicRoutesService,
  type AvailabilityResult,
  type RouteFilters,
  type RouteWithCategory,
} from '@/services/routes';

export function usePublicRoutes(filters?: RouteFilters) {
  return useQuery<RouteWithCategory[], Error>({
    queryKey: ['public-routes', filters],
    queryFn: () => publicRoutesService.list(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePublicRoute(slug: string) {
  return useQuery<RouteWithCategory | null, Error>({
    queryKey: ['public-route', slug],
    queryFn: () => publicRoutesService.getBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRouteAvailability(date: string | null) {
  return useQuery<AvailabilityResult, Error>({
    queryKey: ['route-availability', date],
    queryFn: () => publicRoutesService.getAvailability(date!),
    enabled: !!date,
    staleTime: 1000 * 60 * 2,
  });
}
