import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Clock, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useDriverAuth } from '@/providers/use-driver-auth';
import { IncidentForm } from '@/components/IncidentForm';

interface Passenger {
  id: string;
  name: string;
}

interface Route {
  name: string;
  origin: string;
  destination: string;
}

interface Trip {
  id: string;
  status: string;
  departure_time: string;
  routes: Route;
  passengers: Passenger[];
}

export function TripDetail() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useDriverAuth();
  const queryClient = useQueryClient();
  const [showIncident, setShowIncident] = useState(false);

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', bookingId],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select('id, status, departure_time, routes(name, origin, destination), passengers(id, name)')
        .eq('id', bookingId as string)
        .single();

      if (queryError) throw queryError;
      return data as unknown as Trip;
    },
    enabled: !!bookingId && !!user,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { error: mutationError } = await client
        .from('bookings')
        .update({ status: 'in_progress' })
        .eq('id', bookingId as string);

      if (mutationError) throw mutationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { error: mutationError } = await client
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId as string);

      if (mutationError) throw mutationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="mt-8 text-center text-slate-400">Viagem nao encontrada.</div>
      </div>
    );
  }

  const status = trip.status;
  const route = trip.routes;
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'completed';

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/" className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">{route?.name ?? 'Viagem'}</h1>
            <p className="text-xs text-slate-400">{route?.origin} → {route?.destination}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isCompleted ? 'bg-emerald-500/10 text-emerald-400'
            : isInProgress ? 'bg-amber-500/10 text-amber-400'
            : 'bg-slate-800 text-slate-400'
          }`}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6" />
            ) : isInProgress ? (
              <Clock className="h-6 w-6" />
            ) : (
              <MapPin className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-400">Status</p>
            <p className={`font-semibold ${
              isCompleted ? 'text-emerald-400'
              : isInProgress ? 'text-amber-400'
              : 'text-white'
            }`}>
              {isCompleted ? 'Concluida'
              : isInProgress ? 'Em andamento'
              : 'Pendente'}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Horario</p>
            <p className="mt-1 text-white">
              {trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </p>
          </div>
          <div className="border-t border-slate-800" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Passageiros</p>
            <p className="mt-1 text-white">{trip.passengers?.length ?? 0} passageiro(s)</p>
          </div>
        </div>

        {trip.passengers?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Lista de passageiros</p>
            <div className="space-y-2">
              {trip.passengers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                    {p.name?.charAt(0) ?? '?'}
                  </div>
                  <span className="text-sm text-white">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCompleted && (
          <div className="mt-6 space-y-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(route?.destination ?? '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              <Navigation className="h-4 w-4" />
              Navegar com Google Maps
            </a>

            {!isInProgress && (
              <button
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {checkInMutation.isPending ? 'Registrando...' : 'Iniciar viagem (Check-in)'}
              </button>
            )}

            {isInProgress && (
              <button
                onClick={() => checkOutMutation.mutate()}
                disabled={checkOutMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {checkOutMutation.isPending ? 'Finalizando...' : 'Finalizar viagem (Check-out)'}
              </button>
            )}

            {(checkInMutation.isError || checkOutMutation.isError) && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Erro ao atualizar status. Tente novamente.
              </div>
            )}
          </div>
        )}

        {!isCompleted && (
          <button
            onClick={() => setShowIncident(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
          >
            <AlertTriangle className="h-4 w-4" />
            Registrar ocorrencia
          </button>
        )}

        {isCompleted && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-2 font-medium text-emerald-400">Viagem concluida</p>
            <p className="mt-1 text-sm text-slate-400">Obrigado pelo seu trabalho hoje.</p>
          </div>
        )}
      </main>

      {showIncident && (
        <IncidentForm
          bookingId={bookingId as string}
          onClose={() => setShowIncident(false)}
        />
      )}
    </div>
  );
}
