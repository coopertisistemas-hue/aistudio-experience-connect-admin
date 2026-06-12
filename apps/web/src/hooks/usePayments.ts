import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payments';
import type { PaymentFilters, ManualPaymentInput, PaymentWithDetails } from '@/services/payments';

export function usePayments(tenantId: string, filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', tenantId, filters],
    queryFn: () => paymentService.list(tenantId, filters),
  });
}

export function usePayment(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: ['payment', id, tenantId],
    queryFn: () => paymentService.getById(id!, tenantId),
    enabled: !!id,
  });
}

export function useCreatePaymentPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingHoldId: string) => paymentService.createPreference(bookingHoldId),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
      }
    },
  });
}

export function useRecordManualPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManualPaymentInput) => paymentService.recordManual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function usePaymentStats(tenantId: string) {
  return useQuery({
    queryKey: ['paymentStats', tenantId],
    queryFn: () => paymentService.getStats(tenantId),
  });
}
