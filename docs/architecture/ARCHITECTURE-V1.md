# Architecture V1 — Dom Pietro Experience Connect

> **Status: SUPERSEDED by V2 architecture documents.**
> Kept for historical reference only. Do not use as implementation source of truth.
> See `ARCHITECTURE-V2.md` and domain-specific architecture docs for current standards.

> Arquitetura técnica do MVP. Define padrões, decisões e estrutura de alto nível.

---

## 1. Visão Arquitetural

Arquitetura **modular e hexagonal leve**, otimizada para velocidade de desenvolvimento sem sacrificar qualidade. Utilizamos uma abordagem **Backend-for-Frontend (BFF)** com Supabase como plataforma de dados e computação serverless.

### Características

- **Monorepo:** Três apps frontend + packages compartilhados
- **Multi-tenant:** Isolamento lógico via RLS no PostgreSQL
- **Serverless-first:** Edge Functions para lógica de negócio complexa
- **Realtime:** Atualizações ao vivo para reservas e agenda
- **Type-safe:** TypeScript de ponta a ponta, incluindo tipos gerados do banco

---

## 2. Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Landing    │  │  Web App     │  │  Admin Panel         │   │
│  │   (Vite)     │  │  (Vite)      │  │  (Vite)              │   │
│  │              │  │  React Router│  │  React Router        │   │
│  │  Static      │  │  TanStack Q  │  │  TanStack Q          │   │
│  │  Marketing   │  │  Zustand     │  │  Zustand             │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          │                 ▼                     │
          │      ┌────────────────────┐           │
          │      │   SUPABASE AUTH    │           │
          │      │  (OAuth / OTP /    │           │
          │      │   Email+Password)  │           │
          │      └─────────┬──────────┘           │
          │                │                       │
          ▼                ▼                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API LAYER (Edge Functions)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  bookings   │  │  payments   │  │  notifications          │   │
│  │  - create   │  │  - create   │  │  - email                │   │
│  │  - confirm  │  │  - refund   │  │  - push                 │   │
│  │  - cancel   │  │  - webhook  │  │  - sms                  │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  scheduler  │  │  tenants    │  │  ai-recommendations     │   │
│  │  - optimize │  │  - onboard  │  │  - embeddings           │   │
│  │  - assign   │  │  - config   │  │  - search               │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 16 + Row Level Security                         │ │
│  │  ─────────────────────────────────────────────────────────  │ │
│  │  tenants | users | bookings | routes | vehicles | drivers   │ │
│  │  experiences | itineraries | payments | invoices | messages │ │
│  │  reviews | notifications | audit_logs | settings            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │   Storage   │  │  Realtime   │  │      pgvector           │   │
│  │  (Images)   │  │ (WebSocket) │  │   (AI embeddings)       │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │ MercadoPago │  │   Resend    │  │    Google Maps API      │   │
│  │  (Payments) │  │  (Email)    │  │  (Geocoding / Routes)   │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Decisões Arquiteturais (ADRs)

### ADR-001: Monorepo com PNPM + Turbo

**Contexto:** Múltiplas apps compartilhando código. Necessidade de builds otimizadas e consistência.

**Decisão:** PNPM workspaces com Turbo para pipeline de build.

**Consequências:**
- ✅ Cache de builds entre apps
- ✅ Instalação rápida com pnpm store
- ✅ Links simbólicos eficientes (compatível Windows via junctions)
- ⚠️ Curva de aprendizado para novos devs

### ADR-002: Supabase como Backend

**Contexto:** Time enxuto, necessidade de autenticação, banco, storage e realtime prontos.

**Decisão:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime).

**Consequências:**
- ✅ Menos código infraestrutura
- ✅ RLS nativo para multi-tenant
- ✅ Tipos gerados automaticamente
- ⚠️ Vendor lock-in parcial (mitigado: SQL padrão, funções em JS/TS)

### ADR-003: Isolamento Multi-Tenant via RLS

**Contexto:** SaaS com múltiplos tenants. Custo e complexidade de múltiplos bancos é proibitivo no início.

**Decisão:** Isolamento lógico com `tenant_id` e Row Level Security.

**Consequências:**
- ✅ Um único cluster PostgreSQL
- ✅ Migrações simples
- ✅ Cross-tenant analytics possível (com bypass RLS)
- ⚠️ Risco de data leak se RLS mal configurada (mitigado: testes automatizados)

### ADR-004: React + Vite (não Next.js)

**Contexto:** Apps são principalmente dashboards e ferramentas internas. SEO não é crítico para web app e admin.

**Decisão:** React com Vite para web e admin. Landing page pode evoluir para Next.js se necessário.

**Consequências:**
- ✅ Build rápido (HMR instantâneo)
- ✅ Controle total sobre roteamento
- ✅ SPA otimizada para interatividade
- ⚠️ SEO limitado em web app (mitigado: landing page separada)

### ADR-005: Edge Functions (Deno) para Lógica Complexa

**Contexto:** Parte da lógica de negócio exige orquestração, chamadas externas e validações complexas.

**Decisão:** Edge Functions para: pagamentos, agendamento, notificações, IA.

**Consequências:**
- ✅ Código TypeScript unificado
- ✅ Deploy rápido e serverless
- ✅ Próximo ao banco (baixa latência)
- ⚠️ Cold start ocasional (mitigado: warm-up, edge caching)

---

## 4. Padrões de Projeto

### 4.1. Estrutura de Pastas (App)

