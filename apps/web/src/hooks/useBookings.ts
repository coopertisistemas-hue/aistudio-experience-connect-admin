import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/bookings';
import type { BookingFilters, CreateHoldInput, BookingWithDetails } from '@/services/bookings';

export function useBookings(tenantId: string, filters?: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', tenantId, filters],
    queryFn: () => bookingService.list(tenantId, filters),
  });
}

export function useBooking(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['booking', id, tenantId],
    queryFn: () => bookingService.getById(id!, tenantId),
    enabled: !!id,
  });
}

export function useCreateBookingHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHoldInput) => bookingService.createHold(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      newSlotId,
      newScheduledAt,
      newScheduledEndAt,
      reason,
    }: {
      bookingId: string;
      newSlotId: string;
      newScheduledAt: string;
      newScheduledEndAt: string;
      reason?: string;
    }) => bookingService.reschedule(bookingId, newSlotId, newScheduledAt, newScheduledEndAt, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
