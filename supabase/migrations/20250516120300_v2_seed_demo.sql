-- Migration: V2 Demo Seed
-- Dom Pietro Experience Connect
-- Realistic demo data for the Dom Pietro Experience tenant

-- ============================================
-- TENANT: Dom Pietro Experience
-- ============================================
INSERT INTO tenants (id, slug, name, status, settings, branding, plan)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'dom-pietro-experience',
  'Dom Pietro Experience',
  'active',
  '{"timezone": "America/Sao_Paulo", "currency": "BRL", "locale": "pt-BR"}'::jsonb,
  '{"primary_color": "#1a365d", "logo_url": null}'::jsonb,
  'pro'
);

-- ============================================
-- USERS
-- ============================================
-- Note: In production, auth.users rows are created by Supabase Auth.
-- For demo seed, we insert placeholder auth.users and profiles.

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@dompietro.com.br', '{}', '{"full_name": "Administrador Dom Pietro"}'),
  ('a0000000-0000-0000-0000-000000000002', 'operador@dompietro.com.br', '{}', '{"full_name": "Operador Dom Pietro"}'),
  ('a0000000-0000-0000-0000-000000000003', 'motorista@dompietro.com.br', '{}', '{"full_name": "João Motorista"}'),
  ('a0000000-0000-0000-0000-000000000004', 'hospede@email.com', '{}', '{"full_name": "Hóspede Demo"}');

INSERT INTO users (id, email, phone, full_name, status, metadata) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@dompietro.com.br', '+5549988012345', 'Administrador Dom Pietro', 'active', '{"is_super_admin": "true"}'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'operador@dompietro.com.br', '+5549988012346', 'Operador Dom Pietro', 'active', '{}'::jsonb),
  ('a0000000-0000-0000-0000-000000000003', 'motorista@dompietro.com.br', '+5549988012347', 'João Motorista', 'active', '{}'::jsonb),
  ('a0000000-0000-0000-0000-000000000004', 'hospede@email.com', '+5549988012348', 'Hóspede Demo', 'active', '{}'::jsonb);

INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin', 'active'),
  ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'operator', 'active'),
  ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'driver', 'active'),
  ('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'guest', 'active');

-- ============================================
-- SERVED LODGINGS (Pousadas)
-- ============================================
INSERT INTO served_lodgings (id, tenant_id, name, contact_person, phone, whatsapp, address, pickup_point, notes, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Pousada Dom Pietro', 'Carlos Pietro', '+5549988011111', '+5549988011111', 'Rua das Flores, 123 — Urubici, SC', 'Recepção principal', 'Pousada principal do grupo. Check-in a partir das 14h.', 'active'),
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Chalés da Serra', 'Maria Serra', '+5549988022222', '+5549988022222', 'Estrada Geral da Serra, km 5 — Urubici, SC', 'Estacionamento dos chalés', 'Chalés rústicos com vista para a serra.', 'active');

-- ============================================
-- DRIVERS
-- ============================================
INSERT INTO drivers (id, tenant_id, user_id, name, phone, whatsapp, document, status, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'João Motorista', '+5549988012347', '+5549988012347', '123.456.789-00', 'active', 'Motorista principal. Especialista em estradas de serra.'),
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', NULL, 'Pedro Condutor', '+5549988033333', '+5549988033333', '987.654.321-00', 'active', 'Motorista reserva. Disponível fins de semana.');

-- ============================================
-- VEHICLES
-- ============================================
INSERT INTO vehicles (id, tenant_id, name, type, plate, model, capacity, color, status, default_driver_id, notes) VALUES
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'VAN Dom Pietro 01', 'van', 'MVC-1234', 'Mercedes-Benz Sprinter 416', 15, 'Branca', 'available', 'c0000000-0000-0000-0000-000000000001', 'Van principal. Ar-condicionado, Wi-Fi, cadeirinha disponível.'),
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'VAN Dom Pietro 02', 'van', 'MVC-5678', 'Renault Master', 16, 'Prata', 'available', 'c0000000-0000-0000-0000-000000000002', 'Van reserva.');

