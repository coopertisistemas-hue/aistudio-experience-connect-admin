import { useState, useMemo, useCallback } from 'react';
import type { CustomerDisplay } from '@/services/customers';
import { useCustomers, useCustomerStats } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import CustomersSummaryStrip from './components/CustomersSummaryStrip';
import CustomersFilterBar from './components/CustomersFilterBar';
import CustomersList from './components/CustomersList';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';
import NovoClienteForm from './components/NovoClienteForm';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function CustomersPage() {
  const user = useAuth().user;
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id || '';
  const { data: customers = [], isLoading } = useCustomers(tenantId);
  const { data: stats } = useCustomerStats(tenantId);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDisplay | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recurrenceFilter, setRecurrenceFilter] = useState<'all' | 'recurring' | 'new'>('all');

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (recurrenceFilter === 'recurring' && !c.is_recurring) return false;
      if (recurrenceFilter === 'new' && c.is_recurring) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q) &&
          !c.phone.includes(q)
        ) return false;
      }
      return true;
    });
  }, [search, statusFilter, recurrenceFilter, customers]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setRecurrenceFilter('all');
  };

  const handleSelectCustomer = (c: CustomerDisplay) => {
    setSelectedCustomer(c);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    addToast('Cliente cadastrado com sucesso.', 'success');
  };

  // Alert banner logic
  const overdueCustomers = customers.filter((c) => c.pending_amount > 0);

  const toastColors = {
    success: 'bg-teal-600 text-white',
    info: 'bg-slate-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toastColors[t.type]}`}
            >
              <i className={`text-base ${t.type === 'success' ? 'ri-checkbox-circle-line' : t.type === 'warning' ? 'ri-alert-line' : 'ri-information-line'}`}></i>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Alert banners */}
      {overdueCustomers.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <i className="ri-alert-line text-amber-500 text-sm flex-shrink-0"></i>
          <p className="text-xs text-amber-800 flex-1">
            <span className="font-semibold">{overdueCustomers.length} cliente(s)</span> com saldo financeiro pendente — verifique pagamentos em aberto.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className="text-xs font-semibold text-amber-700 underline whitespace-nowrap cursor-pointer"
          >
            Ver clientes
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Clientes</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Gestão de hóspedes, passageiros e relacionamento
            <span className="ml-2 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold border border-stone-200">
              {stats ? `${stats.total_ativos} ativos · ${stats.vip_count} VIP` : 'carregando…'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addToast('Exportação disponível em breve.', 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line text-sm"></i>
            Exportar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line text-sm"></i>
            Novo Cliente
          </button>
        </div>
      </div>

      {/* KPI summary strip */}
      <CustomersSummaryStrip stats={stats} customers={customers} />

      {/* Filter bar */}
      <CustomersFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter as any}
        onStatusChange={setStatusFilter}
        recurrence={recurrenceFilter}
        onRecurrenceChange={setRecurrenceFilter}
        total={customers.length}
        filtered={filtered.length}
        onClear={handleClearFilters}
      />

      {/* Customers list */}
      <CustomersList
        customers={filtered}
        onSelect={handleSelectCustomer}
        loading={isLoading}
      />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-full shadow-lg cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line text-sm"></i>
          Novo Cliente
        </button>
      </div>

      {/* Detail drawer */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onNewBooking={() => {
            setSelectedCustomer(null);
            setShowForm(false);
            addToast('Redirecionando para nova reserva…', 'info');
          }}
        />
      )}

      {/* New customer form */}
      {showForm && (
        <NovoClienteForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
          tenantId={tenantId}
        />
      )}
    </div>
  );
}
