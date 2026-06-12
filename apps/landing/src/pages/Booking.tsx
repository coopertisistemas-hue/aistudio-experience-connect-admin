import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { usePublicRoute, useRouteAvailability } from '@/hooks/usePublicRoutes';
import { useCreateBookingHold, useCreatePaymentPreference } from '@/hooks/usePublicBookings';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDuration(min: number | null): string | null {
  if (min === null || min === undefined) return null;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
}

type Step = 'route' | 'slot' | 'guest' | 'confirm' | 'payment';

interface GuestForm {
  name: string;
  email: string;
  phone: string;
  count: string;
}

const initialGuest: GuestForm = { name: '', email: '', phone: '', count: '1' };

const steps: { id: Step; label: string; step: number }[] = [
  { id: 'route', label: 'Roteiro', step: 1 },
  { id: 'slot', label: 'Data e Horário', step: 2 },
  { id: 'guest', label: 'Informações', step: 3 },
  { id: 'confirm', label: 'Confirmar', step: 4 },
];

export function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().split('T')[0];

  const [currentStep, setCurrentStep] = useState<Step>('route');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedSlotId, setSelectedSlotId] = useState(searchParams.get('slot') || '');
  const [guest, setGuest] = useState<GuestForm>(initialGuest);
  const [errors, setErrors] = useState<Partial<Record<keyof GuestForm, string>>>({});
  const [holdError, setHoldError] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { data: route, isLoading, isError, refetch } = usePublicRoute(slug ?? '');
  const { data: availability, isLoading: slotsLoading } = useRouteAvailability(selectedDate || null);
  const createHold = useCreateBookingHold();
  const createPref = useCreatePaymentPreference();

  const slot = availability?.slots.find((s) => s.id === selectedSlotId);

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId('');
  };

  const selectSlot = (id: string) => {
    setSelectedSlotId(id);
  };

  const set = (key: keyof GuestForm, value: string) => {
    setGuest((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateGuest = (): boolean => {
    const e: Partial<Record<keyof GuestForm, string>> = {};
    if (!guest.name.trim()) e.name = 'Nome obrigatório';
    if (!guest.email.trim()) e.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(guest.email)) e.email = 'E-mail inválido';
    if (!guest.phone.trim()) e.phone = 'Telefone obrigatório';
    if (!guest.count || Number(guest.count) < 1) e.count = 'Mínimo 1 passageiro';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    if (!route || !selectedSlotId) return;
    setHoldError(null);
    setPrefError(null);

    const holdResult = await createHold.mutateAsync({
      routeId: route.id,
      slotId: selectedSlotId,
      passengerName: guest.name,
      passengerCount: Number(guest.count) || 1,
      email: guest.email,
      phone: guest.phone || undefined,
      tenantId: import.meta.env.VITE_PUBLIC_TENANT_ID || '',
    });

    if (!holdResult) {
      setHoldError('Erro ao criar reserva. Tente novamente.');
      return;
    }

    setBookingId(holdResult.bookingId);

    sessionStorage.setItem(
      `booking:${holdResult.bookingId}`,
      JSON.stringify({
        id: holdResult.bookingId,
        reference: `BK-${holdResult.bookingId.slice(-4).toUpperCase()}`,
        route_name: route.name,
        passenger_name: guest.name,
        passenger_email: guest.email,
        passenger_phone: guest.phone || '',
        passenger_count: Number(guest.count) || 1,
        scheduled_at: slot?.time ? `${selectedDate}T${slot.time}` : selectedDate,
        total_amount: route.base_price,
        status: 'hold_created' as const,
        payment_status: 'pending' as const,
      }),
    );

    goToStep('payment');

    const prefResult = await createPref.mutateAsync(holdResult.holdId);

    if (!prefResult) {
      setPrefError('Reserva criada, mas houve um erro ao gerar o pagamento.');
      return;
    }

    setInitPoint(prefResult.initPoint);
  };

  const progress = ((steps.findIndex((s) => s.id === currentStep) + 1) / steps.length) * 100;
  const isPaymentStep = currentStep === 'payment';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white animate-pulse">
        <div className="max-w-3xl mx-auto px-6 py-24 space-y-6">
          <div className="h-4 w-48 bg-slate-800 rounded" />
          <div className="h-8 w-64 bg-slate-800 rounded" />
          <div className="h-40 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <p className="text-xl text-slate-400 font-display">Erro ao carregar roteiro</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold font-display text-emerald-400">404</h1>
          <p className="text-xl text-slate-400">Roteiro não encontrado</p>
          <Link to="/" className="inline-flex rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reservar — {route.name} — Dom Pietro Experience</title>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Breadcrumbs */}
        <nav className="max-w-3xl mx-auto px-6 pt-24 pb-2">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link></li>
            <li className="text-slate-600">/</li>
            <li><Link to="/#experiencias" className="hover:text-emerald-400 transition-colors">Roteiros</Link></li>
            <li className="text-slate-600">/</li>
            <li><Link to={`/roteiro/${route.slug}`} className="hover:text-emerald-400 transition-colors">{route.name}</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-white truncate">Reservar</li>
          </ol>
        </nav>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Steps nav */}
        <div className="max-w-3xl mx-auto px-6 pb-6">
          <div className="flex gap-2">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id === 'route' || (s.id === 'slot' && selectedDate) || (s.id === 'guest' && selectedSlotId) || s.id === 'confirm') {
                    goToStep(s.id);
                  }
                }}
                disabled={isPaymentStep}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  currentStep === s.id
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : steps.findIndex((x) => x.id === currentStep) > steps.findIndex((x) => x.id === s.id)
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-slate-800 text-slate-500'
                } ${isPaymentStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${
                  currentStep === s.id ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                }`}>
                  {s.step}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 pb-24">
          {isPaymentStep ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                {initPoint ? (
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-emerald-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold">
                  {initPoint ? 'Reserva criada com sucesso!' : 'Criando sua reserva...'}
                </h2>
                <p className="text-slate-400 mt-2">
                  {initPoint
                    ? 'Clique no botão abaixo para realizar o pagamento via Mercado Pago.'
                    : prefError
                      ? 'Aguardando confirmação...'
                      : 'Estamos gerando o link de pagamento.'}
                </p>
              </div>

              {holdError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{holdError}</p>
                </div>
              )}

              {prefError && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-amber-400 text-sm">{prefError}</p>
                </div>
              )}

              {initPoint && (
                <div className="space-y-3">
                  <a
                    href={initPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ir para Pagamento
                  </a>
                  <div>
                    <Link
                      to={`/reserva/${bookingId}/confirmacao`}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      Acompanhar status da reserva &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {!initPoint && !prefError && (
                <p className="text-xs text-slate-500">Não feche esta página.</p>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Step 1: Route Summary */}
              {currentStep === 'route' && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold">{route.name}</h2>
                      <p className="text-sm text-slate-400">{route.short_description || 'Experiência exclusiva Dom Pietro.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Preço</span>
                      <p className="text-lg font-bold text-emerald-400">{formatPrice(route.base_price)}</p>
                    </div>
                    {route.duration_min !== null && (
                      <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Duração</span>
                        <p className="text-lg font-bold text-white">{formatDuration(route.duration_min)}</p>
                      </div>
                    )}
                    {route.distance_km !== null && (
                      <div className="rounded-lg bg-slate-800/50 p-4 space-y-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Distância</span>
                        <p className="text-lg font-bold text-white">{route.distance_km} km</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStep('slot')}
                    className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {/* Step 2: Slot Selection */}
              {currentStep === 'slot' && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-display font-bold">Escolha a Data e Horário</h2>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="date-picker" className="text-sm text-slate-400">Selecione uma data</label>
                    <input
                      id="date-picker"
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => selectDate(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 [color-scheme:dark]"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400">Horários disponíveis</p>
                      {slotsLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-lg bg-slate-800 animate-pulse" />
                          ))}
                        </div>
                      ) : availability && availability.slots.length > 0 ? (
                        <div className="space-y-2">
                          {availability.slots.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectSlot(s.id)}
                              disabled={s.remaining_seats === 0}
                              className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all ${
                                selectedSlotId === s.id
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                  : s.remaining_seats === 0
                                    ? 'bg-slate-800/30 border-slate-700 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800/50 border-white/5 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-medium">{s.time}</span>
                              <span className="text-xs">
                                {s.remaining_seats === 0
                                  ? 'Esgotado'
                                  : `${s.remaining_seats} vaga${s.remaining_seats !== 1 ? 's' : ''}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Nenhum horário disponível nesta data.</p>
                      )}
                    </div>
                  )}

                  {!selectedDate && (
                    <p className="text-sm text-slate-500">Escolha uma data para ver os horários disponíveis.</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep('route')}
                      className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 text-sm font-medium transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep('guest')}
                      disabled={!selectedSlotId}
                      className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Guest Info */}
              {currentStep === 'guest' && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-display font-bold">Suas Informações</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Nome completo <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Seu nome"
                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          errors.name ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5">E-mail <span className="text-red-400">*</span></label>
                        <input
                          type="email"
                          value={guest.email}
                          onChange={(e) => set('email', e.target.value)}
                          placeholder="email@exemplo.com"
                          className={`w-full rounded-lg bg-slate-800 border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                            errors.email ? 'border-red-500' : 'border-white/10'
                          }`}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Telefone <span className="text-red-400">*</span></label>
                        <input
                          type="tel"
                          value={guest.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          placeholder="+55 21 99999-0000"
                          className={`w-full rounded-lg bg-slate-800 border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                            errors.phone ? 'border-red-500' : 'border-white/10'
                          }`}
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Número de passageiros <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={guest.count}
                        onChange={(e) => set('count', e.target.value)}
                        className={`w-full sm:w-32 rounded-lg bg-slate-800 border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          errors.count ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.count && <p className="text-red-400 text-xs mt-1">{errors.count}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep('slot')}
                      className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 text-sm font-medium transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateGuest()) goToStep('confirm');
                      }}
                      className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 'confirm' && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-display font-bold">Confirme sua Reserva</h2>
                  </div>

                      <div className="rounded-lg bg-slate-800/50 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Roteiro</span>
                          <span className="text-sm text-white font-medium">{route.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Preço</span>
                          <span className="text-sm text-emerald-400 font-bold">{formatPrice(route.base_price)}</span>
                        </div>
                        {route.duration_min !== null && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Duração</span>
                            <span className="text-sm text-white">{formatDuration(route.duration_min)}</span>
                          </div>
                        )}
                      </div>

                      {slot && (
                        <div className="rounded-lg bg-slate-800/50 p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Data</span>
                            <span className="text-sm text-white font-medium">
                              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Horário</span>
                            <span className="text-sm text-white font-medium">{slot.time}</span>
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg bg-slate-800/50 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Nome</span>
                          <span className="text-sm text-white font-medium">{guest.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">E-mail</span>
                          <span className="text-sm text-white">{guest.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Telefone</span>
                          <span className="text-sm text-white">{guest.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Passageiros</span>
                          <span className="text-sm text-white font-medium">{guest.count}</span>
                        </div>
                      </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep('guest')}
                      disabled={createHold.isPending}
                      className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={createHold.isPending}
                      className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {createHold.isPending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Criando reserva...
                        </>
                      ) : (
                        'Ir para Pagamento'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
