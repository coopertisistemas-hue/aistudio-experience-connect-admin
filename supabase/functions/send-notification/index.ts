import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SendNotificationRequest {
  booking_id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'checkin_reminder';
}

function buildBookingConfirmedEmail(params: {
  guestName: string;
  routeName: string;
  scheduledAt: string;
  pickupLocation: string;
  dropoffLocation: string;
  passengerCount: number;
  totalAmount: number;
  tenantName: string;
}): { subject: string; html: string } {
  const date = new Date(params.scheduledAt);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  });

  const subject = `Reserva Confirmada — ${params.tenantName}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#1a365d;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Reserva Confirmada</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">${params.tenantName}</p>
      </td></tr>
      <tr><td style="padding:32px">
        <p style="margin:0 0 16px;font-size:16px;color:#1a202c">Ola <strong>${params.guestName}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6">Sua reserva foi confirmada com sucesso! Abaixo estao os detalhes do seu transfer:</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px">
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b;width:120px">Rota</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c;font-weight:500">${params.routeName}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Data</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c">${formattedDate}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Horario</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c">${formattedTime}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Origem</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c">${params.pickupLocation}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Destino</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c">${params.dropoffLocation}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Passageiros</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c">${params.passengerCount}</td></tr>
          <tr><td style="padding:8px 16px;font-size:13px;color:#64748b">Total pago</td>
              <td style="padding:8px 16px;font-size:14px;color:#1a202c;font-weight:600">R$ ${params.totalAmount.toFixed(2)}</td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center">
          Se precisar de ajuda, entre em contato conosco.
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#94a3b8">${params.tenantName} &mdash; Experience Connect</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  return { subject, html };
}

async function sendEmailViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Experience Connect <noreply@experienceconnect.app>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[sendEmailViaResend] Error:', res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[sendEmailViaResend] Exception:', err);
    return false;
  }
}

async function lookupBooking(
  adminClient: ReturnType<typeof createClient>,
  bookingId: string,
) {
  const { data: booking, error: bookingError } = await adminClient
    .from('bookings')
    .select('tenant_id, user_id, route_id, scheduled_at, pickup_location, dropoff_location, passenger_count, total_amount')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) return null;

  const { data: guest } = await adminClient
    .from('users')
    .select('email, full_name')
    .eq('id', booking.user_id)
    .single();

  const { data: route } = await adminClient
    .from('routes')
    .select('name')
    .eq('id', booking.route_id)
    .single();

  const { data: tenant } = await adminClient
    .from('tenants')
    .select('name')
    .eq('id', booking.tenant_id)
    .single();

  return {
    booking,
    guestName: guest?.full_name || 'Cliente',
    guestEmail: guest?.email,
    routeName: route?.name || 'Transfer',
    tenantName: tenant?.name || 'Experience Connect',
  };
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

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let body: SendNotificationRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
  }

  const { booking_id, type } = body;

  if (!booking_id || !type) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: booking_id, type' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const info = await lookupBooking(adminClient, booking_id);
    if (!info) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const { booking, guestName, guestEmail, routeName, tenantName } = info;

    if (type === 'booking_confirmed') {
      const { subject, html } = buildBookingConfirmedEmail({
        guestName,
        routeName,
        scheduledAt: booking.scheduled_at,
        pickupLocation: booking.pickup_location || '—',
        dropoffLocation: booking.dropoff_location || '—',
        passengerCount: booking.passenger_count,
        totalAmount: booking.total_amount,
        tenantName,
      });

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      let emailSent = false;

      if (resendApiKey && guestEmail) {
        emailSent = await sendEmailViaResend(resendApiKey, guestEmail, subject, html);
      }

      const notificationId = crypto.randomUUID();
      const { error: notifError } = await adminClient
        .from('notifications')
        .insert({
          id: notificationId,
          tenant_id: booking.tenant_id,
          user_id: booking.user_id,
          type: 'booking_confirmed',
          category: 'Reservas',
          severity: 'success',
          title: 'Reserva confirmada',
          message: `Sua reserva para ${routeName} em ${new Date(booking.scheduled_at).toLocaleDateString('pt-BR')} foi confirmada.`,
          booking_id: booking_id,
          entity_ref: booking_id,
          entity_label: `Reserva #${booking_id.slice(0, 8)}`,
        });

      if (notifError) {
        console.error('[send-notification] Failed to insert notification:', notifError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          notification_id: notificationId,
          email_sent: emailSent,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ error: `Unsupported notification type: ${type}` }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[send-notification] Exception:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
};
