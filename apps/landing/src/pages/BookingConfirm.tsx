import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { usePublicBooking } from '@/hooks/usePublicBookings';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'text-slate-400' },
  hold_created: { label: 'Reserva Pendente', color: 'text-amber-400' },
  payment_pending: { label: 'Aguardando Pagamento', color: 'text-amber-400' },
  confirmed: { label: 'Confirmada', color: 'text-emerald-400' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-400' },
  completed: { label: 'Concluída', color: 'text-emerald-400' },
  cancelled: { label: 'Cancelada', color: 'text-red-400' },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white animate-pulse">
      <div className="max-w-2xl mx-auto px-6 py-24 space-y-6">
        <div className="h-4 w-48 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function BookingConfirm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: booking, isLoading, isError } = usePublicBooking(bookingId ?? null);

  if (isLoading) return <LoadingSkeleton />;

  const statusStyle = statusLabels[booking?.status ?? ''] || { label: booking?.status || '—', color: 'text-slate-400' };

  return (
    <>
      <Helmet>
        <title>Confirmação de Reserva — Dom Pietro Experience</title>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white">
        <nav className="max-w-2xl mx-auto px-6 pt-24 pb-4">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-white truncate">Confirmação</li>
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
              {/* Status hero */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  booking.status === 'confirmed' || booking.status === 'completed'
                    ? 'bg-emerald-500/20'
                    : booking.status === 'cancelled'
                      ? 'bg-red-500/20'
                      : 'bg-amber-500/20'
                }`}>
                  {booking.status === 'confirmed' || booking.status === 'completed' ? (
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-display font-bold">
                    {booking.status === 'confirmed' || booking.status === 'completed'
                      ? 'Reserva Confirmada!'
                      : 'Reserva Recebida'}
                  </h1>
                  <p className={`text-sm font-medium mt-1 ${statusStyle.color}`}>
                    {statusStyle.label}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2">
                  <span className="text-xs text-slate-400">Código:</span>
                  <span className="text-sm font-bold text-white font-mono">{booking.reference}</span>
                </div>
              </div>

              {/* Booking details */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="font-display font-bold text-lg">Detalhes da Reserva</h2>

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
                    <span className="text-sm text-slate-400">Valor</span>
                    <span className="text-sm text-emerald-400 font-bold">{formatPrice(booking.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-6 space-y-3">
                <h3 className="font-display font-semibold text-emerald-400">Próximos passos</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Após a confirmação do pagamento, você receberá um e-mail com os detalhes.
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Em caso de dúvidas, entre em contato pelo WhatsApp.
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Você pode acompanhar o status da sua reserva a qualquer momento.
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/reserva/${booking.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors"
                >
                  Ver Status da Reserva
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
