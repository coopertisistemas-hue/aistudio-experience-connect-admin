import { useQuery } from '@tanstack/react-query';
import { agendaService } from '@/services/agenda';

export function useAgenda(tenantId: string, date: string) {
  return useQuery({
    queryKey: ['agenda', tenantId, date],
    queryFn: () => agendaService.listByDate(tenantId, date),
    enabled: !!tenantId && !!date,
  });
}

export function useAgendaDrivers(tenantId: string) {
  return useQuery({
    queryKey: ['agenda-drivers', tenantId],
    queryFn: () => agendaService.listDrivers(tenantId),
    enabled: !!tenantId,
  });
}
