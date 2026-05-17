# Database V1 — Dom Pietro Experience Connect

> **Status: SUPERSEDED by `DATABASE-V2.md`.**
> Kept for historical reference only. The V1 schema contains known critical issues
> (broken RLS role assumptions, missing slot/hold tables, missing soft deletes,
> missing scheduled_end_at, and more) that are corrected in V2.
> Do not use as implementation source of truth.

> Modelo de dados relacional multi-tenant para o MVP. PostgreSQL 16 + Supabase.

---

## 1. Princípios

1. **Toda tabela de domínio possui `tenant_id`**
2. **RLS ativado em 100% das tabelas tenant-scoped**
3. **Soft delete via `deleted_at`** (quando aplicável)
4. **Timestamps obrigatórios:** `created_at`, `updated_at`
5. **UUID primário** (`gen_random_uuid()`) para todas as entidades
6. **Enumerações via `CHECK` ou tabelas de lookup**

---

## 2. Diagrama Entidade-Relacionamento (MVP)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  tenants    │────▶│    users    │◄────│    roles    │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │    ┌──────────────┼──────────────┐
       │    │              │              │
       ▼    ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  vehicles   │  │  bookings   │  │  routes     │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  payments   │  │  passengers │  │  messages   │
└─────────────┘  └─────────────┘  └─────────────┘
       │
       ▼
┌─────────────┐
│  invoices   │
└─────────────┘
```

---

## 3. Tabelas

### 3.1. tenants

Registro central de cada tenant (Dom Pietro Experience, etc.)

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | uuid | PK, default gen_random_uuid() | Identificador único |
| slug | text | NOT NULL, UNIQUE | Subdomínio/identificador URL-friendly |
| name | text | NOT NULL | Nome do negócio |
| status | text | NOT NULL, DEFAULT 'active' | active, inactive, suspended |
| settings | jsonb | DEFAULT '{}' | Configurações customizadas |
| branding | jsonb | DEFAULT '{}' | Cores, logo, favicon |
| plan | text | DEFAULT 'basic' | basic, pro, enterprise |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings jsonb NOT NULL DEFAULT '{}',
  branding jsonb NOT NULL DEFAULT '{}',
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: super_admin pode ver todos; tenants isolados nas outras tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
```

### 3.2. users

Usuários do sistema (hóspedes, admins, motoristas, super_admins)

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | uuid | PK | Mesmo UUID do auth.users |
| tenant_id | uuid | FK → tenants.id | NULL para super_admin |
| email | text | NOT NULL | |
| phone | text | | Com DDD |
| full_name | text | | |
| avatar_url | text | | URL do avatar |
| role | text | NOT NULL, DEFAULT 'guest' | guest, admin, driver, super_admin |
| status | text | DEFAULT 'active' | active, inactive |
| preferences | jsonb | DEFAULT '{}' | Idioma, notificações, etc. |
| metadata | jsonb | DEFAULT '{}' | Dados extras |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'admin', 'driver', 'super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  preferences jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
```

### 3.3. vehicles

Frota de veículos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK → tenants |
| name | text | "Van Executiva 1" |
| type | text | van, sedan, suv, bus, motorcycle |
| plate | text | Placa |
| capacity | int | Lugares |
| color | text | Cor |
| photo_url | text | Foto |
| status | text | available, maintenance, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

```sql
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('van', 'sedan', 'suv', 'bus', 'motorcycle')),
  plate text,
  capacity int NOT NULL DEFAULT 4,
  color text,
  photo_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
