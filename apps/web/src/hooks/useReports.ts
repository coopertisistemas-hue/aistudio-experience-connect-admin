import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports';

export function useExecutiveSummary(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'executive-summary', tenantId],
    queryFn: () => reportsService.getExecutiveSummary(tenantId),
    enabled: !!tenantId,
  });
}

export function useDailyStats(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'daily-stats', tenantId],
    queryFn: () => reportsService.getDailyStats(tenantId),
    enabled: !!tenantId,
  });
}

export function useRouteAnalytics(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'route-analytics', tenantId],
    queryFn: () => reportsService.getRouteAnalytics(tenantId),
    enabled: !!tenantId,
  });
}

export function useDriverPerformance(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'driver-performance', tenantId],
    queryFn: () => reportsService.getDriverPerformance(tenantId),
    enabled: !!tenantId,
  });
}

export function useVehicleUtilization(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'vehicle-utilization', tenantId],
    queryFn: () => reportsService.getVehicleUtilization(tenantId),
    enabled: !!tenantId,
  });
}

export function useRevenueByCategory(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'revenue-by-category', tenantId],
    queryFn: () => reportsService.getRevenueByCategory(tenantId),
    enabled: !!tenantId,
  });
}

export function useMonthlyRevenue(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'monthly-revenue', tenantId],
    queryFn: () => reportsService.getMonthlyRevenue(tenantId),
    enabled: !!tenantId,
  });
}

export function useHourlyPeaks(tenantId: string) {
  return useQuery({
    queryKey: ['reports', 'hourly-peaks', tenantId],
    queryFn: () => reportsService.getHourlyPeaks(tenantId),
    enabled: !!tenantId,
  });
}
