import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import type { DashboardKPIData } from '@/services/dashboard';

export function useDashboardKPIs(tenantId: string) {
  return useQuery<DashboardKPIData>({
    queryKey: ['dashboard-kpis', tenantId],
    queryFn: () => dashboardService.getKPIs(tenantId),
    enabled: !!tenantId,
    refetchInterval: 60_000,
  });
}

export function useDashboardAlerts(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard-alerts', tenantId],
    queryFn: () => dashboardService.getAlerts(tenantId),
    enabled: !!tenantId,
    refetchInterval: 30_000,
  });
}

export function useDashboardRecentActivity(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard-recent-activity', tenantId],
    queryFn: () => dashboardService.getRecentActivity(tenantId),
    enabled: !!tenantId,
    refetchInterval: 30_000,
  });
}
