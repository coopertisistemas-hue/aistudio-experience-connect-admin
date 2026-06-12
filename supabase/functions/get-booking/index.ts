import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GetBookingRequest {
  booking_id: string;
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

  // Auth optional — public booking lookup uses booking_id only
  const authHeader = req.headers.get('authorization');
  let authenticatedUserId: string | null = null;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (!authError && user) {
      authenticatedUserId = user.id;
    }
  }

  let body: GetBookingRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { booking_id } = body;
  if (!booking_id) {
    return new Response('Missing required field: booking_id', { status: 400, headers: CORS_HEADERS });
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .maybeSingle();

    if (bookingError) {
      console.error('Booking query error:', bookingError);
      return new Response(JSON.stringify({ error: bookingError.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const { data: route } = await adminClient
      .from('routes')
      .select('name, slug, origin, destination, duration_min, distance_km, base_price')
      .eq('id', booking.route_id)
      .maybeSingle();

    const { data: payments } = await adminClient
      .from('payments')
      .select('*')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: false });

    const { data: vehicleSlot } = await adminClient
      .from('vehicle_slots')
      .select('slot_start, slot_end, total_capacity, remaining_seats')
      .eq('id', booking.vehicle_slot_id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        booking,
        route: route || null,
        payments: payments || [],
        vehicle_slot: vehicleSlot || null,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('Exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
};
