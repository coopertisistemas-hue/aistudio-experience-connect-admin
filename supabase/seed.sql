-- Seed data for local development and validation

-- Tenant
INSERT INTO tenants (id, slug, name, status, plan)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'dom-pietro',
  'Dom Pietro Experience',
  'active',
  'pro'
)
ON CONFLICT (slug) DO NOTHING;

-- Vehicles
INSERT INTO vehicles (id, tenant_id, name, type, plate, capacity, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Van Executiva Mercedes',
  'van',
  'ABC1D23',
  15,
  'available'
)
ON CONFLICT DO NOTHING;

-- Vehicle slots for tomorrow at 10:00 and 14:00
INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, held_seats, reserved_seats, remaining_seats, status)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  (now() + interval '1 day')::date + interval '10 hours',
  (now() + interval '1 day')::date + interval '11 hours',
  15,
  0,
  0,
  15,
  'available'
), (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  (now() + interval '1 day')::date + interval '14 hours',
  (now() + interval '1 day')::date + interval '15 hours',
  15,
  0,
  0,
  15,
  'available'
)
ON CONFLICT DO NOTHING;
