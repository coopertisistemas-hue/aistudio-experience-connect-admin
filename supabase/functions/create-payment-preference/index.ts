import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.4.1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreatePreferenceRequest {
  booking_hold_id: string;
  amount: number;
  description: string;
  payer_email: string;
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

  const { booking_hold_id, amount, description, payer_email, idempotency_key } = body;

  if (!booking_hold_id || !amount || !description) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: booking_hold_id, amount, description' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Idempotency check
  const idempotencyKey = idempotency_key || crypto.randomUUID();
  const { data: existingPreference } = await adminClient
    .from('payment_preferences')
    .select('preference_id, init_point')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (existingPreference) {
    return new Response(
      JSON.stringify({
        preference_id: existingPreference.preference_id,
        init_point: existingPreference.init_point,
        cached: true,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Fetch booking hold for tenant context
  const { data: hold, error: holdError } = await adminClient
    .from('booking_holds')
    .select('tenant_id, vehicle_id, passenger_count, seat_count')
    .eq('id', booking_hold_id)
    .single();

  if (holdError || !hold) {
    console.error('Booking hold not found:', holdError);
    return new Response(
      JSON.stringify({ error: 'Booking hold not found' }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: booking_hold_id,
            title: description,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: payer_email || '',
        },
        metadata: {
          booking_hold_id,
          tenant_id: hold.tenant_id,
        },
        back_urls: {
          success: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/success`,
          failure: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/failure`,
          pending: `${Deno.env.get('PUBLIC_APP_URL') || ''}/payment/pending`,
        },
        auto_return: 'approved',
        external_reference: booking_hold_id,
      },
    });

    const preferenceId = result.id!;
    const initPoint = result.init_point || result.sandbox_init_point || '';

    // Store preference in database
    const { error: insertError } = await adminClient
      .from('payment_preferences')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: hold.tenant_id,
        booking_hold_id,
        preference_id: preferenceId,
        init_point: initPoint,
        amount,
        description,
        payer_email: payer_email || null,
        idempotency_key: idempotencyKey,
        status: 'pending',
        created_at: new Date().toISOString(),
      } as any);

    if (insertError) {
      console.error('Failed to store payment preference:', insertError);
    }

    return new Response(
      JSON.stringify({ preference_id: preferenceId, init_point: initPoint }),
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