-- Update driver default_vehicle FK now that vehicles exist
UPDATE drivers SET default_vehicle_id = 'd0000000-0000-0000-0000-000000000001' WHERE id = 'c0000000-0000-0000-0000-000000000001';
UPDATE drivers SET default_vehicle_id = 'd0000000-0000-0000-0000-000000000002' WHERE id = 'c0000000-0000-0000-0000-000000000002';

-- ============================================
-- ROUTE CATEGORIES
-- ============================================
INSERT INTO route_categories (id, tenant_id, name, slug, description, sort_order, is_active) VALUES
  ('e0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Mirantes', 'mirantes', 'Os mirantes mais espetaculares de Urubici e região.', 1, true),
  ('e0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Cachoeiras', 'cachoeiras', 'Cachoeiras de águas cristalinas no planalto catarinense.', 2, true),
  ('e0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Gastronomia', 'gastronomia', 'Tour gastronômico pelos melhores restaurantes da região.', 3, true),
  ('e0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Aventura', 'aventura', 'Experiências de aventura e ecoturismo.', 4, true);

-- ============================================
-- ROUTES / EXPERIENCES
-- ============================================
INSERT INTO routes (id, tenant_id, category_id, name, slug, short_description, full_description, origin, destination, distance_km, duration_min, base_price, images, included_items, pickup_info, operational_notes, is_active) VALUES
  ('f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Morro da Igreja', 'morro-da-igreja', 'O ponto mais alto do Sul do Brasil.', 'O Morro da Igreja é um dos principais cartões-postais de Urubici. Com 1.822m de altitude, oferece uma vista panorâmica de tirar o fôlego. No inverno, é comum registrar temperaturas negativas e geada.', 'Centro de Urubici', 'Morro da Igreja', 18.0, 120, 120.00, '["morro_igreja_01.jpg", "morro_igreja_02.jpg"]'::jsonb, '["Transporte ida e volta", "Guia local", "Café da manhã no mirante"]'::jsonb, 'Saída às 05:30 para contemplar o nascer do sol.', 'Não recomendado para gestantes ou pessoas com problemas cardíacos.', true),
  ('f0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Serra do Corvo Branco', 'serra-do-corvo-branco', 'Uma das estradas mais espetaculares do Brasil.', 'A Serra do Corvo Branco impressiona por seus paredões de rocha e a estrada escavada na pedra. Um passeio de tirar o fôlego para quem aprecia paisagens montanhosas.', 'Centro de Urubici', 'Serra do Corvo Branco', 35.0, 180, 150.00, '["corvo_branco_01.jpg"]'::jsonb, '["Transporte ida e volta", "Paradas para fotos"]'::jsonb, 'Saída às 08:00 ou 14:00.', 'Estrada de terra em alguns trechos. Pode ser cancelado em caso de chuva forte.', true),
  ('f0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Cachoeira do Avencal', 'cachoeira-do-avencal', 'Queda d''água de 100m de altura.', 'A Cachoeira do Avencal é uma das mais impressionantes da região. O acesso é por trilha leve de aproximadamente 800m. Banho liberado na poça natural.', 'Centro de Urubici', 'Cachoeira do Avencal', 12.0, 150, 90.00, '["avencal_01.jpg", "avencal_02.jpg"]'::jsonb, '["Transporte", "Guia", "Lanche"]'::jsonb, 'Saída às 09:00.', 'Levar roupa de banho e repelente.', true),
  ('f0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Morro do Campestre', 'morro-do-campestre', 'Mirante panorâmico com acesso em 4x4.', 'O Morro do Campestre oferece uma vista de 360 graus da região de Urubici. O acesso é feito por estrada de terra que exige veículo 4x4.', 'Centro de Urubici', 'Morro do Campestre', 22.0, 150, 130.00, '["campestre_01.jpg"]'::jsonb, '["Transporte 4x4", "Guia"]'::jsonb, 'Saída às 15:00 para contemplar o pôr do sol.', 'Pode ser cancelado em caso de chuva.', true),
  ('f0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'Cânion Espraiado', 'canion-espraiado', 'Trilha até o cânion com vista panorâmica.', 'O Cânion Espraiado é uma formação geológica impressionante. A trilha de acesso tem dificuldade moderada e leva cerca de 45 minutos.', 'Centro de Urubici', 'Cânion Espraiado', 40.0, 300, 180.00, '["canion_01.jpg"]'::jsonb, '["Transporte", "Guia especializado", "Lanche da tarde"]'::jsonb, 'Saída às 07:00.', 'Levar tênis de trilha e água.', true),
  ('f0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Tour Gastronômico', 'tour-gastronomico', 'Passeio pelos melhores restaurantes de Urubici.', 'Um tour cuidadosamente curado pelos sabores de Urubici. Visitamos restaurantes selecionados que valorizam a gastronomia local e produtos orgânicos.', 'Centro de Urubici', 'Restaurantes selecionados', 10.0, 240, 200.00, '["gastronomico_01.jpg"]'::jsonb, '["Transporte", "Menu degustação em 3 restaurantes", "1 taça de vinho por parada"]'::jsonb, 'Saída às 19:00.', 'Avisar sobre restrições alimentares com antecedência.', true);

-- ============================================
-- PARTNERS
-- ============================================
INSERT INTO partners (id, tenant_id, partner_type, name, contact_name, phone, whatsapp, address, notes, status) VALUES
  ('a0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'restaurant', 'Montês Restaurante', 'Chef Ricardo', '+5549988044444', '+5549988044444', 'Rua Principal, 45 — Urubici, SC', 'Cozinha contemporânea com ingredientes locais. Capacidade: 60 pessoas.', 'active'),
  ('a0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'restaurant', 'Manali Bistrô', 'Proprietária Ana', '+5549988055555', '+5549988055555', 'Estrada do Morro, 78 — Urubici, SC', 'Bistrô aconchegante com vista para a serra.', 'active'),
  ('a0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'restaurant', 'Quinta das Bromélias', 'Dono Sérgio', '+5549988066666', '+5549988066666', 'Rodovia SC-439, km 12 — Urubici, SC', 'Especializado em carnes e fondues.', 'active'),
  ('a0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'restaurant', 'La Man Bistrô', 'Chef Laura', '+5549988077777', '+5549988077777', 'Centro Histórico, 22 — Urubici, SC', 'Culinária francesa com toque serrano.', 'active'),
  ('a0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 'attraction', 'Paradouro Santo Antônio', 'Gerente Carlos', '+5549988088888', '+5549988088888', 'Alto da Serra, s/n — Urubici, SC', 'Mirante com café colonial. Excelente para grupos.', 'active');

-- ============================================
-- VEHICLE SLOTS (Inventory for upcoming dates)
-- ============================================
INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats) VALUES
  ('b0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day' + INTERVAL '8 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', NOW() + INTERVAL '1 day' + INTERVAL '18 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 day' + INTERVAL '8 hours', NOW() + INTERVAL '2 day' + INTERVAL '12 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 day' + INTERVAL '14 hours', NOW() + INTERVAL '2 day' + INTERVAL '18 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 day' + INTERVAL '8 hours', NOW() + INTERVAL '3 day' + INTERVAL '12 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 day' + INTERVAL '14 hours', NOW() + INTERVAL '3 day' + INTERVAL '18 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '4 day' + INTERVAL '8 hours', NOW() + INTERVAL '4 day' + INTERVAL '12 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '4 day' + INTERVAL '14 hours', NOW() + INTERVAL '4 day' + INTERVAL '18 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '5 day' + INTERVAL '8 hours', NOW() + INTERVAL '5 day' + INTERVAL '12 hours', 15, 15),
  ('b0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '5 day' + INTERVAL '14 hours', NOW() + INTERVAL '5 day' + INTERVAL '18 hours', 15, 15);

-- ============================================
-- BOOKINGS (various states)
-- ============================================
INSERT INTO bookings (id, tenant_id, user_id, route_id, vehicle_id, vehicle_slot_id, driver_id, served_lodging_id, booking_type, status, scheduled_at, scheduled_end_at, pickup_location, dropoff_location, passenger_count, seat_count, luggage_count, special_requests, total_amount, notes, idempotency_key) VALUES
  -- draft
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', NULL, 'b0000000-0000-0000-0000-000000000001', 'experience', 'draft', NOW() + INTERVAL '1 day' + INTERVAL '8 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours', 'Pousada Dom Pietro', 'Morro da Igreja', 2, 2, 1, 'Um hóspede vegetariano', 240.00, 'Aguardando confirmação do hóspede.', 'demo-booking-draft-001'),
  -- hold_created
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', NULL, 'b0000000-0000-0000-0000-000000000001', 'experience', 'hold_created', NOW() + INTERVAL '2 day' + INTERVAL '8 hours', NOW() + INTERVAL '2 day' + INTERVAL '12 hours', 'Pousada Dom Pietro', 'Serra do Corvo Branco', 4, 4, 2, NULL, 600.00, NULL, 'demo-booking-hold-001'),
  -- payment_pending
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000014', NULL, 'b0000000-0000-0000-0000-000000000002', 'experience', 'payment_pending', NOW() + INTERVAL '3 day' + INTERVAL '8 hours', NOW() + INTERVAL '3 day' + INTERVAL '12 hours', 'Chalés da Serra', 'Cachoeira do Avencal', 3, 3, 0, NULL, 270.00, NULL, 'demo-booking-paypending-001'),
  -- confirmed
  ('c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'experience', 'confirmed', NOW() + INTERVAL '4 day' + INTERVAL '14 hours', NOW() + INTERVAL '4 day' + INTERVAL '18 hours', 'Pousada Dom Pietro', 'Morro do Campestre', 6, 6, 3, 'Cadeirinha infantil necessária', 780.00, 'Pagamento confirmado via PIX.', 'demo-booking-confirmed-001'),
  -- cancelled
  ('c0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000018', NULL, 'b0000000-0000-0000-0000-000000000001', 'experience', 'cancelled', NOW() + INTERVAL '5 day' + INTERVAL '8 hours', NOW() + INTERVAL '5 day' + INTERVAL '12 hours', 'Pousada Dom Pietro', 'Cânion Espraiado', 2, 2, 1, NULL, 360.00, 'Cancelado pelo hóspede por motivo de saúde.', 'demo-booking-cancelled-001'),
  -- completed
  ('c0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'experience', 'completed', NOW() - INTERVAL '2 day' + INTERVAL '19 hours', NOW() - INTERVAL '2 day' + INTERVAL '23 hours', 'Chalés da Serra', 'Restaurantes selecionados', 2, 2, 0, 'Restrição alimentar: sem glúten', 400.00, 'Tour realizado com sucesso.', 'demo-booking-completed-001');

-- ============================================
-- BOOKING_HOLDS
-- ============================================
INSERT INTO booking_holds (id, tenant_id, booking_id, vehicle_id, vehicle_slot_id, passenger_count, seat_count, hold_start, hold_end, expires_at, status, idempotency_key) VALUES
  ('d0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 4, 4, NOW() + INTERVAL '2 day' + INTERVAL '8 hours', NOW() + INTERVAL '2 day' + INTERVAL '12 hours', NOW() + INTERVAL '15 minutes', 'active', 'demo-hold-001'),
  ('d0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000016', 6, 6, NOW() + INTERVAL '4 day' + INTERVAL '14 hours', NOW() + INTERVAL '4 day' + INTERVAL '18 hours', NOW() + INTERVAL '1 day', 'converted', 'demo-hold-002');

-- Update slots to reflect holds
UPDATE vehicle_slots SET held_seats = 4, remaining_seats = 11, status = 'held' WHERE id = 'b0000000-0000-0000-0000-000000000012';
UPDATE vehicle_slots SET reserved_seats = 6, remaining_seats = 9, status = 'reserved' WHERE id = 'b0000000-0000-0000-0000-000000000016';

-- ============================================
-- BOOKING_PASSENGERS
-- ============================================
INSERT INTO booking_passengers (id, tenant_id, booking_id, full_name, document, age_group) VALUES
  ('e0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Maria Silva', '123.456.789-00', 'adult'),
  ('e0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'João Silva', '987.654.321-00', 'adult'),
  ('e0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Ana Paula', '111.222.333-44', 'adult'),
  ('e0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Carlos Paula', '555.666.777-88', 'adult'),
  ('e0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Pedro Paula', '999.000.111-22', 'child');

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (id, tenant_id, booking_id, user_id, provider, amount, status, method, idempotency_key, paid_at, manual_override_reason, manual_override_by, manual_override_at) VALUES
  -- pending
  ('f0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'mercado_pago', 270.00, 'pending', NULL, 'demo-payment-pending-001', NULL, NULL, NULL, NULL),
  -- completed (PIX)
  ('f0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'mercado_pago', 780.00, 'completed', 'pix', 'demo-payment-completed-001', NOW() - INTERVAL '1 day', NULL, NULL, NULL),
  -- completed (manual override)
  ('f0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'manual', 400.00, 'completed', 'manual', 'demo-payment-manual-001', NOW() - INTERVAL '2 day', 'Pagamento recebido em dinheiro no ato do tour.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 day'),
  -- refunded
  ('f0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'mercado_pago', 360.00, 'refunded', 'credit_card', 'demo-payment-refunded-001', NULL, NULL, NULL, NULL);

-- ============================================
-- PAYMENT_EVENTS
-- ============================================
INSERT INTO payment_events (id, payment_id, tenant_id, booking_id, event_type, provider_event_id, payload, processed_by, correlation_id) VALUES
  ('a0000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'confirmed', 'mp-evt-12345', '{"payment_method_id": "pix"}'::jsonb, 'webhook', 'corr-demo-001'),
  ('a0000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'manual_override', NULL, '{}'::jsonb, 'rpc', 'corr-demo-002'),
  ('a0000000-0000-0000-0000-000000000022', 'f0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'refunded', 'mp-evt-67890', '{"amount_refunded": 360.00}'::jsonb, 'webhook', 'corr-demo-003');

-- ============================================
-- WEBHOOK_DELIVERIES
-- ============================================
INSERT INTO webhook_deliveries (id, provider, event_id, payload_signature, payload_hash, status, processed_at, error_message) VALUES
  ('a0000000-0000-0000-0000-000000000030', 'mercado_pago', 'mp-evt-12345', NULL, 'hash123', 'processed', NOW() - INTERVAL '1 day', NULL),
  ('a0000000-0000-0000-0000-000000000031', 'mercado_pago', 'mp-evt-67890', NULL, 'hash456', 'processed', NOW() - INTERVAL '3 day', NULL);

-- ============================================
-- AUDIT_LOGS
-- ============================================
INSERT INTO audit_logs (id, tenant_id, user_id, table_name, record_id, action, new_data, reason, correlation_id) VALUES
  ('a0000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'bookings', 'c0000000-0000-0000-0000-000000000001', 'INSERT', '{"status": "draft"}'::jsonb, 'guest_initiated', 'corr-demo-004'),
  ('a0000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'bookings', 'c0000000-0000-0000-0000-000000000004', 'UPDATE', '{"status": "confirmed"}'::jsonb, 'payment_received', 'corr-demo-005'),
  ('a0000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'bookings', 'c0000000-0000-0000-0000-000000000005', 'UPDATE', '{"status": "cancelled"}'::jsonb, 'guest_requested_cancellation', 'corr-demo-006');

-- ============================================
-- BOOKING_STATUS_CHANGES
-- ============================================
INSERT INTO booking_status_changes (id, booking_id, tenant_id, previous_status, new_status, changed_by, reason, correlation_id) VALUES
  ('a0000000-0000-0000-0000-000000000050', 'c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'draft', 'hold_created', 'a0000000-0000-0000-0000-000000000004', 'create_booking_hold', 'corr-demo-007'),
  ('a0000000-0000-0000-0000-000000000051', 'c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'hold_created', 'confirmed', 'a0000000-0000-0000-0000-000000000002', 'payment_confirmed', 'corr-demo-005'),
  ('a0000000-0000-0000-0000-000000000052', 'c0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'hold_created', 'cancelled', 'a0000000-0000-0000-0000-000000000002', 'guest_requested', 'corr-demo-006'),
  ('a0000000-0000-0000-0000-000000000053', 'c0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'confirmed', 'completed', 'a0000000-0000-0000-0000-000000000002', 'tour_completed', 'corr-demo-008');
