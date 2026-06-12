import type { BookingWithDetails } from '@/services/bookings';
import StatusBadge from '@/pages/admin/components/ui/StatusBadge';
import EmptyState from '@/pages/admin/components/ui/EmptyState';
import { TableSkeleton } from '@/pages/admin/components/ui/LoadingSkeleton';

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  loading?: boolean;
  onSelect: (booking: BookingWithDetails) => void;
  selectedId?: string | null;
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Pago', cls: 'bg-teal-50 text-teal-700 border-teal-100' },
    pending: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    overdue: { label: 'Vencido', cls: 'bg-red-50 text-red-600 border-red-100' },
    partial: { label: 'Parcial', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    refunded: { label: 'Reembolsado', cls: 'bg-sand-100 text-navy-400 border-sand-200' },
  };
  const cfg = map[status] ?? { label: status, cls: 'bg-sand-100 text-navy-400 border-sand-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: 'transfer' | 'experience' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
      type === 'transfer'
        ? 'bg-navy-50 text-navy-500 border border-navy-100'
        : 'bg-sand-100 text-amber-700 border border-sand-200'
    }`}>
      <i className={`${type === 'transfer' ? 'ri-car-line' : 'ri-compass-discover-line'} text-[10px]`}></i>
      {type === 'transfer' ? 'Transfer' : 'Experiência'}
    </span>
  );
}

export default function BookingsTable({ bookings, loading, onSelect, selectedId }: BookingsTableProps) {
  if (loading) return <TableSkeleton rows={6} />;

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-sand-200 rounded-2xl">
        <EmptyState
          icon="ri-calendar-2-line"
          title="Nenhuma reserva encontrada"
          description="Ajuste os filtros ou crie uma nova reserva para visualizar aqui."
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-sand-100">
        {bookings.map((b) => {
          const dt = new Date(b.scheduled_at);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b)}
              className={`w-full text-left p-4 hover:bg-sand-50 transition-colors cursor-pointer ${selectedId === b.id ? 'bg-teal-50/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <p className="text-xs font-semibold text-navy-700 font-mono">{b.reference}</p>
                  <p className="text-sm font-medium text-navy-900 mt-0.5">{b.passenger_name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <i className="ri-map-pin-2-line text-navy-300 text-xs flex-shrink-0"></i>
                <p className="text-xs text-navy-500 truncate">{b.pickup_location}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeBadge type={b.booking_type} />
                  <PaymentBadge status={b.payment_status} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-navy-900">R$ {b.total_amount.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-navy-400">
                    {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-sand-100 bg-sand-50/70">
            <tr>
              {[
                { label: 'Reserva', cls: '' },
                { label: 'Passageiro', cls: '' },
                { label: 'Rota', cls: 'hidden md:table-cell' },
                { label: 'Data / Hora', cls: 'hidden lg:table-cell' },
                { label: 'Motorista', cls: 'hidden xl:table-cell' },
                { label: 'Veículo', cls: 'hidden xl:table-cell' },
                { label: 'Pax', cls: 'hidden lg:table-cell' },
                { label: 'Status', cls: '' },
                { label: 'Pagamento', cls: 'hidden md:table-cell' },
                { label: 'Valor', cls: '' },
                { label: '', cls: '' },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`text-left text-[10px] font-bold text-navy-400 uppercase tracking-wider py-3 px-4 whitespace-nowrap ${h.cls}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {bookings.map((b) => {
              const dt = new Date(b.scheduled_at);
              const isSelected = selectedId === b.id;
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className={`group transition-colors duration-100 cursor-pointer ${
                    isSelected ? 'bg-teal-50/50' : 'hover:bg-sand-50/60'
                  }`}
                >
                  {/* Reserva */}
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-semibold text-navy-700 font-mono">{b.reference}</p>
                    <div className="mt-1">
                      <TypeBadge type={b.booking_type} />
                    </div>
                  </td>

                  {/* Passageiro */}
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <p className="text-xs font-medium text-navy-800 leading-snug">{b.passenger_name}</p>
                    <p className="text-[10px] text-navy-400 mt-0.5 truncate max-w-[140px]">{b.passenger_email}</p>
                  </td>

                  {/* Rota */}
                  <td className="py-3.5 px-4 hidden md:table-cell min-w-[180px]">
                    <p className="text-xs text-navy-700 truncate max-w-[160px]">{b.pickup_location}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <i className="ri-arrow-right-line text-navy-300 text-[10px]"></i>
                      <p className="text-[11px] text-navy-400 truncate max-w-[150px]">{b.dropoff_location}</p>
                    </div>
                  </td>

                  {/* Data / Hora */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <p className="text-xs font-semibold text-navy-800">
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-navy-400">
                      {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </p>
                  </td>

                  {/* Motorista */}
                  <td className="py-3.5 px-4 hidden xl:table-cell">
                    {b.driver_name ? (
                      <p className="text-xs text-navy-600">{b.driver_name}</p>
                    ) : (
                      <span className="text-[11px] text-navy-300 italic">Não alocado</span>
                    )}
                  </td>

                  {/* Veículo */}
                  <td className="py-3.5 px-4 hidden xl:table-cell">
                    {b.vehicle_name ? (
                      <>
                        <p className="text-xs text-navy-600">{b.vehicle_name}</p>
                        {b.vehicle_plate && (
                          <p className="text-[10px] text-navy-300 font-mono mt-0.5">{b.vehicle_plate}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] text-navy-300 italic">—</span>
                    )}
                  </td>

                  {/* Pax */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-group-line text-navy-400 text-xs"></i>
                      <span className="text-xs text-navy-600 font-medium">{b.passenger_count}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={b.status} />
                  </td>

                  {/* Pagamento */}
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <PaymentBadge status={b.payment_status} />
                  </td>

                  {/* Valor */}
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-semibold text-navy-900 whitespace-nowrap">
                      R$ {b.total_amount.toLocaleString('pt-BR')}
                    </p>
                  </td>

                  {/* Arrow */}
                  <td className="py-3.5 px-4">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg text-navy-300 group-hover:text-navy-600 group-hover:bg-sand-100 transition-all">
                      <i className="ri-arrow-right-s-line text-sm"></i>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}