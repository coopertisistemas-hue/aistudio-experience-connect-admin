import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InviteUserRequest {
  email: string;
  tenant_id: string;
  role: 'admin' | 'operator' | 'guest';
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
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

  let body: InviteUserRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { email, tenant_id, role } = body;

  if (!email || !tenant_id || !role) {
    return new Response('Missing required fields', { status: 400, headers: CORS_HEADERS });
  }

  if (!['admin', 'operator', 'guest'].includes(role)) {
    return new Response('Invalid role', { status: 400, headers: CORS_HEADERS });
  }

  // Validate inviter membership and admin role
  const { data: membership, error: membershipError } = await supabase
    .from('user_tenants')
    .select('role, status')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant_id)
    .single();

  if (membershipError || !membership || membership.status !== 'active') {
    return new Response('Forbidden: invalid tenant membership', { status: 403, headers: CORS_HEADERS });
  }

  if (membership.role !== 'admin') {
    return new Response('Forbidden: only admins can invite users', { status: 403, headers: CORS_HEADERS });
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const inviteToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await adminClient.from('invitations').insert({
      tenant_id,
      email,
      role,
      token: inviteToken,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const basePath = '';
    const inviteUrl = `${basePath}/invite/${inviteToken}`;

    return new Response(JSON.stringify({ invite_url: inviteUrl }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
};
