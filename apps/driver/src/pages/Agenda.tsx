import { useDriverAuth } from '@/providers/use-driver-auth';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LogOut, MapPin, Users, Clock } from 'lucide-react';

interface Trip {
  id: string;
  status: string;
  route_name: string;
  origin: string;
  destination: string;
  passenger_count: number;
  departure_time: string;
}

export function Agenda() {
  const { user, signOut } = useDriverAuth();

  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['driver-trips', user?.id],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select('id, status, routes(name, origin, destination), passengers(count)')
        .eq('driver_id', user?.id as string)
        .eq('status', 'confirmed')
        .order('departure_time', { ascending: true });

      if (queryError) throw queryError;

      return (data ?? []).map((booking: Record<string, unknown>) => ({
        id: booking.id as string,
        status: booking.status as string,
        route_name: (booking.routes as Record<string, string>)?.name ?? '-',
        origin: (booking.routes as Record<string, string>)?.origin ?? '-',
        destination: (booking.routes as Record<string, string>)?.destination ?? '-',
        passenger_count: (booking.passengers as Array<unknown>)?.length ?? 0,
        departure_time: booking.departure_time as string ?? '-',
      })) as Trip[];
    },
    enabled: !!user,
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr === '-') return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {formatDate(new Date())}
            </h1>
            <p className="text-sm text-slate-400">
              {user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
          Viagens de hoje
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-slate-800/50 p-4">
                <div className="mb-3 h-4 w-3/4 rounded bg-slate-700" />
                <div className="mb-2 h-3 w-1/2 rounded bg-slate-700" />
                <div className="h-3 w-1/3 rounded bg-slate-700" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            Erro ao carregar viagens. Verifique sua conexao.
          </div>
        )}

        {!isLoading && !error && trips?.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <MapPin className="h-6 w-6 text-slate-500" />
            </div>
            <p className="font-medium text-slate-300">Nenhuma viagem hoje</p>
            <p className="mt-1 text-sm text-slate-500">
              Suas viagens agendadas aparecerao aqui.
            </p>
          </div>
        )}

        {!isLoading && !error && trips && trips.length > 0 && (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className="block animate-fade-in rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-emerald-500/30 hover:bg-slate-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{trip.route_name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{trip.origin}</span>
                      <span>→</span>
                      <span>{trip.destination}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(trip.departure_time)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        {trip.passenger_count}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    {trip.status === 'confirmed' ? 'Confirmada' : trip.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
