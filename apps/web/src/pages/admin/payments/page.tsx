import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@connect/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePayments, usePaymentStats } from '@/hooks/usePayments';
import type { PaymentStatus } from '@connect/core';

type FilterStatus = PaymentStatus | 'overdue' | 'partial' | 'cancelled' | 'all';
import type { PaymentFilters, PaymentWithDetails } from '@/services/payments';
import PaymentsSummaryStrip from './components/PaymentsSummaryStrip';
import PaymentsFilterBar from './components/PaymentsFilterBar';
import PaymentsList from './components/PaymentsList';
import PaymentDetailDrawer from './components/PaymentDetailDrawer';
import NovoPageamentoForm from './components/NovoPageamentoForm';
import { KPISkeleton } from '@/pages/admin/components/ui/LoadingSkeleton';

interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-stone-200 rounded-xl h-24" />)}
      </div>
      <div className="bg-stone-200 rounded-xl h-16" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-stone-200 rounded-xl h-24" />)}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';

  useRealtime(supabase as any, {
    table: 'payments',
    event: 'UPDATE',
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['paymentStats', tenantId] });
    },
  });

  useRealtime(supabase as any, {
    table: 'payments',
    event: 'INSERT',
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentStats', tenantId] });
    },
  });

  const [selected, setSelected] = useState<PaymentWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('all');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const serviceFilters: PaymentFilters = useMemo(() => ({
    search: search || undefined,
    status: activeStatus === 'overdue' ? 'overdue' as any : activeStatus as any,
    method: filterMethod || undefined,
    period: filterPeriod || undefined,
  }), [search, activeStatus, filterMethod, filterPeriod]);

  const { data: paymentsData, isLoading, error } = usePayments(tenantId, serviceFilters);
  const { data: stats } = usePaymentStats(tenantId);

  const payments = paymentsData?.data ?? [];
  const totalCount = paymentsData?.total ?? 0;
  const s = stats ?? {
    receita_confirmada: 0, pendentes: 0, atrasados: 0, ticket_medio: 0,
    reembolsos: 0, taxa_conversao: 0, overdue_count: 0, pending_count: 0, partial_count: 0,
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selected) setSelected(null);
        if (showForm) setShowForm(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, showForm]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const activeFiltersCount = [
    activeStatus !== 'all', !!filterMethod, !!filterPeriod, !!filterCategory,
  ].filter(Boolean).length;

  const handleClear = () => {
    setSearch('');
    setActiveStatus('all');
    setFilterMethod('');
    setFilterPeriod('');
    setFilterCategory('');
  };

  if (isLoading) {
    return <div className="p-6 lg:p-8"><LoadingSkeleton /></div>;
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <i className="ri-error-warning-line text-red-500 text-3xl mb-3"></i>
          <p className="text-red-700 font-medium">Erro ao carregar pagamentos</p>
          <p className="text-red-500 text-sm mt-1">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Alert banners */}
      {s.overdue_count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-alarm-warning-line flex-shrink-0"></i>
          <span className="flex-1">
            <strong>{s.overdue_count} pagamento{s.overdue_count !== 1 ? 's' : ''} em atraso</strong> — Regularize para garantir a operação.
          </span>
          <button type="button" onClick={() => setActiveStatus('overdue')} className="text-red-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver atrasados
          </button>
        </div>
      )}
      {s.partial_count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <i className="ri-money-dollar-circle-line flex-shrink-0"></i>
          <span className="flex-1">
            <strong>{s.partial_count} pagamento{s.partial_count !== 1 ? 's' : ''} parcialmente pagos</strong> — Saldo pendente a receber.
          </span>
          <button type="button" onClick={() => setActiveStatus('partial')} className="text-amber-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver parciais
          </button>
        </div>
      )}
      {s.pending_count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-sm">
          <i className="ri-time-line flex-shrink-0"></i>
          <span className="flex-1">
            <strong>{s.pending_count} pagamento{s.pending_count !== 1 ? 's' : ''} aguardando confirmação</strong> — Reservas sem pagamento vinculado.
          </span>
          <button type="button" onClick={() => setActiveStatus('pending')} className="text-stone-600 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap">
            Ver pendentes
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Pagamentos</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Controle financeiro das reservas — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addToast('Exportação iniciada. Arquivo disponível em instantes.', 'info')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-2-line text-sm"></i>
            Exportar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Novo Pagamento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <PaymentsSummaryStrip stats={s} />

      {/* Filters */}
      <PaymentsFilterBar
        total={totalCount}
        filtered={payments.length}
        search={search}
        onSearch={setSearch}
        activeStatus={activeStatus}
        onStatusChange={(v) => setActiveStatus(v as FilterStatus)}
        activeFiltersCount={activeFiltersCount}
        onMethodChange={setFilterMethod}
        onPeriodChange={setFilterPeriod}
        onCategoryChange={setFilterCategory}
        onClear={handleClear}
      />

      {/* Payments list */}
      <PaymentsList
        payments={payments}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

      {/* Detail drawer */}
      {selected && (
        <PaymentDetailDrawer
          payment={selected}
          onClose={() => setSelected(null)}
          onToast={(msg) => addToast(msg)}
        />
      )}

      {/* New payment form */}
      {showForm && (
        <NovoPageamentoForm
          onClose={() => setShowForm(false)}
          onSave={(confirmed) => {
            setShowForm(false);
            addToast(confirmed ? 'Pagamento confirmado com sucesso.' : 'Pagamento salvo como pendente.');
          }}
          tenantId={tenantId}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto ${
              toast.type === 'warning'
                ? 'bg-amber-700 text-white'
                : 'bg-[#0f2a40] text-white'
            }`}
          >
            <i className={`${
              toast.type === 'warning' ? 'ri-alarm-warning-line text-amber-300' :
              toast.type === 'info' ? 'ri-information-line text-stone-400' :
              'ri-checkbox-circle-line text-teal-400'
            }`}></i>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}