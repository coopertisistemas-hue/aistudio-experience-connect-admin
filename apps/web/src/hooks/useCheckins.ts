import { useQuery } from '@tanstack/react-query';
import { checkinsService } from '@/services/checkins';

export function useCheckins() {
  return useQuery({
    queryKey: ['checkins'],
    queryFn: () => checkinsService.list(),
  });
}

export function useCheckin(id: string | undefined) {
  return useQuery({
    queryKey: ['checkin', id],
    queryFn: () => checkinsService.getById(id as string),
    enabled: !!id,
  });
}
