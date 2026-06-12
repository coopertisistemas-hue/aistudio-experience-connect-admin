# Changelog — Dom Pietro Experience Connect

> Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
> Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [v0.6.3-ci-e2e] - 2026-06-12

### Added
- **CI Pipeline:** E2E test step added to `.github/workflows/ci.yml` — runs Playwright tests for both admin and landing projects after build.

---

## [v0.6.2-booking-e2e] - 2026-06-12

### Added
- **E2E Tests — Booking Flow:** New `apps/web/e2e/booking.spec.ts` with tests for booking page load, booking status page render, and booking confirm page render.

---

## [v0.6.1-get-booking-edge-function] - 2026-06-12

### Added
- **Edge Function — `get-booking`:** `supabase/functions/get-booking/index.ts` uses `service_role` to query `bookings`, `routes`, `payments`, and `vehicle_slots`. Replaces direct Supabase query in the landing service.

### Changed
- **Landing Service — `getBooking`:** Now calls edge function instead of direct Supabase query, fixing the CRITICAL security audit finding.

---

## [v0.6.0-wave-3-audit-fixes] - 2026-06-12

### Added
- **Claude Audit Fixes — Wave 3:** All 3 blockers resolved.
  - CRITICAL: `get-booking` edge function replaces direct Supabase query.
  - CRITICAL: CI pipeline includes E2E tests.
  - HIGH: E2E tests for booking flow, CHANGELOG updates, EXEC_PLAN_STATUS updates.

---

## [v0.5.3-rpc-consolidated] - 2026-06-12

### Added
- **DB RPC Consolidation (R3):** `release_slot_capacity` helper extracted as reusable function.
- **Function Refactoring:** 3 RPC functions refactored to use the shared helper, reducing duplication.

### Migration
- `20260612100200_extract_release_slot_capacity.sql`
- `20260612100300_refactor_functions_to_use_helper.sql`

---

## [v0.5.2-security-hardened] - 2026-06-12

### Added
- **Operational Risks Resolution (OR1):** CI/CD pipeline hardened, Vercel production config secured.
- **Private Schema:** Consolidated and finalized.

### Removed
- **V1 RLS Anti-pattern Policies:** Dropped — fully superseded by V2 policies (non-breaking).

### Migration
- `20260612100000_fix_private_schema.sql`
- `20260612100100_drop_v1_rls_policies.sql`

---

## [v0.5.1-payments-realtime] - 2026-06-12

### Added
- **Payments Live Integration:** Dashboard KPIs powered by live Supabase queries.
- **Realtime Subscriptions:** Enabled for payment status updates.
- **Payment Polling:** Mechanism implemented for fallback sync.
- **Edge Functions Aligned:** Contracts synchronized with frontend.
- **Checkout Flow:** Fully functional end-to-end.

### Migration
None.

---

## [v0.5.0-bookings-live-integration] - 2026-06-12

### Added
- **Bookings Live Integration (Sprint 1.3):** Services layer (`src/services/`) and React hooks (`src/hooks/`) created.
- **Payment Preferences:** Migration `payment_preferences` table implemented.
- **Edge Function:** `create-payment-preference` created.
- **Live Data:** Booking and payment pages consuming live data from Supabase.

### Migration
- `20260612010000_create_payment_preferences.sql`

---

## [v0.3.1-frontend-ready] - 2026-05-16

### Fixed
- **Harden Boundary:** `expire-booking-hold` Edge Function agora possui validação rigorosa de `service_role` ou privilégios de `admin/operator`.
- **Auditable RLS Tests:** O runner `test-rls.sh` agora aplica as migrações reais (`schema`, `functions`, `rls`) antes de validar, garantindo que o teste reflete o estado real do banco.
- **Operational Safety:** Melhoria no tratamento de erros e logs de auditoria para ações críticas.

### Validated
- **RLS Security:** 49/49 testes de RLS passando contra políticas reais (multi-tenant isolation, role-based access).
- **Webhook Idempotency:** 5/5 testes de webhook passando (Mercado Pago flow).
- **Observability:** 7/7 testes de trilha de auditoria e logs de status passando.

### Ready
- Aprovado para o início da fase **Readdy** (Frontend Foundation).
- Contratos de API e Banco de Dados considerados estáveis.

---

## [v0.3.0-backend-foundation] - 2026-05-16

### Added
- **Schema V2 completo:** migração unificada idempotente com 19 tabelas, EXCLUDE constraint, RLS policies, soft deletes, optimistic locking via `lock_version`.
- **Funções RPC V2:** `create_booking_hold`, `confirm_booking_from_payment`, `cancel_booking`, `expire_booking_hold`, `reschedule_booking`, `process_mp_webhook`, `record_manual_payment`.
- **Documentação V2:** documentos de arquitetura alinhados com schema V2 (membership model, inventory semantics, payment state source of truth).
- **Runtime Hardening:** validação completa de RLS (49/49), concorrência (anti-overbooking 100%), webhooks (5/5), observabilidade (7/7).
- **Edge Functions:** 6 funções implementadas com CORS e OPTIONS handling para compatibilidade browser/PWA.
- **Scripts de Teste:** suites automatizadas de validação runtime (RLS, concorrência, webhook, observabilidade) alinhadas com V2 semantics.
- **Seed Data:** Massa de dados completa para o tenant "Dom Pietro" incluindo usuários, frotas, motoristas, pousadas, rotas, parceiros e reservas.

### Changed
- Estrutura inicial do monorepo com PNPM workspaces + Turbo.
- Configuração base para apps/web, apps/admin, apps/landing.
- Packages compartilhados: @connect/ui, @connect/core, @connect/config.
- Documentação fundacional: FOUNDATION.md, ARCHITECTURE-V1.md, DATABASE-V1.md, ROADMAP-V1.md.
- Setup inicial do Supabase (migrations, functions, seed).
- CI/CD base com GitHub Actions.
- Design tokens iniciais (Tailwind + shadcn/ui).
- Autenticação base (Supabase Auth).

### Fixed
- Migrações V2 fragmentadas anteriores (superseded pela migração unificada).

### Security
- RLS policies usam `is_tenant_member()` com modelo `user_tenants` (V2 membership).
- Append-only tables (`payment_events`, `booking_status_changes`, `audit_logs`, `webhook_deliveries`) protegidas contra UPDATE/DELETE.
- `ON DELETE RESTRICT` em todas as tabelas operacionais.
- Guest-scoped visibility em `payments` (apenas próprios pagamentos) e `users` (próprio perfil + admin/operator visibilidade controlada).
- `expire_booking_hold` hardening: operational boundary com `p_admin_id`, service_role/internal only via Edge Function.

---

## [0.1.0] — 2026-05-16

### Added
- **Foundation:** Criação do projeto e estrutura base
- **Docs:** Documentação técnica completa (arquitetura, banco, roadmap)
- **Monorepo:** Apps web, admin, landing + packages ui, core, config
- **Database:** Schema inicial com RLS multi-tenant
- **Config:** package.json raiz, pnpm-workspace.yaml, .gitignore, Prettier, ESLint

---

## Convenções de Versionamento

Este projeto segue o [SemVer](https://semver.org/lang/pt-BR/):

- **MAJOR:** Mudanças incompatíveis na API ou arquitetura
- **MINOR:** Adição de funcionalidades mantendo compatibilidade
- **PATCH:** Correções de bugs e melhorias menores

---

*Última atualização: 2026-05-16*
