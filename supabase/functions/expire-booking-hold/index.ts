import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ExpireBookingHoldRequest {
  hold_id: string;
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

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }

  const token = authHeader.replace('Bearer ', '');

  let body: ExpireBookingHoldRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { hold_id } = body;
  if (!hold_id) {
    return new Response('Missing required fields', { status: 400, headers: CORS_HEADERS });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // SYSTEM-ONLY GATE: accept service_role key directly (cron / internal orchestration)
  if (token === supabaseServiceKey) {
    try {
      const { data, error } = await adminClient.rpc('expire_booking_hold', {
        p_hold_id: hold_id,
      });

      if (error) {
        console.error('RPC error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, expired: data }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Exception:', err);
      return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }
  }

  // OPERATIONAL FALLBACK: admin/operator JWT with explicit authorization check
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }

  // Verify caller is admin or operator in at least one tenant
  const { data: membership, error: membershipError } = await supabase
    .from('user_tenants')
    .select('role, status')
    .eq('user_id', user.id)
    .in('role', ['admin', 'operator'])
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return new Response('Forbidden: operational access required', { status: 403, headers: CORS_HEADERS });
  }

  try {
    const { data, error } = await adminClient.rpc('expire_booking_hold', {
      p_hold_id: hold_id,
      p_admin_id: user.id,
    });

    if (error) {
      console.error('RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, expired: data }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
};
