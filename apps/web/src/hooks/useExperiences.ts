import { useQuery } from '@tanstack/react-query';
import { experiencesService } from '@/services/experiences';

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: () => experiencesService.list(),
  });
}

export function useExperience(id: string | undefined) {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => experiencesService.getById(id as string),
    enabled: !!id,
  });
}
