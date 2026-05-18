import { useState, useEffect } from 'react';
import { mockBookings, type MockBooking, type BookingStatus, type PaymentStatus } from '@/mocks/admin-bookings';
import PageHeader from '@/pages/admin/components/ui/PageHeader';
import BookingsFilterBar, { type BookingsFilters } from './components/BookingsFilterBar';
import BookingsTable from './components/BookingsTable';
import BookingDetailDrawer from './components/BookingDetailDrawer';
import NovaReservaForm from './components/NovaReservaForm';

const defaultFilters: BookingsFilters = {
  search: '',
  status: 'all',
  paymentStatus: 'all',
  bookingType: 'all',
  dateFrom: '',
  dateTo: '',
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingsFilters>(defaultFilters);
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // Close drawer on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNewForm) setShowNewForm(false);
        else if (selectedBooking) setSelectedBooking(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedBooking, showNewForm]);

  const filtered = mockBookings.filter((b) => {
    // Status filter
    if (filters.status !== 'all' && b.status !== (filters.status as BookingStatus)) return false;
    // Payment filter
    if (filters.paymentStatus !== 'all' && b.payment_status !== (filters.paymentStatus as PaymentStatus)) return false;
    // Type filter
    if (filters.bookingType !== 'all' && b.booking_type !== filters.bookingType) return false;
    // Date from
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(b.scheduled_at) < from) return false;
    }
    // Date to
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59);
      if (new Date(b.scheduled_at) > to) return false;
    }
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        b.reference.toLowerCase().includes(q) ||
        b.passenger_name.toLowerCase().includes(q) ||
        b.passenger_email.toLowerCase().includes(q) ||
        b.pickup_location.toLowerCase().includes(q) ||
        b.dropoff_location.toLowerCase().includes(q) ||
        (b.driver_name?.toLowerCase().includes(q) ?? false) ||
        (b.route_name?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-[1600px]">
      <PageHeader
        icon="ri-calendar-check-line"
        title="Reservas"
        subtitle="Gerencie e acompanhe todas as reservas da operação."
        badge={`${mockBookings.length} reservas`}
        action={
          <div className="flex items-center gap-2.5">
            {/* Export placeholder */}
            <button
              type="button"
              className="h-10 flex items-center gap-2 px-4 bg-white border border-sand-200 hover:border-sand-300 text-navy-600 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Nova Reserva */}
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="h-10 flex items-center gap-2 px-4 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-sm"></i>
              Nova Reserva
            </button>
          </div>
        }
      />

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: mockBookings.length, icon: 'ri-calendar-line', color: 'text-navy-700' },
          { label: 'Confirmadas', value: mockBookings.filter((b) => b.status === 'confirmed').length, icon: 'ri-checkbox-circle-line', color: 'text-teal-600' },
          { label: 'Pendentes', value: mockBookings.filter((b) => b.status === 'pending').length, icon: 'ri-time-line', color: 'text-amber-600' },
          { label: 'Em Andamento', value: mockBookings.filter((b) => b.status === 'in_progress').length, icon: 'ri-car-line', color: 'text-navy-500' },
          { label: 'Finalizadas', value: mockBookings.filter((b) => b.status === 'completed').length, icon: 'ri-flag-line', color: 'text-navy-400' },
          { label: 'Canceladas', value: mockBookings.filter((b) => b.status === 'cancelled').length, icon: 'ri-close-circle-line', color: 'text-red-400' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-sand-200 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sand-50 flex-shrink-0">
              <i className={`${kpi.icon} ${kpi.color} text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-navy-900 leading-none">{kpi.value}</p>
              <p className="text-[10px] text-navy-400 mt-0.5 truncate">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <BookingsFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={mockBookings.length}
        filteredCount={filtered.length}
      />

      {/* Table */}
      <BookingsTable
        bookings={filtered}
        loading={loading}
        onSelect={(b) => {
          setShowNewForm(false);
          setSelectedBooking(b);
        }}
        selectedId={selectedBooking?.id}
      />

      {/* Detail drawer */}
      {selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Nova reserva form */}
      {showNewForm && (
        <NovaReservaForm
          onClose={() => setShowNewForm(false)}
          onSave={() => {
            setShowNewForm(false);
            addToast('Reserva criada com sucesso!');
          }}
        />
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto animate-fade-in-up ${
              t.type === 'success'
                ? 'bg-white border-teal-200 text-navy-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${
              t.type === 'success' ? 'bg-teal-50' : 'bg-red-100'
            }`}>
              <i className={`${t.type === 'success' ? 'ri-checkbox-circle-line text-teal-600' : 'ri-error-warning-line text-red-500'} text-sm`}></i>
            </div>
            <p className="text-sm font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}