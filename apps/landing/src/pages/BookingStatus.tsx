import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { usePublicBooking, useCancelBooking } from '@/hooks/usePublicBookings';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Rascunho', color: 'text-slate-400', dot: 'bg-slate-400' },
  hold_created: { label: 'Pendente', color: 'text-amber-400', dot: 'bg-amber-400' },
  payment_pending: { label: 'Aguardando Pagamento', color: 'text-amber-400', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmada', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-400', dot: 'bg-blue-400' },
  completed: { label: 'Concluída', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelada', color: 'text-red-400', dot: 'bg-red-400' },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-400 border-amber-400/30 bg-amber-500/10' },
  processing: { label: 'Processando', color: 'text-blue-400 border-blue-400/30 bg-blue-500/10' },
  completed: { label: 'Pago', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' },
  paid: { label: 'Pago', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' },
  failed: { label: 'Falhou', color: 'text-red-400 border-red-400/30 bg-red-500/10' },
  refunded: { label: 'Reembolsado', color: 'text-red-400 border-red-400/30 bg-red-500/10' },
  cancelled: { label: 'Cancelado', color: 'text-slate-400 border-slate-400/30 bg-slate-500/10' },
};

const timelineOrder = [
  'created',
  'hold_created',
  'payment_pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

const timelineLabels: Record<string, { label: string; icon: string }> = {
  created: { label: 'Reserva Iniciada', icon: 'ri-file-add-line' },
  hold_created: { label: 'Reserva Pendente', icon: 'ri-time-line' },
  payment_pending: { label: 'Aguardando Pagamento', icon: 'ri-bank-card-line' },
  confirmed: { label: 'Confirmada', icon: 'ri-check-double-line' },
  in_progress: { label: 'Em Andamento', icon: 'ri-roadster-line' },
  completed: { label: 'Concluída', icon: 'ri-checkbox-circle-line' },
  cancelled: { label: 'Cancelada', icon: 'ri-close-circle-line' },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white animate-pulse">
      <div className="max-w-2xl mx-auto px-6 py-24 space-y-6">
        <div className="h-4 w-48 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800 rounded-xl" />
        <div className="h-48 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function BookingStatus() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: booking, isLoading, isError, refetch } = usePublicBooking(bookingId ?? null);
  const cancelMutation = useCancelBooking();

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelError(null);
    const ok = await cancelMutation.mutateAsync(bookingId);
    if (ok) {
      refetch();
    } else {
      setCancelError('Erro ao cancelar reserva. Tente novamente ou entre em contato.');
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <Helmet>
        <title>Status da Reserva — Dom Pietro Experience</title>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white">
        <nav className="max-w-2xl mx-auto px-6 pt-24 pb-4">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-white truncate">Status da Reserva</li>
          </ol>
        </nav>

        <div className="max-w-2xl mx-auto px-6 pb-24">
          {!booking || isError ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center space-y-4">
              <svg className="w-16 h-16 mx-auto text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h1 className="text-xl font-display font-bold">Reserva não encontrada</h1>
              <p className="text-sm text-slate-400">Verifique o link ou entre em contato.</p>
              <Link to="/" className="inline-flex rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors">
                Voltar ao Início
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold">Status da Reserva</h1>
                    <p className="text-sm text-slate-400 mt-1">
                      Código: <span className="font-mono font-bold text-white">{booking.reference}</span>
                    </p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
                    statusConfig[booking.status]?.color || 'text-slate-400'
                  }`}>
                    {statusConfig[booking.status]?.label || booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Status do Pagamento</span>
                    <div>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${
                        paymentStatusConfig[booking.payment_status]?.color || 'text-slate-400 border-slate-400/30 bg-slate-500/10'
                      }`}>
                        {paymentStatusConfig[booking.payment_status]?.label || booking.payment_status}
                      </span>
                    </div>
                  </div>
                  {booking.total_amount > 0 && (
                    <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Valor</span>
                      <p className="text-lg font-bold text-emerald-400">{formatPrice(booking.total_amount)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="font-display font-bold text-lg">Detalhes</h2>
                <div className="space-y-3">
                  {booking.route_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Roteiro</span>
                      <span className="text-sm text-white font-medium">{booking.route_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Data</span>
                    <span className="text-sm text-white">
                      {new Date(booking.scheduled_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Horário</span>
                    <span className="text-sm text-white">
                      {new Date(booking.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Passageiros</span>
                    <span className="text-sm text-white font-medium">{booking.passenger_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Nome</span>
                    <span className="text-sm text-white">{booking.passenger_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">E-mail</span>
                    <span className="text-sm text-white">{booking.passenger_email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Telefone</span>
                    <span className="text-sm text-white">{booking.passenger_phone}</span>
                  </div>
                  {booking.pickup_location && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Origem</span>
                      <span className="text-sm text-white">{booking.pickup_location}</span>
                    </div>
                  )}
                  {booking.dropoff_location && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Destino</span>
                      <span className="text-sm text-white">{booking.dropoff_location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="font-display font-bold text-lg">Linha do Tempo</h2>
                <div className="space-y-0">
                  {timelineOrder.map((event, idx) => {
                    const tl = timelineLabels[event] || { label: event, icon: 'ri-record-circle-line' };
                    const isPast = timelineOrder.indexOf(booking.status) >= idx;
                    const isCurrent = booking.status === event;

                    return (
                      <div key={event} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            isCurrent ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : isPast ? 'bg-emerald-500/50' : 'bg-slate-700'
                          }`} />
                          {idx < timelineOrder.length - 1 && (
                            <div className={`w-0.5 h-8 ${isPast ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                          )}
                        </div>
                        <div className={`pb-6 ${isPast ? 'opacity-100' : 'opacity-40'}`}>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-emerald-400' : isPast ? 'text-white' : 'text-slate-500'}`}>
                            {tl.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancel area (only for cancellable statuses) */}
              {['hold_created', 'payment_pending', 'confirmed'].includes(booking.status) && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-6 space-y-3">
                  {!showCancel ? (
                    <button
                      type="button"
                      onClick={() => setShowCancel(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 text-sm font-medium transition-colors"
                    >
                      Cancelar Reserva
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-red-300">
                        Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                      </p>
                      {cancelError && (
                        <p className="text-sm text-red-400">{cancelError}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowCancel(false); setCancelError(null); }}
                          disabled={cancelMutation.isPending}
                          className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="flex-1 rounded-lg bg-red-500 hover:bg-red-400 text-white py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {cancelMutation.isPending ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Cancelando...
                            </>
                          ) : 'Confirmar Cancelamento'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Back links */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/reserva/${booking.id}/confirmacao`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 text-sm font-medium transition-colors"
                >
                  Ver Confirmação
                </Link>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 text-sm font-medium transition-colors"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
