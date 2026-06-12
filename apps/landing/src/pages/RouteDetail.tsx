import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { usePublicRoute, useRouteAvailability } from '@/hooks/usePublicRoutes';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDuration(min: number | null): string | null {
  if (min === null || min === undefined) return null;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-8">
        <div className="h-4 w-64 bg-slate-800 rounded" />
        <div className="h-64 rounded-2xl bg-slate-800" />
        <div className="space-y-4">
          <div className="h-8 w-96 bg-slate-800 rounded" />
          <div className="h-4 w-full max-w-2xl bg-slate-800 rounded" />
          <div className="h-4 w-3/4 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <svg
          className="w-16 h-16 mx-auto text-red-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xl text-slate-400 font-display">
          Erro ao carregar roteiro
        </p>
        <p className="text-slate-500 text-sm">
          Não foi possível conectar ao servidor. Tente novamente.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold font-display text-emerald-400">
          404
        </h1>
        <p className="text-xl text-slate-400">Roteiro não encontrado</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}

export function RouteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const {
    data: route,
    isLoading,
    isError,
    refetch,
  } = usePublicRoute(slug ?? '');

  const { data: availability, isLoading: slotsLoading } =
    useRouteAvailability(selectedDate || null);

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!route) return <NotFoundState />;

  const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
    `Olá! Tenho interesse no roteiro ${route.name}`
  )}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: route.name,
    description: route.short_description || route.full_description || '',
    url: `https://dompietro.com/roteiro/${route.slug}`,
    offers: {
      '@type': 'Offer',
      price: route.base_price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
    ...(route.category_name && {
      eventCategory: route.category_name,
    }),
  };

  return (
    <>
      <Helmet>
        <title>
          {route.name} — Dom Pietro Experience
        </title>
        <meta
          name="description"
          content={
            route.short_description || `Roteiro ${route.name} — Dom Pietro Experience`
          }
        />
        <meta property="og:title" content={`${route.name} — Dom Pietro Experience`} />
        <meta
          property="og:description"
          content={route.short_description || `Roteiro ${route.name} — Dom Pietro Experience`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://dompietro.com/roteiro/${route.slug}`}
        />
        <meta property="og:image" content="https://dompietro.com/og-image.png" />
        <link
          rel="canonical"
          href={`https://dompietro.com/roteiro/${route.slug}`}
        />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="bg-slate-950 text-white">
        {/* Breadcrumbs */}
        <nav className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors">
                Início
              </Link>
            </li>
            <li className="text-slate-600">/</li>
            <li>
              <Link
                to="/#experiencias"
                className="hover:text-emerald-400 transition-colors"
              >
                Roteiros
              </Link>
            </li>
            <li className="text-slate-600">/</li>
            <li className="text-white truncate max-w-[200px] sm:max-w-md">
              {route.name}
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="relative px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-800 border border-white/5 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4">
                {route.category_name && (
                  <span
                    className="inline-block text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: route.category_color
                        ? `${route.category_color}20`
                        : 'rgb(5 150 105 / 0.1)',
                      color: route.category_color || '#34d399',
                    }}
                  >
                    {route.category_name}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
                  {route.name}
                </h1>
                {(route.short_description || route.full_description) && (
                  <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                    {route.full_description || route.short_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Info + Gallery grid */}
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="text-2xl font-display font-bold text-white">
                  Sobre esta experiência
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {route.full_description || route.short_description || 'Experiência exclusiva Dom Pietro.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                  <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Preço
                    </span>
                    <p className="text-xl font-bold text-emerald-400">
                      {formatPrice(route.base_price)}
                    </p>
                  </div>
                  {route.duration_min !== null && (
                    <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        Duração
                      </span>
                      <p className="text-xl font-bold text-white">
                        {formatDuration(route.duration_min)}
                      </p>
                    </div>
                  )}
                  {route.distance_km !== null && (
                    <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        Distância
                      </span>
                      <p className="text-xl font-bold text-white">
                        {route.distance_km} km
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery placeholder */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-white">
                  Galeria
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    'from-emerald-900/30 to-slate-800',
                    'from-amber-900/30 to-slate-800',
                    'from-sky-900/30 to-slate-800',
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`h-40 rounded-xl bg-gradient-to-br ${gradient} border border-white/5 flex items-center justify-center`}
                    >
                      <svg
                        className="w-10 h-10 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Fotos em breve
                </p>
              </div>
            </div>

            {/* Sidebar — Availability widget */}
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-6 sticky top-24">
                <h3 className="text-lg font-display font-bold text-white">
                  Disponibilidade
                </h3>

                <div className="space-y-2">
                  <label
                    htmlFor="date-picker"
                    className="text-sm text-slate-400"
                  >
                    Selecione uma data
                  </label>
                  <input
                    id="date-picker"
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">
                      Horários disponíveis
                    </p>
                    {slotsLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-10 rounded-lg bg-slate-800 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : availability && availability.slots.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availability.slots.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSlotId(selectedSlotId === s.id ? '' : s.id);
                            }}
                            className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all ${
                              selectedSlotId === s.id
                                ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                : 'bg-slate-800/50 border-white/5 text-slate-300 hover:border-emerald-500/50'
                            }`}
                          >
                            <span className="font-medium">{s.time}</span>
                            <span className="text-xs text-slate-400">
                              {s.remaining_seats} vaga
                              {s.remaining_seats !== 1 ? 's' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhum horário disponível nesta data.
                      </p>
                    )}
                  </div>
                )}

                {!selectedDate && (
                  <p className="text-sm text-slate-500">
                    Escolha uma data para ver os horários disponíveis.
                  </p>
                )}

                <div className="pt-2 space-y-3">
                  <Link
                    to={`/roteiro/${route.slug}/reservar${selectedDate ? `?date=${selectedDate}&slot=${selectedSlotId}` : ''}`}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                  >
                    Reservar Online
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Reservar via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
