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
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId, reason }: { id: string; tenantId: string; reason?: string }) =>
      bookingService.cancel(id, tenantId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      tenantId,
      newSlotId,
      newScheduledAt,
      newScheduledEndAt,
      reason,
    }: {
      bookingId: string;
      tenantId: string;
      newSlotId: string;
      newScheduledAt: string;
      newScheduledEndAt: string;
      reason?: string;
    }) => bookingService.reschedule(bookingId, tenantId, newSlotId, newScheduledAt, newScheduledEndAt, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}
