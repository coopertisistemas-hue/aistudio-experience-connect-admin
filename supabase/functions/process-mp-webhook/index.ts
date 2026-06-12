import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MPWebhookPayload {
  data?: {
    id?: string;
    external_reference?: string;
    status?: string;
  };
  type?: string;
}

async function verifySignature(
  secret: string,
  payload: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signatureHeader;
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
  const mpWebhookSecret = Deno.env.get('MP_WEBHOOK_SECRET');

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new Response('Invalid body', { status: 400, headers: CORS_HEADERS });
  }

  // Signature validation (if secret is configured)
  const signatureHeader = req.headers.get('x-signature');
  if (mpWebhookSecret) {
    const valid = await verifySignature(mpWebhookSecret, rawBody, signatureHeader);
    if (!valid) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 400, headers: CORS_HEADERS });
    }
  }

  // Compute payload hash for idempotency
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawBody));
  const payloadHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  let payload: MPWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const eventId = req.headers.get('x-idempotency-key') || payload.data?.id || payload.type || crypto.randomUUID();
  const provider = 'mercado_pago';

  // Extract payment info from external_reference
  const paymentId = payload.data?.external_reference;
  if (!paymentId) {
    return new Response('Missing external_reference', { status: 400, headers: CORS_HEADERS });
  }

  // Map MP event type to our event_type
  const mpStatus = payload.data?.status || '';
  let eventType = 'webhook_received';
  if (mpStatus === 'approved') eventType = 'confirmed';
  else if (mpStatus === 'rejected') eventType = 'failed';
  else if (mpStatus === 'refunded') eventType = 'refunded';

  // Fetch payment to get tenant_id and booking_id
  const { data: paymentRow, error: paymentError } = await adminClient
    .from('payments')
    .select('id, tenant_id, booking_id')
    .eq('id', paymentId)
    .single();

  if (paymentError || !paymentRow) {
    console.error('Payment not found:', paymentError);
    return new Response('Payment not found', { status: 400, headers: CORS_HEADERS });
  }

  const correlationId = crypto.randomUUID();

  try {
    const { data, error } = await adminClient.rpc('process_mp_webhook', {
      p_provider: provider,
      p_event_id: eventId,
      p_payload_hash: payloadHash,
      p_payment_id: paymentRow.id,
      p_tenant_id: paymentRow.tenant_id,
      p_booking_id: paymentRow.booking_id,
      p_event_type: eventType,
      p_provider_event_id: payload.data?.id || '',
      p_payload: payload,
      p_correlation_id: correlationId,
    });

    if (error) {
      console.error('Webhook RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const isDuplicate = !data;

    // If payment approved, confirm the booking
    if (eventType === 'confirmed' && !isDuplicate) {
      const confirmIdempotencyKey = `confirm-${paymentRow.booking_id}-${paymentRow.id}-${Date.now()}`;
      const { error: confirmError } = await adminClient.rpc('confirm_booking_from_payment', {
        p_tenant_id: paymentRow.tenant_id,
        p_booking_id: paymentRow.booking_id,
        p_payment_id: paymentRow.id,
        p_idempotency_key: confirmIdempotencyKey,
      });

      if (confirmError) {
        console.error('confirm_booking_from_payment RPC error:', confirmError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, duplicate: isDuplicate, correlation_id: correlationId }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Webhook exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
};
