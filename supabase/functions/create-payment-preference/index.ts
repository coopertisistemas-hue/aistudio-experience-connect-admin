import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.4.1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreatePreferenceRequest {
  booking_hold_id: string;
  idempotency_key?: string;
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

  if (!mpAccessToken) {
    console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    return new Response(
      JSON.stringify({ error: 'Payment gateway not configured' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let body: CreatePreferenceRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { booking_hold_id, idempotency_key } = body;

  if (!booking_hold_id) {
    return new Response(
      JSON.stringify({ error: 'Missing required field: booking_hold_id' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Idempotency check
  const idempotencyKey = idempotency_key || crypto.randomUUID();
  const { data: existingPreference } = await adminClient
    .from('payment_preferences')
    .select('preference_id, init_point, payment_id')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (existingPreference) {
    return new Response(
      JSON.stringify({
        payment_id: existingPreference.payment_id,
        preference_id: existingPreference.preference_id,
        init_point: existingPreference.init_point,
        cached: true,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Fetch booking hold for tenant context and booking_id
  const { data: hold, error: holdError } = await adminClient
    .from('booking_holds')
    .select('tenant_id, booking_id, vehicle_id, passenger_count, seat_count, expires_at')
    .eq('id', booking_hold_id)
    .single();

  if (holdError || !hold) {
    console.error('Booking hold not found:', holdError);
    return new Response(
      JSON.stringify({ error: 'Booking hold not found' }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  if (!hold.booking_id) {
    console.error('Booking hold has no associated booking_id');
    return new Response(
      JSON.stringify({ error: 'Booking hold has no booking' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Fetch booking for amount and user_id
  const { data: booking, error: bookingError } = await adminClient
    .from('bookings')
    .select('total_amount, user_id, pickup_location, dropoff_location')
    .eq('id', hold.booking_id)
    .single();

  if (bookingError || !booking) {
    console.error('Booking not found:', bookingError);
    return new Response(
      JSON.stringify({ error: 'Associated booking not found' }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Fetch user for payer email
  const { data: user } = await adminClient
    .from('users')
    .select('email, full_name')
    .eq('id', booking.user_id)
    .single();

  const description = `Transfer ${hold.vehicle_id ? `- ${hold.passenger_count} pax` : ''} ${booking.pickup_location ? `${booking.pickup_location} → ${booking.dropoff_location || ''}` : ''}`.trim();

  try {
    // Step 1: Create payments row (status = 'pending')
    const paymentId = crypto.randomUUID();
    const { error: insertPaymentError } = await adminClient
      .from('payments')
      .insert({
        id: paymentId,
        tenant_id: hold.tenant_id,
        booking_id: hold.booking_id,
        user_id: booking.user_id,
        provider: 'mercado_pago',
        amount: booking.total_amount,
        currency: 'BRL',
        status: 'pending',
        idempotency_key: idempotencyKey,
        metadata: { booking_hold_id },
      });

    if (insertPaymentError) {
      console.error('Failed to create payment row:', insertPaymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // Step 2: Create Mercado Pago Preference with payments.id as external_reference
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: booking_hold_id,
            title: description,
            quantity: 1,
            unit_price: booking.total_amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: user?.email || '',
        },
        metadata: {
          booking_hold_id,
          booking_id: hold.booking_id,
          payment_id: paymentId,
          tenant_id: hold.tenant_id,
        },
        back_urls: {
          success: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/success`,
          failure: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/failure`,
          pending: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/pending`,
        },
        auto_return: 'approved',
        external_reference: paymentId,
      },
    });

    const preferenceId = result.id!;
    const initPoint = result.init_point || result.sandbox_init_point || '';

    // Step 3: Store preference in database
    const { error: insertError } = await adminClient
      .from('payment_preferences')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: hold.tenant_id,
        booking_hold_id,
        payment_id: paymentId,
        preference_id: preferenceId,
        init_point: initPoint,
        amount: booking.total_amount,
        description,
        payer_email: user?.email || null,
        idempotency_key: idempotencyKey,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to store payment preference:', insertError);
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentId,
        preference_id: preferenceId,
        init_point: initPoint,
        expires_at: hold.expires_at,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('Mercado Pago preference creation error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
};
