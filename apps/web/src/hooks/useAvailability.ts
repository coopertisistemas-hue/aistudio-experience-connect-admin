import { useQuery } from '@tanstack/react-query';
import { availabilityService } from '@/services/availability';

export function useAvailability() {
  return useQuery({
    queryKey: ['availability'],
    queryFn: () => availabilityService.list(),
  });
}
