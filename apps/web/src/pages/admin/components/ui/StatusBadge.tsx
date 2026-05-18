interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { label: string; classes: string; dot: string }> = {
  // Bookings — operational status
  confirmed: { label: 'Confirmada', classes: 'bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
  pending: { label: 'Pendente', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  in_progress: { label: 'Em Andamento', classes: 'bg-navy-50 text-navy-600 border-navy-100', dot: 'bg-navy-500 animate-pulse' },
  completed: { label: 'Finalizada', classes: 'bg-sand-100 text-navy-500 border-sand-200', dot: 'bg-navy-400' },
  cancelled: { label: 'Cancelada', classes: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-400' },
  rescheduled: { label: 'Reagendada', classes: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  // Payment status
  paid: { label: 'Pago', classes: 'bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
  payment_pending: { label: 'Pag. Pendente', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
  overdue: { label: 'Vencido', classes: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500 animate-pulse' },
  refunded: { label: 'Reembolsado', classes: 'bg-sand-100 text-navy-500 border-sand-200', dot: 'bg-navy-400' },
  partial: { label: 'Parcial', classes: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  // Transfers
  scheduled: { label: 'Agendado', classes: 'bg-sand-100 text-navy-500 border-sand-200', dot: 'bg-navy-300' },
  driver_assigned: { label: 'Motorista Alocado', classes: 'bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
  delayed: { label: 'Atrasado', classes: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500 animate-pulse' },
  // Drivers
  available: { label: 'Disponível', classes: 'bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
  on_trip: { label: 'Em Viagem', classes: 'bg-navy-50 text-navy-600 border-navy-100', dot: 'bg-navy-500 animate-pulse' },
  off_duty: { label: 'Fora de Serviço', classes: 'bg-sand-100 text-navy-400 border-sand-200', dot: 'bg-navy-300' },
  unavailable: { label: 'Indisponível', classes: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-400' },
  // Vehicles
  maintenance: { label: 'Manutenção', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  inactive: { label: 'Inativo', classes: 'bg-sand-100 text-navy-300 border-sand-100', dot: 'bg-navy-200' },
  in_use: { label: 'Em Uso', classes: 'bg-navy-50 text-navy-600 border-navy-100', dot: 'bg-navy-500 animate-pulse' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, classes: 'bg-sand-100 text-navy-400 border-sand-200', dot: 'bg-navy-300' };
  const textSize = size === 'md' ? 'text-xs' : 'text-[11px]';
  const padding = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full border font-medium ${textSize} ${config.classes} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`}></span>
      {config.label}
    </span>
  );
}