import { useQuery, useMutation } from '@tanstack/react-query';

import { publicBookingService, type GuestHoldInput, type BookingStatusData } from '@/services/booking';

export function useCreateBookingHold() {
  return useMutation({
    mutationFn: (input: GuestHoldInput) => publicBookingService.createHold(input),
  });
}

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (holdId: string) => publicBookingService.createPreference(holdId),
  });
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: (bookingId: string) => publicBookingService.cancelBooking(bookingId),
  });
}

export function usePublicBooking(bookingId: string | null) {
  return useQuery<BookingStatusData | null, Error>({
    queryKey: ['public-booking', bookingId],
    queryFn: () => publicBookingService.getBooking(bookingId!),
    enabled: !!bookingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      if (data.status === 'payment_pending' || data.status === 'hold_created') return 5000;
      return false;
    },
    staleTime: 2000,
  });
}
