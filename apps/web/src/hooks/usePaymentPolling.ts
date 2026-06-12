import { useState, useEffect, useRef, useCallback } from 'react';
import { paymentService } from '@/services/payments';
import type { PaymentWithDetails } from '@/services/payments';
import type { PaymentStatus } from '@connect/core';

interface UsePaymentPollingOptions {
  paymentId: string | null;
  tenantId: string;
  intervalMs?: number;
  onStatusChange?: (status: PaymentStatus, previous: PaymentStatus | null) => void;
}

interface UsePaymentPollingReturn {
  payment: PaymentWithDetails | null;
  status: PaymentStatus | null;
  isLoading: boolean;
  error: string | null;
  stop: () => void;
  retry: () => void;
}

const TERMINAL_STATUSES: PaymentStatus[] = ['completed', 'failed', 'refunded', 'cancelled'];

export function usePaymentPolling({
  paymentId,
  tenantId,
  intervalMs = 5000,
  onStatusChange,
}: UsePaymentPollingOptions): UsePaymentPollingReturn {
  const [payment, setPayment] = useState<PaymentWithDetails | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<PaymentStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchPayment = useCallback(async () => {
    if (!paymentId || !tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentService.getById(paymentId, tenantId);

      if (!mountedRef.current) return;

      if (result) {
        setPayment(result);
        const newStatus = result.status as PaymentStatus;
        setStatus(newStatus);

        const prev = prevStatusRef.current;
        if (prev !== null && prev !== newStatus) {
          onStatusChange?.(newStatus, prev);
        }
        prevStatusRef.current = newStatus;

        if (TERMINAL_STATUSES.includes(newStatus)) {
          stop();
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erro ao verificar pagamento');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [paymentId, tenantId, onStatusChange, stop]);

  const retry = useCallback(() => {
    stop();
    fetchPayment();
  }, [stop, fetchPayment]);

  useEffect(() => {
    mountedRef.current = true;
    prevStatusRef.current = null;

    if (paymentId && tenantId) {
      fetchPayment();
      intervalRef.current = setInterval(fetchPayment, intervalMs);
    }

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [paymentId, tenantId, intervalMs, fetchPayment, stop]);

  return {
    payment,
    status,
    isLoading,
    error,
    stop,
    retry,
  };
}