```
app/
├── src/
│   ├── main.tsx              → Entry point
│   ├── App.tsx               → Router + providers
│   ├── routes/               → Definição de rotas
│   ├── pages/                → Páginas (composição de features)
│   ├── features/             → Módulos de negócio
│   │   ├── bookings/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   ├── components/           → Componentes transversais
│   ├── hooks/                → Hooks globais
│   ├── lib/                  → Utilitários e configurações
│   ├── types/                → Tipos globais
│   └── styles/               → CSS global e Tailwind config
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

### 4.2. Estrutura de Pastas (Package)

```
package/
├── src/
│   ├── index.ts              → Barrel export
│   ├── components/           → (ui)
│   ├── hooks/                → (core)
│   ├── utils/                → (core)
│   ├── types/                → (core)
│   ├── constants/            → (core)
│   ├── client/               → (core) Supabase client
│   └── configs/              → (config) ESLint, TS, Tailwind
├── package.json
├── tsconfig.json
└── README.md
```

### 4.3. Feature-Based Organization

Cada feature é auto-contida:

```
features/bookings/
├── components/
│   ├── BookingCard.tsx
│   ├── BookingForm.tsx
│   └── BookingList.tsx
├── hooks/
│   ├── useBookings.ts
│   ├── useCreateBooking.ts
│   └── useCancelBooking.ts
├── services/
│   ├── bookings.api.ts
│   └── bookings.mutations.ts
├── types/
│   └── booking.types.ts
└── index.ts
```

### 4.4. Data Fetching Pattern

```typescript
// services/bookings.api.ts
import { supabase } from '@connect/core';

export const getBookings = async (tenantId: string, filters: BookingFilters) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, routes(*), users!bookings_user_id_fkey(*)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query';

export const useBookings = (filters: BookingFilters) => {
  const { tenant } = useTenant();
  return useQuery({
    queryKey: ['bookings', tenant.id, filters],
    queryFn: () => getBookings(tenant.id, filters),
  });
};
```

---

## 5. Fluxos Críticos

### 5.1. Reserva de Transfer

```
Hóspede (Web)
  │
  ▼
[1] Seleciona origem/destino/data
  │
  ▼
[2] API: Verifica disponibilidade
  │
  ▼
[3] Exibe opções (veículo + preço)
  │
  ▼
[4] Confirma reserva → Edge Function
  │
  ▼
[5] Edge Function:
    a. Valida dados
    b. Cria booking (status: pending)
    c. Chama Mercado Pago (preference)
    d. Retorna link de pagamento
  │
  ▼
[6] Hóspede é redirecionado ao checkout
  │
  ▼
[7] Webhook Mercado Pago → Edge Function
  │
  ▼
[8] Atualiza booking (status: confirmed)
  │
  ▼
[9] Notifica hóspede (push/email)
  │
  ▼
[10] Adiciona à agenda VAN (admin realtime)
```

### 5.2. Agenda VAN (Admin)

```
Admin (Admin Panel)
  │
  ▼
[1] Subscrição Realtime em bookings confirmed
  │
  ▼
[2] Visualiza calendário com reservas
  │
  ▼
[3] Drag-and-drop para otimizar rota
  │
  ▼
[4] Salva otimização → Edge Function
  │
  ▼
[5] Motorista recebe notificação com rota
  │
  ▼
[6] Motorista atualiza status (a caminho, chegou, concluído)
  │
  ▼
[7] Hóspede acompanha em tempo real (Web)
```

---

## 6. Segurança

### 6.1. Autenticação

| Método | Uso | App |
|--------|-----|-----|
| Magic Link / OTP | Login hóspede | web |
| Email + Password | Login admin | admin |
| OAuth (Google) | Login social | web |

### 6.2. Autorização

```
JWT (Supabase Auth)
  └── claims:
      ├── sub: user_id
      ├── tenant_id: uuid
      ├── role: guest | admin | driver | super_admin
      └── exp: timestamp
```

### 6.3. RLS Policies (Padrão)

```sql
-- Política base para todas as tabelas tenant-scoped
CREATE POLICY "tenant_isolation_select"
  ON <table> FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "tenant_isolation_modify"
  ON <table> FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Admin pode ver tudo do tenant
CREATE POLICY "tenant_admin_all"
  ON <table> FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );
```

---

## 7. Escalabilidade

### 7.1. Banco de Dados

- **Índices:** GIN para JSONB, B-tree para buscas comuns, GiST para geolocalização
- **Particionamento:** `bookings` e `audit_logs` por `tenant_id` + `created_at` (futuro)
- **Materialized Views:** Dashboard KPIs com refresh diário/horário
- **Read Replicas:** Para relatórios pesados (quando necessário)

### 7.2. Frontend

- **Code Splitting:** Por rota e por feature
- **Prefetching:** TanStack Query prefetch em hover de links
- **CDN:** Vercel Edge Network para assets estáticos
- **Imagens:** Supabase Storage com transformação on-the-fly

### 7.3. Edge Functions

- **Rate Limiting:** 100 req/min por IP, 1000 req/min por tenant
- **Caching:** Cache de respostas idempotentes (ETag, Cache-Control)
- **Warm-up:** Cron job para manter functions ativas

---

## 8. Monitoramento & Observability

| Ferramenta | Uso |
|------------|-----|
| Vercel Analytics | Web Vitals, performance frontend |
| Supabase Logs | Query performance, errors |
| Sentry | Error tracking (frontend + edge) |
| Logflare / Better Stack | Log aggregation |

---

*Última atualização: 2026-05-16*
*Versão: 1.0*
*Status: Draft*