```

### 3.4. routes

Rotas pré-cadastradas (origem → destino)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| name | text | "Aeroporto → Pousada" |
| origin | text | Origem |
| destination | text | Destino |
| origin_coords | point | (lat, lng) |
| destination_coords | point | (lat, lng) |
| distance_km | decimal | Distância |
| duration_min | int | Duração estimada |
| base_price | decimal | Preço base |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

```sql
CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  origin_coords point,
  destination_coords point,
  distance_km decimal(10,2),
  duration_min int,
  base_price decimal(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
```

### 3.5. bookings

Reservas centrais

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| user_id | uuid | FK → users (hóspede) |
| route_id | uuid | FK → routes |
| vehicle_id | uuid | FK → vehicles (opcional até confirmar) |
| driver_id | uuid | FK → users (motorista) |
| booking_type | text | transfer, experience, itinerary |
| status | text | pending, confirmed, in_progress, completed, cancelled, refunded |
| scheduled_at | timestamptz | Data/hora agendada |
| pickup_location | text | Local de embarque |
| dropoff_location | text | Local de desembarque |
| passenger_count | int | Quantidade de passageiros |
| luggage_count | int | Malas |
| special_requests | text | Pedidos especiais |
| total_amount | decimal | Valor total |
| payment_status | text | pending, paid, failed, refunded |
| notes | text | Observações internas |
| created_at | timestamptz | |
| updated_at | timestamptz | |

```sql
CREATE TYPE booking_type AS ENUM ('transfer', 'experience', 'itinerary');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  route_id uuid REFERENCES routes(id),
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES users(id),
  booking_type booking_type NOT NULL DEFAULT 'transfer',
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz NOT NULL,
  pickup_location text,
  dropoff_location text,
  passenger_count int NOT NULL DEFAULT 1,
  luggage_count int DEFAULT 0,
  special_requests text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX idx_bookings_tenant_status ON bookings(tenant_id, status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### 3.6. passengers

Passageiros associados a uma reserva (hóspede principal + dependentes)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| booking_id | uuid | FK → bookings |
| full_name | text | |
| document | text | CPF/Passaporte |
| age_group | text | adult, child, infant |
| created_at | timestamptz | |

```sql
CREATE TABLE passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  document text,
  age_group text NOT NULL DEFAULT 'adult' CHECK (age_group IN ('adult', 'child', 'infant')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
```

### 3.7. payments

Registro de pagamentos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| booking_id | uuid | FK → bookings |
| user_id | uuid | FK → users |
| provider | text | mercado_pago, stripe, pix |
| provider_payment_id | text | ID externo |
| amount | decimal | Valor |
| currency | text | BRL |
| status | text | pending, processing, completed, failed, refunded |
| method | text | credit_card, debit_card, pix, boleto |
| metadata | jsonb | Resposta do provider |
| paid_at | timestamptz | |
| refunded_at | timestamptz | |
| created_at | timestamptz | |

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL DEFAULT 'mercado_pago',
  provider_payment_id text,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  method text CHECK (method IN ('credit_card', 'debit_card', 'pix', 'boleto')),
  metadata jsonb NOT NULL DEFAULT '{}',
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### 3.8. invoices

Faturas/financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| booking_id | uuid | FK |
| invoice_number | text | Número da fatura |
| amount | decimal | |
| tax_amount | decimal | Impostos |
| total_amount | decimal | |
| status | text | draft, sent, paid, overdue, cancelled |
| due_date | date | |
| paid_at | timestamptz | |
| created_at | timestamptz | |

```sql
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  invoice_number text NOT NULL,
  amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

### 3.9. messages

Comunicação entre hóspede, admin e motorista

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| booking_id | uuid | FK (opcional) |
| sender_id | uuid | FK → users |
| recipient_id | uuid | FK → users (opcional) |
| channel | text | app, sms, email, whatsapp |
| type | text | text, image, file, system |
| content | text | |
| is_read | boolean | |
| metadata | jsonb | |
| created_at | timestamptz | |

```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid REFERENCES users(id),
  channel text NOT NULL DEFAULT 'app' CHECK (channel IN ('app', 'sms', 'email', 'whatsapp')),
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### 3.10. audit_logs

Logs de auditoria para ações críticas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tenant_id | uuid | FK |
| user_id | uuid | FK |
| table_name | text | Tabela afetada |
| record_id | uuid | Registro afetado |
| action | text | INSERT, UPDATE, DELETE |
| old_data | jsonb | |
| new_data | jsonb | |
| ip_address | text | |
| user_agent | text | |
| created_at | timestamptz | |

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 4. Funções e Triggers

### 4.1. updated_at automático

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (repetir para routes, bookings, users, etc.)
```

### 4.2. Tenant Context

```sql
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Políticas RLS (Resumo)

Todas as tabelas de domínio seguem o padrão:

```sql
-- SELECT: usuário só vê dados do seu tenant
CREATE POLICY "tenant_select" ON <table>
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ALL (insert/update/delete): admin e super_admin
CREATE POLICY "tenant_admin_all" ON <table>
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
  );

-- INSERT/UPDATE: usuário pode modificar seus próprios dados
CREATE POLICY "tenant_owner" ON <table>
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND user_id = auth.uid()
  );
```

### Exceções

- `tenants`: acesso controlado por `super_admin` ou pelo próprio `tenant_id`
- `users`: hóspede vê apenas seu perfil; admin vê todos do tenant
- `audit_logs`: apenas `admin` e `super_admin`

---

## 6. Seed Data

```sql
-- Tenant inicial
INSERT INTO tenants (slug, name, status, plan)
VALUES ('dom-pietro', 'Dom Pietro Experience', 'active', 'pro');

-- Veículos de exemplo
INSERT INTO vehicles (tenant_id, name, type, plate, capacity, color, status)
SELECT 
  t.id,
  'Van Executiva Mercedes',
  'van',
  'ABC1D23',
  15,
  'Preta',
  'available'
FROM tenants t WHERE t.slug = 'dom-pietro';

-- Rotas comuns
INSERT INTO routes (tenant_id, name, origin, destination, base_price, distance_km, duration_min)
SELECT 
  t.id,
  'Aeroporto → Pousada',
  'Aeroporto Internacional de Porto Seguro',
  'Dom Pietro Experience',
  180.00,
  25.5,
  45
FROM tenants t WHERE t.slug = 'dom-pietro';
```

---

## 7. Evolução Futura (Pós-MVP)

| Feature | Tabelas |
|---------|---------|
| Experiências | `experiences`, `experience_schedules`, `experience_bookings` |
| Roteiros | `itineraries`, `itinerary_days`, `itinerary_stops` |
| Parceiros | `partners`, `partner_services`, `commissions` |
| Reviews | `reviews`, `review_replies` |
| Notificações | `notifications`, `notification_preferences` |
| Analytics | `page_views`, `conversion_events` |
| AI/Vector | `experience_embeddings` (pgvector) |

---

*Última atualização: 2026-05-16*
*Versão: 1.0*
*Status: Draft*
