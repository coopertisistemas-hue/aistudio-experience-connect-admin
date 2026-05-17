import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CancelBookingRequest {
  tenant_id: string;
  booking_id: string;
  reason?: string;
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }

  let body: CancelBookingRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { tenant_id, booking_id, reason } = body;
  if (!tenant_id || !booking_id) {
    return new Response('Missing required fields', { status: 400, headers: CORS_HEADERS });
  }

  // Validate membership (admin or operator)
  const { data: membership, error: membershipError } = await supabase
    .from('user_tenants')
    .select('role, status')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant_id)
    .single();

  if (membershipError || !membership || membership.status !== 'active') {
    return new Response('Forbidden: invalid tenant membership', { status: 403, headers: CORS_HEADERS });
  }

  const allowedRoles = ['admin', 'operator'];
  if (!allowedRoles.includes(membership.role)) {
    return new Response('Forbidden: insufficient privileges', { status: 403, headers: CORS_HEADERS });
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await adminClient.rpc('cancel_booking', {
      p_tenant_id: tenant_id,
      p_booking_id: booking_id,
      p_reason: reason || 'Cancellation requested',
    });

    if (error) {
      console.error('RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, cancelled: data }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
};
