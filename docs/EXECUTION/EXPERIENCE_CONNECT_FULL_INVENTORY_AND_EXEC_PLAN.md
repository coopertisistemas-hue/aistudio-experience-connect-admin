# Experience Connect — Full Inventory & Exec Plan

**Documento:** `docs/EXECUTION/EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md`
**Versão:** 1.0
**Data:** 2026-06-11
**Auditor:** Claude (Premium Architecture & Governance Auditor)
**Classificação:** MANDATORY REFERENCE — Plano executivo oficial para produto final
**Status:** ACTIVE

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Escopo](#2-escopo)
3. [Premissas](#3-premissas)
4. [Governança Encontrada no Repo](#4-governança-encontrada-no-repo)
5. [Inventário Técnico](#5-inventário-técnico)
6. [Inventário Funcional](#6-inventário-funcional)
7. [Gap Analysis](#7-gap-analysis)
8. [Matriz de Riscos](#8-matriz-de-riscos)
9. [Arquitetura Recomendada — Produto Final](#9-arquitetura-recomendada--produto-final)
10. [Estratégia — App do Motorista](#10-estratégia--app-do-motorista)
11. [Estratégia — Integração com Site do Cliente/Parceiro](#11-estratégia--integração-com-site-do-clienteparceiro)
12. [Estratégia — WhatsApp como Canal de Fechamento](#12-estratégia--whatsapp-como-canal-de-fechamento)
13. [Estratégia — DeepSeek V4 Flash Free como Orquestrador](#13-estratégia--deepseek-v4-flash-free-como-orquestrador)
14. [Exec Plan — Waves, Phases, Sprints](#14-exec-plan--waves-phases-sprints)
15. [Definition of Ready](#15-definition-of-ready)
16. [Definition of Done](#16-definition-of-done)
17. [Critérios para MVP](#17-critérios-para-mvp)
18. [Critérios para Produção](#18-critérios-para-produção)
19. [Backlog Pós-MVP](#19-backlog-pós-mvp)
20. [Próximas Ações Imediatas](#20-próximas-ações-imediatas)
21. [Auditoria Claude — Conclusão](#21-auditoria-claude--conclusão)

---

## 1. Sumário Executivo

O **Dom Pietro Experience Connect** é uma plataforma SaaS multi-tenant premium para gestão de experiências turísticas. O repositório `aistudio-experience-connect-admin` encontra-se no estágio **v0.4.0-frontend-foundation-stable** (2026-05-17), com o seguinte perfil:

| Camada | Estado | Síntese |
|--------|--------|---------|
| Backend/Supabase | **SÓLIDO** | Schema V2 completo, RLS 49/49, 6 Edge Functions de booking operacionais |
| Frontend Admin (apps/web) | **PARCIAL** | Shell, auth e UI existem com dados mockados; sem integração live |
| Site Público (apps/landing) | **STUB** | Apenas hero + footer estáticos |
| App Admin Separado (apps/admin) | **STUB VAZIO** | Placeholder sem implementação real |
| Pagamentos | **PARCIAL** | Webhook handler e RPC prontos; Edge Function de preference ausente |
| Site do Parceiro/Widget | **AUSENTE** | Não iniciado |
| App do Motorista | **AUSENTE** | Não iniciado |
| Fluxo WhatsApp | **AUSENTE** | Não iniciado |
| Relatórios/Analytics | **MOCK** | UI mockada, sem integração real |

**Governança:** Framework maduro e funcional. DEEPSEEK.md v1.0, ADR-008, CONNECT-READDY-STANDARD v1.1.0, SESSION_BOOTSTRAP_REQUIREMENTS e CONNECT_EXECUTION_GOVERNANCE_V1 estão presentes e ativos. Sprint S3 (Lint + Type Hardening) aguarda aprovação.

**Veredicto:** O projeto tem base sólida para execução controlada. O caminho crítico é: live data integration → site público → fluxo de reserva online → widget de parceiro → app do motorista.

---

## 2. Escopo

Este documento cobre o produto final Experience Connect conforme visão do prompt de auditoria, alinhado à governança existente:

### Em Escopo (Produto Final)
- Plataforma Admin completa (multi-tenant, RBAC, todos os módulos operacionais)
- Site público/comercial (catálogo, roteiros, SEO, analytics)
- Integração com site de clientes/parceiros (widget, link rastreável, comissão)
- Fluxo de compra/reserva online (Fluxo A)
- Fluxo de fechamento via WhatsApp (Fluxo B)
- App do Motorista (agenda, viagens, check-in, navegação, ocorrências)
- Governança multi-agente com DeepSeek V4 Flash como orquestrador
- Pagamentos via Mercado Pago

### Fora de Escopo (Explícito)
- IA para recomendações personalizadas (FOUNDATION.md — Fase 3)
- Chat com concierge em tempo real
- Split payments / marketplace MP (EXECUTION-PLAN-V2 — Out of V1)
- Push notifications nativas (PWA offline parcial sim, nativas não)
- White-label custom domains
- Onboarding automatizado de tenants

---

## 3. Premissas

1. `apps/web` é a aplicação canônica unificada (Admin + Home). `apps/admin` e `apps/landing` são legados/stubs a serem deprecados ou evoluídos conforme Wave 3.
2. O Schema V2 é estável e não será alterado sem ADR + aprovação humana.
3. Mercado Pago é o gateway de pagamento oficial para V1.
4. O App do Motorista será uma nova app separada dentro do monorepo (`apps/driver`).
5. O site público será uma evolução de `apps/landing` ou uma nova app (`apps/public`), a ser decidido em Sprint 3.1 (conforme análise técnica).
6. O widget de integração com site do cliente usará iframe com parâmetros ou script embed, conforme análise de segurança.
7. WhatsApp não é integração programática de API; é link deeplink `wa.me` com número do operador/parceiro configurável por tenant.
8. DeepSeek V4 Flash free é o orquestrador operacional; Claude é auditor premium; Codex CLI é executor técnico.
9. A governança existente neste repo **prevalece** sobre qualquer instrução deste documento onde houver divergência.
10. Nenhuma alteração de código, migrations ou políticas de segurança é executada por este documento.

---

## 4. Governança Encontrada no Repo

### 4.1 Arquivos de Governança Presentes

| Arquivo | Localização | Status | Observação |
|---------|------------|--------|------------|
| DEEPSEEK.md | `docs/governance/DEEPSEEK.md` | ACTIVE — v1.0 | 652 linhas, anti-hallucination rules, evidence classification, execution boundary enforcement |
| ADR-008 | `docs/governance/ADR-008-DeepSeek-Orchestrator-Constitution.md` | ACCEPTED | Autoridade, responsabilidades e restrições formais do DeepSeek |
| CONNECT_EXECUTION_GOVERNANCE_V1 | `docs/governance/CONNECT_EXECUTION_GOVERNANCE_V1.md` | ACTIVE | Sprint S3 pending approval; modo STRICT |
| CONNECT_EXECUTION_GOVERNANCE_REFERENCE | `docs/governance/CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md` | ACTIVE | Aponta para `aistudio-portal-connect-admin` como fonte canônica de governança |
| GOVERNANCE_STATE | `docs/governance/GOVERNANCE_STATE.md` | ACTIVE — v1.0 | ADR-008 aceito; Sprint S3 awaiting approval; 6 agentes certificados |
| MASTER_PORTFOLIO | `docs/governance/MASTER_PORTFOLIO.md` | ACTIVE — v1.0 | 15 repos catalogados; ec-admin na Phase 1, pending |
| SESSION_BOOTSTRAP_REQUIREMENTS | `docs/governance/SESSION_BOOTSTRAP_REQUIREMENTS.md` | MANDATORY | Sequência de boot obrigatória para DeepSeek |
| ORCHESTRATOR_CONTEXT | `docs/governance/ORCHESTRATOR_CONTEXT.md` | ACTIVE — v1.0 | S0.2 completo; S3 pending; 4 blockers ativos |
| ORCHESTRATOR_ACCEPTANCE_TEST | `docs/governance/ORCHESTRATOR_ACCEPTANCE_TEST.md` | ACTIVE | 20-check regression test |
| OPERATIONAL_START_RECOMMENDATION | `docs/governance/OPERATIONAL_START_RECOMMENDATION.md` | GO WITH CONDITIONS | 5 riscos operacionais ativos |
| INVENTORY_QUALITY_GATE_V1 | `docs/governance/INVENTORY_QUALITY_GATE_V1.md` | ACTIVE | Quality gates para entidades publicadas |
| DEEPSEEK_BOOTSTRAP_PROMPT | `docs/governance/DEEPSEEK_BOOTSTRAP_PROMPT.md` | ACTIVE | Prompt de boot para DeepSeek |
| CONNECT-READDY-STANDARD | `docs/frontend/CONNECT-READDY-STANDARD.md` | ACTIVE — v1.1.0 | Padrão obrigatório de frontend para todo o ecossistema Connect |
| GOVERNANCE_TRANSITION_REPORT | `docs/governance/GOVERNANCE_TRANSITION_REPORT.md` | ACTIVE | Transição Recovery → Operational Mode (2026-06-05) |
| ATTRACTIONS_FREEZE_POLICY | `docs/governance/ATTRACTIONS_FREEZE_POLICY.md` | ACTIVE | Política de freeze para atrações |
| FOUNDATION.md | `FOUNDATION.md` | ACTIVE — v1.0 | Documento técnico fundacional do produto |
| EXECUTION-PLAN-V2 | `docs/roadmap/EXECUTION-PLAN-V2.md` | SOURCE OF TRUTH | Plano executivo oficial (supersede V1) |
| QA-GATES | `docs/roadmap/QA-GATES.md` | MANDATORY | Gates de QA contínuo |
| v0.5.0 milestone | `docs/roadmap/v0.5.0-live-data-integration.md` | PLANNED | Próximo milestone oficial |
| CHANGELOG | `docs/versions/CHANGELOG.md` | ACTIVE | v0.3.0, v0.3.1, implícito v0.4.0 |

### 4.2 Git Status da Governança

Os arquivos em `docs/governance/` estavam **untracked** (não commitados). Isso foi um blocker de governança resolvido na Sprint S0.1. Todos os documentos de governança agora estão commitados no histórico oficial do repo.

**Status:** ✅ `RESOLVED` — Docs de governança commitados na Sprint S0.1.

### 4.3 Regras de Governança que Prevalecem

1. **DEEPSEEK.md §4 (Imutabilidade):** Nenhum agente pode modificar documentos de governança sem ADR + aprovação humana.
2. **QA-GATES.md:** Nenhum merge sem lint clean, typecheck clean, tests passing, review approval, CI passing.
3. **CONNECT-READDY-STANDARD v1.1.0:** UI freeze — sem redesigns sem aprovação. Schema-first. Multi-tenant por default.
4. **EXECUTION-PLAN-V2:** Fonte de verdade para fases do produto V1.
5. **SESSION_BOOTSTRAP_REQUIREMENTS:** DeepSeek deve completar boot obrigatório antes de cada sessão.

---

## 5. Inventário Técnico

### 5.1 Estrutura do Repositório

```
aistudio-experience-connect-admin/
├── apps/
│   ├── web/          # Canônico — React+Vite, admin+home unificados
│   ├── admin/        # Stub vazio — deprecar ou evoluir
│   └── landing/      # Stub mínimo — evoluir para site público
├── packages/
│   ├── core/         # Supabase client, types DB, tenant scope, edge client, optimistic
│   ├── ui/           # Hooks (supabase, tenant, realtime), providers, utils
│   └── config/       # ESLint, TypeScript base, Tailwind shared
├── supabase/
│   ├── migrations/   # 5 migrations (init + v2_core + v2_functions + v2_rls + v2_seed)
│   ├── functions/    # 6 Edge Functions
│   └── config.toml   # Supabase local config
├── docs/
│   ├── architecture/ # 8 ADRs/docs de arquitetura
│   ├── database/     # DATABASE-V1 e V2
│   ├── frontend/     # CONNECT-READDY-STANDARD
│   ├── governance/   # 15 docs de governança (UNTRACKED)
│   ├── roadmap/      # EXECUTION-PLAN-V2, QA-GATES, milestones
│   ├── versions/     # CHANGELOG, release notes
│   └── EXECUTION/    # Este documento (novo)
├── scripts/          # test-rls, test-concurrency, test-webhook, test-observability
├── tests/            # backend_validation.sql
├── FOUNDATION.md     # Doc fundacional do produto
├── package.json      # pnpm workspace root
├── pnpm-workspace.yaml
└── turbo.json
```

### 5.2 Apps Existentes

| App | Nome | Tipo | Estado Atual | Uso |
|-----|------|------|-------------|-----|
| `apps/web` | `@connect/web` | React+Vite | `PARTIAL` — v0.4.0, UI mockada | Canônico: admin + home |
| `apps/admin` | `@connect/admin` | React+Vite | `STUB` — placeholder vazio | Legado, sem implementação |
| `apps/landing` | `@connect/landing` | React+Vite | `STUB` — hero+footer estáticos | Legado, mínimo |

### 5.3 Packages Existentes

| Package | Nome | Estado | Conteúdo |
|---------|------|--------|---------|
| `packages/core` | `@connect/core` | `DONE` | Supabase client factory, DB types (V2), tenant scope utilities, edge client, optimistic mutations |
| `packages/ui` | `@connect/ui` | `PARTIAL` | Hooks (use-supabase, use-tenant, use-realtime), tenant-provider, utils. Falta: componentes shadcn exportados |
| `packages/config` | `@connect/config` | `DONE` | ESLint config, TS base config, Tailwind shared config |

### 5.4 Stack Utilizada

| Camada | Tecnologia | Versão | Status |
|--------|-----------|--------|--------|
| Frontend | React | ^19 | DONE |
| Build | Vite | ^8 (web) / ^6 (admin/landing) | DONE |
| Type Safety | TypeScript | ~5.8 | DONE |
| CSS | TailwindCSS | ^3.4 | DONE |
| Components | shadcn/ui | latest | PARTIAL — instalado, poucos exportados |
| Animations | Framer Motion | ^11 | DONE (admin/landing) |
| Routing | React Router | ^7 | DONE |
| Server State | TanStack Query | ^5 | DONE (admin app) / MISSING (web app) |
| Client State | Zustand | ^5 | DONE (admin app) / MISSING (web app) |
| Forms | React Hook Form | ^7 | DONE (admin app) / MISSING (web app) |
| Validation | Zod | ^3 | DONE (admin app) / MISSING (web app) |
| I18n | i18next | 25 | PARTIAL (web app tem estrutura, sem traduções completas) |
| Payments | Stripe SDK | ^4 | INSTALADO mas não Mercado Pago SDK |
| Firebase | firebase | 12 | INSTALADO — uso indefinido no web app |
| Charts | recharts | ^3 (web) / ^2 (admin) | DONE |
| Database | PostgreSQL via Supabase | ^17 | DONE |
| Auth | Supabase Auth | via @supabase/supabase-js ^2.57 | PARTIAL |
| Backend-as-a-Service | Supabase | local configured | DONE |
| Edge Functions | Deno/TypeScript | Deno v2 | DONE (6 funções) |
| Monorepo | PNPM Workspaces + Turbo | pnpm 9.15.4 / turbo ^2.3.3 | DONE |
| Deploy Frontend | Vercel | vercel.json presente em web | PARTIAL — config presente |
| CI/CD | GitHub Actions | Workflows presentes (untracked) | PARTIAL |

**Observações críticas de stack:**
- `@stripe/react-stripe-js` está instalado em `apps/web` mas o gateway é **Mercado Pago**, não Stripe. **Débito técnico / conflito.**
- `firebase` está instalado em `apps/web` sem uso aparente documentado. Precisa de investigação.
- TanStack Query, Zustand, React Hook Form e Zod estão em `apps/admin` (stub vazio) mas **não** em `apps/web` (app canônico). **Gap crítico para live integration.**

### 5.5 Scripts Disponíveis

| Script | Localização | Função |
|--------|------------|--------|
| `pnpm build` | root | Turbo build de todos os apps/packages |
| `pnpm dev` | root | Dev apenas @connect/web |
| `pnpm dev:web/admin/landing` | root | Dev app específico |
| `pnpm lint` | root | ESLint via Turbo |
| `pnpm typecheck` | root | TypeScript check via Turbo |
| `pnpm test / test:ci` | root | Turbo test (nenhum teste unitário presente) |
| `pnpm db:*` | root | Supabase commands |
| `test-rls.sh` | scripts/ | 49 testes RLS |
| `test-concurrency.sh` | scripts/ | Testes de concorrência |
| `test-webhook.sh` | scripts/ | Testes de webhook MP |
| `test-observability.sh` | scripts/ | Testes de observabilidade |

### 5.6 Variáveis de Ambiente

| Variável | App | Obrigatório | Status |
|---------|-----|------------|--------|
| `VITE_PUBLIC_SUPABASE_URL` | web | SIM | `.env.example` presente |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | web | SIM | `.env.example` presente |
| `VITE_SUPABASE_URL` | admin, landing | SIM | `.env.example` presente |
| `VITE_SUPABASE_ANON_KEY` | admin, landing | SIM | `.env.example` presente |
| `SUPABASE_URL` | Edge Functions | SIM | Injetado por Supabase runtime |
| `SUPABASE_ANON_KEY` | Edge Functions | SIM | Injetado por Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | SIM | Injetado por Supabase runtime |
| `MP_WEBHOOK_SECRET` | Edge Function process-mp-webhook | Opcional | Validação de assinatura MP |

**Ausentes (necessários para produto final):**
- `VITE_MP_PUBLIC_KEY` — SDK Mercado Pago frontend
- `MP_ACCESS_TOKEN` — Edge Function create-payment-preference (a ser criada)
- `VITE_WHATSAPP_DEFAULT_NUMBER` — CTA WhatsApp global
- `VITE_SENTRY_DSN` — Observabilidade frontend
- Variáveis de analytics (ex: GA4)

### 5.7 Banco de Dados / Supabase / Migrations

| Migration | Status | Conteúdo |
|-----------|--------|---------|
| `00000000000000_init.sql` | `DONE` | Bootstrap inicial |
| `20250516120000_v2_core_schema.sql` | `DONE` | 19 tabelas, triggers, is_tenant_member(), extensions, EXCLUDE USING gist |
| `20250516120100_v2_functions.sql` | `DONE` | RPCs: create_booking_hold, confirm_booking_from_payment, cancel_booking, expire_booking_hold, reschedule_booking, process_mp_webhook, record_manual_payment |
| `20250516120200_v2_rls_policies.sql` | `DONE` | Políticas RLS para todas as tabelas tenant-scoped |
| `20250516120300_v2_seed_demo.sql` | `DONE` | Seed: tenant "Dom Pietro", usuários, frota, motoristas, rotas, parceiros, reservas |

**Tabelas V2 existentes (19):** tenants, users, user_tenants, served_lodgings, partners, route_categories, routes, vehicles, vehicle_slots, drivers, bookings, booking_holds, booking_passengers, payments, payment_events, invoices, messages, audit_logs, booking_status_changes, webhook_deliveries

**Tabelas AUSENTES para produto final:**
- `leads` — CRM básico
- `partner_commissions` — Comissões de parceiros
- `partner_integrations` — Configurações de integração com site de parceiro
- `whatsapp_interactions` — Registro de interações via WhatsApp
- `driver_app_sessions` — Sessões do app do motorista
- `trip_incidents` — Ocorrências de viagem
- `driver_checklists` — Checklist pré-viagem do motorista

**Observação crítica:** A função `update_updated_at_column()` é a correta (definida em v2_core_schema.sql). A menção a `touch_updated_at()` em docs anteriores era um erro de nomenclatura — Status: `RESOLVED`.

### 5.8 Autenticação

| Item | Estado | Evidência |
|------|--------|---------|
| Supabase Auth configurado (local) | `DONE` | supabase/config.toml |
| AuthProvider canônico | `DONE` | apps/web/src/providers/AuthProvider.tsx (commit 481dafa) |
| useAuth hook | `DONE` | apps/web/src/hooks/useAuth.ts |
| Supabase client singleton | `DONE` | apps/web/src/lib/supabase.ts |
| Login OTP (email) | `PARTIAL` | AuthPage existe, mas implementação OTP não verificada |
| Login OAuth (Google) | `MISSING` | Não configurado em config.toml |
| Login OAuth (Apple) | `MISSING` | Não configurado em config.toml |
| Tenant context no login | `MISSING` | AuthProvider não resolve tenant |
| ProtectedRoute | `DONE` | apps/web/src/components/feature/ProtectedRoute.tsx |
| Super admin impersonation | `MISSING` | EXECUTION-PLAN-V2 Phase 1, não implementado |

### 5.9 Autorização / RBAC

| Item | Estado | Evidência |
|------|--------|---------|
| RLS multi-tenant no DB | `DONE` | 49/49 testes passando (v0.3.1) |
| is_tenant_member() function | `DONE` | Migration v2_core_schema.sql |
| user_tenants membership model | `DONE` | Schema V2 |
| Role-based RLS (admin/operator/guest) | `DONE` | Migration v2_rls_policies.sql |
| Frontend role-based guards | `MISSING` | Nenhum guard de role implementado em apps/web |
| Tenant switching | `MISSING` | AuthProvider não suporta |
| Convites por email/link | `MISSING` | Edge Function não existe |

### 5.10 Multi-Tenant

| Item | Estado | Evidência |
|------|--------|---------|
| tenant_id em todas as tabelas operacionais | `DONE` | Schema V2 |
| Isolamento por RLS | `DONE` | 49/49 testes |
| withTenant() utility | `DONE` | packages/core/src/tenant/scope.ts |
| TenantProvider no frontend | `PARTIAL` | packages/ui/src/providers/tenant-provider.tsx existe mas não integrado em apps/web |
| Tenant resolution na URL | `MISSING` | Não implementado |
| Multi-tenant switching UI | `MISSING` | Não implementado |

### 5.11 Admin (apps/web — seção /admin)

| Módulo UI | Estado | Dados |
|-----------|--------|-------|
| AdminLayout (shell + sidebar) | `DONE` | — |
| Dashboard | `PARTIAL` | Mock data (admin-dashboard.ts) |
| Bookings | `PARTIAL` | Mock data (admin-bookings.ts) |
| Transfers | `PARTIAL` | Mock data (admin-transfers.ts) |
| Drivers | `PARTIAL` | Mock data (admin-drivers.ts) |
| Vehicles | `PARTIAL` | Mock data (admin-vehicles.ts) |
| Experiences | `PARTIAL` | Mock data (admin-experiences.ts) |
| Agenda | `PARTIAL` | Mock data (admin-agenda.ts) |
| Routes | `PARTIAL` | Mock data (admin-routes.ts) |
| Checkins | `PARTIAL` | Mock data (admin-checkins.ts) |
| Availability | `PARTIAL` | Mock data (admin-availability.ts) |
| Partners | `PARTIAL` | Sem mock dedicado |
| Categories | `PARTIAL` | Sem mock dedicado |
| Payments | `PARTIAL` | Mock data (admin-payments.ts) |
| Receivables | `PARTIAL` | Mock data (admin-receivables.ts) |
| Reconciliation | `PARTIAL` | Sem mock dedicado |
| Notifications | `PARTIAL` | Mock data (admin-notifications.ts) |
| Customers | `PARTIAL` | Mock data (admin-customers.ts) |
| Settings | `PARTIAL` | Mock data (admin-settings.ts) |
| Reports | `PARTIAL` | Mock data (admin-reports.ts) |
| Search | `PARTIAL` | Sem live data |

**Todos os módulos admin existem como UI mas operam 100% com mock data.**

### 5.12 Site Público (apps/landing)

| Item | Estado |
|------|--------|
| Hero section | `PARTIAL` — estático, sem dados |
| Catálogo de roteiros | `MISSING` |
| Página de roteiro | `MISSING` |
| Busca/filtros | `MISSING` |
| CTA de reserva | `MISSING` |
| CTA de WhatsApp | `MISSING` |
| Formulário de contato | `MISSING` |
| SEO (meta, og, schema.org) | `MISSING` |
| Analytics | `MISSING` |

O `apps/web/src/pages/home/` contém componentes mais elaborados (HeroSection, ExperienceCategories, PlatformFeatures, HospitalityPartners, DriverApp, AdminPanel, PremiumCTA, Footer, Navbar) mas nenhum integrado com dados reais ou SEO.

### 5.13 APIs / Services

| Serviço | Estado | Notas |
|---------|--------|-------|
| Edge Function: create-booking-hold | `DONE` | Autenticado, membership validado |
| Edge Function: confirm-booking-from-payment | `DONE` | Autenticado, idempotente |
| Edge Function: cancel-booking | `DONE` | Autenticado, roles validados |
| Edge Function: expire-booking-hold | `DONE` | Service-role + admin/operator path |
| Edge Function: process-mp-webhook | `DONE` | Assinatura HMAC, idempotência por hash |
| Edge Function: reschedule-booking | `DONE` | Autenticado, roles validados |
| Edge Function: create-payment-preference | `MISSING` | EXECUTION-PLAN-V2 Phase 4 |
| Edge Function: refund-payment | `MISSING` | EXECUTION-PLAN-V2 Phase 4 |
| Edge Function: reconciliation job | `MISSING` | EXECUTION-PLAN-V2 Phase 4 |
| Edge Function: invite-user | `MISSING` | Convites de team members |
| Mercado Pago SDK frontend | `MISSING` | SDK não instalado |
| Realtime subscriptions | `PARTIAL` | Hook use-realtime existe em packages/ui, não usado |

### 5.14 Integrações Externas

| Integração | Estado | Notas |
|-----------|--------|-------|
| Mercado Pago (webhook) | `DONE` | process-mp-webhook Edge Function |
| Mercado Pago (checkout) | `MISSING` | create-payment-preference ausente |
| Google Maps / navegação | `MISSING` | Necessário para App do Motorista |
| WhatsApp (deeplink) | `MISSING` | wa.me link, simples mas não implementado |
| Analytics (GA4/Plausible) | `MISSING` | Não instalado |
| Sentry (observabilidade frontend) | `MISSING` | Não instalado |
| Email (Supabase email) | `PARTIAL` | Supabase Auth email configurado mas SMTP não |
| Firebase | `UNKNOWN` | Instalado em apps/web sem uso documentado — verificar |

### 5.15 Componentes UI

| Categoria | Estado | Notas |
|-----------|--------|-------|
| AdminLayout (sidebar, header, topbar) | `DONE` | apps/web/src/pages/admin/components/ |
| UI primitivos (EmptyState, LoadingSkeleton, PageHeader, StatusBadge) | `DONE` | apps/web/src/pages/admin/components/ui/ |
| Drawers de detalhe (por módulo) | `DONE` | 1 drawer por módulo admin |
| Formulários de criação (por módulo) | `PARTIAL` | Existem mas sem validação/submit real |
| Filter bars (por módulo) | `DONE` | Componentes UI sem funcionalidade live |
| Summary strips (por módulo) | `DONE` | Com mock data |
| AuthCard, AuthLeftPanel | `DONE` | apps/web/src/pages/auth/ |
| Home sections | `DONE` | 8 componentes de home page |
| packages/ui componentes | `PARTIAL` | Exporta hooks e provider, falta biblioteca de componentes shadcn |

### 5.16 Estado Atual de Build/TypeCheck/Lint/Test

**IMPORTANTE:** Os resultados abaixo refletem o estado certificado em v0.4.0 (2026-05-17). Estado atual (2026-06-11) requer nova verificação pelo Codex CLI, pois mudanças foram feitas desde então.

| Check | Status em v0.4.0 | Evidência |
|-------|-----------------|---------|
| `pnpm build` | PASS | docs/versions/v0.4.0-frontend-foundation-stable.md |
| `pnpm lint` | PASS (zero warnings) | idem |
| `pnpm typecheck` | PASS (zero errors) | idem |
| `pnpm test` | N/A — sem testes unitários | Nenhum arquivo .test.ts presente |
| RLS tests (test-rls.sh) | PASS — 49/49 | CHANGELOG v0.3.1 |
| Concorrência (test-concurrency.sh) | PASS — anti-overbooking 100% | CHANGELOG v0.3.0 |
| Webhook tests (test-webhook.sh) | PASS — 5/5 | CHANGELOG v0.3.1 |
| Observabilidade (test-observability.sh) | PASS — 7/7 | CHANGELOG v0.3.1 |

**Status atual de build:** `UNKNOWN` — requer verificação Codex CLI.

### 5.17 Débitos Técnicos

| # | Débito | Severidade | Impacto |
|---|--------|-----------|---------|
| DT-01 | `@stripe/react-stripe-js` instalado em apps/web — gateway é Mercado Pago | HIGH | Confusão de dependência, bundle size |
| DT-02 | `firebase` instalado em apps/web sem uso documentado | HIGH | Bundle size, segurança, entender uso real |
| DT-03 | TanStack Query, Zustand, RHF, Zod ausentes em apps/web (canônico) | CRITICAL | Live integration impossível sem esses |
| DT-04 | Docs de governança não commitados (untracked) | ✅ RESOLVED S0.1 | Governança agora no histórico git |
| DT-05 | Apps admin e landing são stubs sem conteúdo real | MEDIUM | Estratégia a ser definida |
| DT-06 | `update_updated_at_column()` — verificação concluída (nome correto confirmado vs `touch_updated_at()`) | RESOLVED | Função existe e está em uso em múltiplas tabelas |
| DT-07 | Nenhum teste unitário (Vitest) em nenhum pacote ou app | HIGH | Qualidade não verificável automaticamente |
| DT-08 | Playwright E2E inexistente | HIGH | EXECUTION-PLAN-V2 Phase 7 |
| DT-09 | Frontend de auth não implementa tenant resolution | HIGH | Multi-tenant não funciona no frontend |
| DT-10 | Versões divergentes de Vite (^8 no web, ^6 no admin/landing) e recharts (^3 no web, ^2 no admin) | LOW | Inconsistência, possíveis bugs |
| DT-11 | Sprint S3 (lint cleanup) aguardando aprovação — lint pode ter degradado | MEDIUM | Qualidade de código |

### 5.18 Blockers

| # | Blocker | Dono | Resolução |
|---|---------|------|-----------|
| B-01 | Docs de governança untracked — commit obrigatório | ✅ RESOLVIDO S0.1 | Kimi/Codex | Commit realizado |
| B-02 | Sprint S3 aguardando aprovação | Alexandre / ChatGPT | Decisão humana |
| B-03 | firebase instalado sem uso claro em apps/web | Codex CLI | Auditoria e remoção ou documentação |
| B-04 | Stripe SDK instalado incorretamente | Codex CLI | Substituir por SDK Mercado Pago |
| B-05 | Nenhum teste unitário — qualidade não verificável | Codex CLI | Implementar Vitest nos packages/core e packages/ui |
| B-06 | Live data integration não iniciada (v0.5.0 pending) | Kimi/Codex | Sprint 1.3 deste Exec Plan |

### 5.19 Riscos Técnicos

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| RT-01 | update_updated_at_column() — nomenclatura corrigida (era touch_updated_at) | Baixo | Médio | RESOLVIDO — OR1 |
| RT-02 | Stripe SDK conflito com MP SDK (peer deps) | Alto | Médio | Remover Stripe antes de instalar MP SDK |
| RT-03 | Firebase não gerenciado pode expor chaves | Alto | Alto | Auditar e remover se desnecessário |
| RT-04 | Sem testes E2E — regressões silenciosas | Alto | Alto | Playwright na Wave 8 |
| RT-05 | apps/web sem TanStack Query — live integration vai exigir refactor | Certo | Alto | Instalar antes de Sprint 1.3 |
| RT-06 | Tenant context ausente no frontend — dados cruzados possíveis | Alto | Crítico | Sprint 1.2 |
| RT-07 | Docs de governança não versionados — contexto perdido | ✅ RESOLVIDO S0.1 | ✅ RESOLVIDO S0.1 | Commit realizado (B-01) |
| RT-08 | create-payment-preference Edge Function ausente — MP não funciona | Certo | Crítico | Sprint 4.1 |

---

## 6. Inventário Funcional

### 6.1 Funcionalidades DONE (com evidência)

- Schema V2 multi-tenant completo (19 tabelas, RLS, triggers)
- Booking orchestration backend (hold, confirm, cancel, reschedule, expire)
- Webhook handler Mercado Pago com idempotência e assinatura HMAC
- RLS multi-tenant com 49 testes passando
- Anti-overbooking concorrência 100%
- AuthProvider canônico com listener singleton
- useAuth hook
- Supabase client factory tipado
- Tenant scope utilities (withTenant, injectTenant, hasTenantScope)
- Admin UI shell (AdminLayout, sidebar, header)
- Admin UI — todos os módulos com componentes UI + mock data
- Home page (apps/web/src/pages/home) com múltiplas seções
- Auth page (login form)
- ProtectedRoute guard
- i18n estrutura (sem conteúdo completo)
- Monorepo PNPM + Turbo funcional
- packages/config shared (ESLint, TS, Tailwind)
- CI/CD GitHub Actions configurado (workflow não commitado)
- Vercel config (vercel.json em apps/web)

### 6.2 Funcionalidades PARTIAL (em progresso ou com gaps)

- Autenticação — fluxo OTP não verificado, tenant context ausente
- packages/ui — hooks existem, componentes shadcn não exportados
- Admin formulários — existem como UI mas sem validação/submit real
- Realtime hook — existe mas não usado em nenhuma página
- App do hóspede (apps/web) — páginas admin presentes mas sem dados live

### 6.3 Funcionalidades MISSING (não iniciadas)

- Live data integration (todos os módulos admin)
- create-payment-preference Edge Function
- Checkout flow completo (frontend)
- Site público/comercial real (catálogo, roteiro individual, SEO)
- Widget de integração com site do parceiro
- Fluxo WhatsApp (deeplink configurável por tenant)
- App do motorista
- Testes unitários (Vitest)
- Testes E2E (Playwright)
- Load tests (k6)
- Relatórios com dados reais
- CRM / leads
- Comissões de parceiros
- Portal do parceiro (optional)
- Analytics / observabilidade frontend
- Notificações push/email reais
- Super admin impersonation
- Convites de usuários (Edge Function)
- Tenant resolution via URL
- Mercado Pago SDK frontend
- Sentry integration

---

## 7. Gap Analysis

| # | Módulo | Status Atual | Gap Principal | Risco | Prioridade | Fase Sugerida |
|---|--------|-------------|--------------|-------|-----------|--------------|
| 1 | Admin Core (shell, layout, auth) | PARTIAL | Sem tenant context, sem live data | ALTO | MVP | Wave 1 |
| 2 | Gestão de Tenants/Empresas | PARTIAL | UI mockada, sem CRUD real | MÉDIO | MVP | Wave 2 |
| 3 | Gestão de Usuários | PARTIAL | UI mockada, sem convites, sem RBAC frontend | ALTO | MVP | Wave 1 |
| 4 | RBAC | PARTIAL | DB pronto, frontend sem role guards | ALTO | MVP | Wave 1 |
| 5 | Gestão de Clientes | PARTIAL | UI mockada, sem live | MÉDIO | MVP | Wave 2 |
| 6 | Gestão de Parceiros | PARTIAL | UI mockada, sem comissão, sem integração | MÉDIO | MVP | Wave 2 |
| 7 | Gestão de Roteiros/Experiências | PARTIAL | UI mockada, sem live | ALTO | MVP | Wave 2 |
| 8 | Gestão de Agenda/Disponibilidade | PARTIAL | UI mockada, sem live, sem slot generation UI | ALTO | MVP | Wave 2 |
| 9 | Gestão de Reservas | PARTIAL | UI mockada, hold/confirm/cancel no backend | CRÍTICO | MVP | Wave 2 |
| 10 | Gestão de Pagamentos | PARTIAL | webhook pronto, sem preference/checkout frontend | CRÍTICO | MVP | Wave 4 |
| 11 | Gestão Financeira (receivables, reconciliação) | PARTIAL | UI mockada, sem live | MÉDIO | Produção | Wave 7 |
| 12 | Gestão de Motoristas | PARTIAL | UI mockada, sem live | MÉDIO | MVP | Wave 2 |
| 13 | Gestão de Veículos | PARTIAL | UI mockada, sem live | MÉDIO | MVP | Wave 2 |
| 14 | Gestão Operacional das Viagens | PARTIAL | UI parcial (checkins), sem live | MÉDIO | MVP | Wave 2 |
| 15 | CRM / Leads | MISSING | Sem tabela, sem UI | BAIXO | Pós-MVP | Wave 7 |
| 16 | Site Público | MISSING | Apenas stub | CRÍTICO | MVP | Wave 3 |
| 17 | Página de Roteiro (public) | MISSING | Sem implementação | CRÍTICO | MVP | Wave 3 |
| 18 | Checkout / Reserva Online | MISSING | Backend parcial, frontend ausente | CRÍTICO | MVP | Wave 3/4 |
| 19 | WhatsApp como canal | MISSING | Sem deeplink configurável por tenant | MÉDIO | MVP | Wave 6 |
| 20 | Widget / Integração com Site do Cliente | MISSING | Não iniciado | ALTO | Produção | Wave 4 |
| 21 | Portal do Parceiro | MISSING | Não iniciado | BAIXO | Pós-MVP | Wave 4+ |
| 22 | App do Motorista | MISSING | Não iniciado | ALTO | Produção | Wave 5 |
| 23 | Notificações | MISSING | Hook realtime existe, sem uso | MÉDIO | Produção | Wave 6 |
| 24 | Relatórios / Analytics | PARTIAL | UI mockada | BAIXO | Produção | Wave 7 |
| 25 | SEO | MISSING | Sem meta tags, sem schema.org | MÉDIO | Produção | Wave 3 |
| 26 | Auditoria / Logs | DONE (backend) | Frontend read-only ausente | BAIXO | Produção | Wave 7 |
| 27 | Segurança | PARTIAL | RLS OK, frontend sem hardening completo | ALTO | MVP | Wave 1 |
| 28 | Observabilidade | MISSING | Sem Sentry, sem analytics | MÉDIO | Produção | Wave 8 |
| 29 | Deploy / Produção | PARTIAL | Vercel config existe, sem env vars produção | CRÍTICO | Produção | Wave 8 |
| 30 | Documentação | PARTIAL | Boa governança, falta runbooks operacionais | BAIXO | Produção | Wave 8 |

---

## 8. Matriz de Riscos

| # | Risco | Probabilidade | Impacto | Nível | Dono | Fase de Mitigação |
|---|-------|:----------:|:------:|:-----:|------|:---------------:|
| R-01 | Firebase + Stripe instalados incorretamente causam conflito/vazamento | Alto | Alto | **CRÍTICO** | Codex CLI | Wave 0 |
| R-02 | update_updated_at_column() — nomenclatura corrigida (era touch_updated_at) | Baixo | Baixo | **RESOLVIDO** | Kimi | OR1 |
| R-03 | Tenant context ausente no frontend — cross-tenant data leak UI | Alto | Crítico | **CRÍTICO** | Codex/Kimi | Wave 1 |
| R-04 | create-payment-preference ausente — sem fluxo de pagamento | Certo | Crítico | **CRÍTICO** | Codex CLI | Wave 4 |
| R-05 | Sem testes unitários — regressões silenciosas | Alto | Alto | **ALTO** | Codex CLI | Wave 1 |
| R-06 | Docs de governança não commitados — perda de histórico | ✅ RESOLVIDO S0.1 | ✅ RESOLVIDO S0.1 | ✅ **RESOLVIDO** | Gemini | Wave 0 |
| R-07 | RLS policies não validadas contra schema pós-S1.2 | Médio | Crítico | **ALTO** | Claude/Codex | Wave 1 |
| R-08 | App do motorista sem offline support — operação em áreas sem sinal | Médio | Alto | **ALTO** | Arquitetura | Wave 5 |
| R-09 | Widget de parceiro cross-origin sem CORS configurado | Médio | Alto | **ALTO** | Arquitetura | Wave 4 |
| R-10 | SEO ausente no lançamento — visibilidade orgânica zero | Alto | Médio | **MÉDIO** | Codex/Kimi | Wave 3 |
| R-11 | Mercado Pago sandbox não testado end-to-end | Alto | Alto | **ALTO** | Codex CLI | Wave 4 |
| R-12 | Scope creep em Wave 4/5 sem ADR — govenance violation | Médio | Alto | **ALTO** | DeepSeek | Contínuo |

---

## 9. Arquitetura Recomendada — Produto Final

### 9.1 Monorepo — Apps Finais

```
apps/
├── web/          # Admin + Home (canônico v0.4.0) — EVOLUI
├── public/       # Site público/comercial (novo ou evolução de landing)
├── driver/       # App do motorista (novo — PWA)
└── landing/      # Deprecar ou fundir com public/
```

**Decisão necessária (Alexandre):** apps/landing se torna apps/public, ou criamos apps/public separado?

### 9.2 Stack Adicional Necessária (para apps/web)

```
@tanstack/react-query       # Server state (CRÍTICO)
zustand                     # Client state (CRÍTICO)  
react-hook-form             # Formulários (CRÍTICO)
zod                         # Validação (CRÍTICO)
@mercadopago/sdk-react      # Checkout MP (CRÍTICO para pagamentos)
next-seo ou react-helmet    # SEO (apps/public)
@sentry/react               # Observabilidade
```

**Remover de apps/web:** `@stripe/react-stripe-js`, `firebase` (se não há uso)

### 9.3 Edge Functions Adicionais Necessárias

| Função | Prioridade | Wave |
|--------|-----------|------|
| `create-payment-preference` | CRÍTICO | Wave 4 |
| `refund-payment` | ALTO | Wave 4 |
| `reconciliation-job` (cron) | MÉDIO | Wave 7 |
| `invite-user` | MÉDIO | Wave 2 |
| `send-booking-confirmation-email` | MÉDIO | Wave 6 |
| `driver-trip-sync` | MÉDIO | Wave 5 |

### 9.4 Novas Tabelas Necessárias

| Tabela | Propósito | Wave |
|--------|----------|------|
| `leads` | CRM básico | Wave 7 |
| `partner_commissions` | Controle de comissões | Wave 4 |
| `partner_integrations` | Config de widget/embed por parceiro | Wave 4 |
| `driver_sessions` | Sessões ativas do app motorista | Wave 5 |
| `trip_incidents` | Ocorrências reportadas pelo motorista | Wave 5 |
| `driver_documents` | Upload de comprovantes | Wave 5 |

### 9.5 Decisões Arquiteturais Pendentes (Precisam de Alexandre)

| # | Decisão | Opções | Impacto |
|---|---------|--------|---------|
| DA-01 | apps/landing → apps/public ou manter separados? | A: Evoluir landing; B: Novo app public | Estrutura de Wave 3 |
| DA-02 | App do motorista: PWA em apps/driver ou app nativo? | A: PWA (React+Vite, dentro do monorepo); B: React Native separado | Wave 5 scope |
| DA-03 | Widget de parceiro: iframe, script embed ou landing dedicada? | A: iframe; B: script embed; C: landing page parametrizada | Wave 4 scope |
| DA-04 | Multi-idioma para site público? | A: Sim (i18next já existe); B: Apenas PT-BR para MVP | Wave 3 scope |
| DA-05 | apps/admin e apps/landing: deprecar ou manter como legados? | A: Deprecar (remover); B: Manter como stubs; C: Evoluir um deles | Estrutura final |

---

## 10. Estratégia — App do Motorista

### 10.1 Recomendação

**PWA em `apps/driver`** dentro do monorepo existente.

**Justificativa:**
- Compartilha packages/core e packages/ui — reutilização máxima
- Stack idêntica (React+Vite+TS) — sem nova curva de aprendizado
- Acesso a Supabase Realtime nativo
- Funciona offline via Service Worker (PWA)
- Deploy via Vercel como app separada
- Evita overhead de React Native, Expo ou app store submissions para MVP

### 10.2 Funcionalidades do App do Motorista (MVP)

| Feature | Prioridade | Notas |
|---------|-----------|-------|
| Login do motorista (OTP) | CRÍTICO | Role: driver em user_tenants |
| Agenda diária | CRÍTICO | Filtrado por driver_id, data |
| Lista de viagens | CRÍTICO | Com status, horário, origem/destino |
| Detalhe da viagem | CRÍTICO | Passageiros, observações, contato |
| Check-in da viagem | CRÍTICO | Atualiza status no backend |
| Check-out/conclusão | CRÍTICO | Fecha viagem, libera slot |
| Status da viagem | ALTO | Pendente → Em Andamento → Concluída → Cancelada |
| Integração Google Maps/Waze | ALTO | Deep-link para navegação |
| Ocorrências | MÉDIO | Formulário simples, foto upload |
| Modo offline parcial | MÉDIO | Cache de viagens do dia (PWA + Supabase offline cache) |
| Sincronização com admin | AUTOMÁTICO | Via Supabase Realtime |

### 10.3 Considerações Técnicas

- Nova tabela `driver_sessions` para rastrear estado do motorista
- `trip_incidents` para ocorrências
- RLS policy para role `driver` — acesso apenas às próprias viagens
- Upload de fotos via Supabase Storage (bucket `driver-incidents`)
- Service Worker para cache offline de dados do dia
- Notificações push via Web Push API (PWA)

---

## 11. Estratégia — Integração com Site do Cliente/Parceiro

### 11.1 Recomendação

**Landing page parametrizada** como abordagem principal, com iframe como alternativa para casos específicos.

**Justificativa:**
- Mais seguro que script embed (sem XSS risk)
- SEO-friendly — pode ser indexada por operador/parceiro
- Fácil de implementar sem depender de JS do site do cliente
- Rastreabilidade via UTM params + cookie de origem
- Customizável por parceiro via query params

### 11.2 Implementação

```
https://experience.dompietro.com/parceiro/:partner_slug?origem=hotel-fazenda&utm_source=partner
```

Cada parceiro recebe uma URL rastreável que:
- Mostra catálogo filtrado por roteiros disponíveis para o parceiro
- Exibe CTA de WhatsApp com número do operador/responsável (configurável por partner)
- Registra `origem` como campo em leads/reservas
- Calcula comissão por `partner_id` nas reservas geradas

### 11.3 Tabela `partner_integrations`

```sql
partner_integrations (
  id, tenant_id, partner_id,
  partner_slug,           -- URL-safe identifier
  whatsapp_number,        -- Número configurável
  commission_pct,         -- % de comissão
  allowed_route_ids,      -- Roteiros visíveis para este parceiro
  tracking_params,        -- UTM defaults
  is_active,
  created_at, updated_at
)
```

### 11.4 Rastreamento de Origem

- Campo `origin_partner_id` em `bookings` e `leads`
- Cookie de sessão com `partner_slug` por 30 dias
- Dashboard admin com conversão por parceiro

---

## 12. Estratégia — WhatsApp como Canal de Fechamento

### 12.1 Abordagem (Fluxo B)

WhatsApp como canal de fechamento humano, **sem API WhatsApp Business** para MVP.

**Implementação:**
1. Botão CTA em cada roteiro e na landing de parceiro
2. Link `https://wa.me/{numero}?text={mensagem_pre_formatada}`
3. Número configurável por tenant (settings do operador) e por parceiro (partner_integrations)
4. Mensagem pré-formatada inclui: nome do roteiro, data sugerida, número de pessoas
5. Operador fecha reserva manualmente no admin (bookings → nova reserva → record_manual_payment)
6. Opcionalmente, link de confirmação pode ser enviado ao cliente via WhatsApp

### 12.2 Registro de Interações

- `whatsapp_interactions` (tabela simples): tenant_id, partner_id, route_id, timestamp, phone_masked
- Status: `clicked` — não é uma reserva até o admin confirmar
- Métrica visível no dashboard como "leads WhatsApp"

### 12.3 Configuração por Tenant

Campo `whatsapp_number` e `whatsapp_message_template` em `tenants.settings` (JSONB já existe).

---

## 13. Estratégia — DeepSeek V4 Flash Free como Orquestrador

### 13.1 Princípio

DeepSeek V4 Flash free opera como **orquestrador operacional gratuito**, seguindo o modelo estabelecido em `aistudio-portal-urubici-pc` e codificado em `DEEPSEEK.md v1.0` e `ADR-008`.

**Regra de ouro:** DeepSeek orquestra. Nunca executa.

### 13.2 Responsabilidades por Wave

| Wave | Papel do DeepSeek |
|------|------------------|
| Wave 0 | Bootstrap: carregar governance docs, verificar estado do repo, criar execution packages para Codex/Kimi |
| Wave 1 | Orquestrar sprints de live integration, atribuir tarefas a Kimi/Codex, verificar evidências |
| Wave 2–4 | Quebrar módulos em tarefas atômicas, preparar prompts, verificar critérios de aceite |
| Wave 5 | Coordenar desenvolvimento do app do motorista, sincronizar com admin |
| Wave 6–7 | Orquestrar pagamentos, WhatsApp, analytics — escalar para Claude quando houver risco |
| Wave 8 | Coordenar hardening — escalar tudo para Claude/Codex, não tomar decisões de segurança sozinho |
| Wave 9 | Post-launch: monitoramento, triagem de bugs, roadmap pós-MVP |

### 13.3 Sequência de Boot Obrigatória (por DEEPSEEK.md)

Antes de cada sessão, DeepSeek DEVE carregar:
1. `docs/governance/DEEPSEEK.md`
2. `docs/governance/MASTER_PORTFOLIO.md`
3. `docs/governance/GOVERNANCE_STATE.md`
4. `docs/governance/ORCHESTRATOR_CONTEXT.md`

Se qualquer arquivo estiver ausente → **DEGRADED CONTEXT** → Parar e escalar para Alexandre.

### 13.4 Escalação Obrigatória para Claude

DeepSeek DEVE escalar para Claude (Security & Architecture Auditor) quando:
- Qualquer decisão envolver RLS, autenticação, secrets ou pagamentos
- Qualquer modificação arquitetural for proposta
- Evidência de security issue ou data leak for detectada
- Sprint envolver produção, deploy ou migração

### 13.5 Papéis dos Agentes (Este Repo)

| Agente | Papel | Escopo |
|--------|-------|--------|
| DeepSeek V4 Flash | Orquestrador Operacional | Planejamento, assignment, verificação de evidências |
| Claude | Auditor Premium (arquitetura, segurança, governança) | ADRs, RLS, payments, decisões críticas |
| Codex CLI | Execução técnica | Implementação, patches, build, testes, validação |
| Codex IDE | Execução premium restrita | UI complexa, scraping, smoke visual |
| Gemini | Git & Governance | Commits, versionamento, releases, governance docs |
| Kimi | Factory Floor / Execução | Implementação em massa, normalização, limpeza |
| ChatGPT | Orquestrador Estratégico | Aprovação de escopo, decisões produto, revisão de governança |
| Minimax | Validador Independente | Auditoria técnica pós-sprint |

---

## 14. Exec Plan — Waves, Phases, Sprints

---

# Wave 0 — Governance, Inventory & Baseline

**Objetivo:** Garantir baseline sólido, corrigir débitos críticos pré-implementação.

---

## Phase 0.1 — Repository & Governance Baseline

### Sprint 0.1.1 — Commit Governance Docs & Fix Critical Deps

- **Objetivo:** Commitar docs de governança untracked, remover deps incorretas, verificar build baseline
- **Escopo:** Commit de `docs/governance/`, `docs/EXECUTION/`, `.github/` | Remover Stripe SDK | Auditar firebase | Instalar TanStack Query, Zustand, RHF, Zod em apps/web
- **Entradas:** Este documento; state atual do repo
- **Agente Recomendado:** Gemini (commits) + Codex CLI (deps)
- **Tarefas:**
  1. `git add docs/governance/ docs/EXECUTION/ .github/` e commit (Gemini)
  2. `pnpm remove @stripe/react-stripe-js` de apps/web (Codex CLI)
  3. Auditar firebase — se sem uso: `pnpm remove firebase` (Codex CLI)
  4. `pnpm add @tanstack/react-query zustand react-hook-form zod` em apps/web (Codex CLI)
  5. `pnpm build && pnpm lint && pnpm typecheck` — verificar zero erros
- **Critérios de Aceite:**
  - `git status` mostra docs/governance/ como tracked
  - `pnpm build` PASS
  - `pnpm lint` PASS (zero warnings)
  - `pnpm typecheck` PASS (zero errors)
  - Stripe SDK ausente de apps/web/package.json
  - firebase auditado e removido ou documentado
- **Testes/Validações:** `pnpm build`, `pnpm lint`, `pnpm typecheck`
- **Riscos:** Remover firebase pode quebrar feature oculta
- **Dependências:** Nenhuma
- **Artefatos:** Commit de governance, package.json limpo
- **Status:** PENDING

### Sprint 0.1.2 — Verify update_updated_at_column & RLS Baseline

- **Objetivo:** Confirmar que triggers de updated_at funcionam e RLS ainda passa 49/49
- **Escopo:** Confirmar função `update_updated_at_column()` é a correta (nomenclatura já corrigida em OR1) | Re-executar test-rls.sh | Documentar resultado
- **Agente Recomendado:** Codex CLI
- **Tarefas:**
  1. Ler migration v2_core_schema.sql — confirmar nome da função de trigger
  2. Re-executar `scripts/test-rls.sh` contra Supabase local
  3. Re-executar `scripts/test-concurrency.sh`
  4. Documentar resultado em `docs/versions/BASELINE-VERIFICATION-2026-06-11.md`
- **Critérios de Aceite:** test-rls: 49/49 | test-concurrency: 0% overbooking | Documento de evidência criado
- **Riscos:** RT-02 — RESOLVIDO (nomenclatura corrigida em OR1)
- **Dependências:** Sprint 0.1.1 (build limpo)
- **Artefatos:** BASELINE-VERIFICATION doc, log dos testes
- **Status:** PENDING

---

## Phase 0.2 — Sprint S3 — Lint Cleanup & Type Hardening

### Sprint 0.2.1 — Lint S3 (Aprovação Pendente)

- **Objetivo:** Resolver erros de lint listados em CONNECT_EXECUTION_GOVERNANCE_V1
- **Escopo:** 14 arquivos listados no governance doc (pages/AcceptInvitation.tsx, SecuritySettings.tsx, etc.)
- **Agente Recomendado:** Kimi
- **Tarefas:** Resolver todos os lint errors nos 14 arquivos listados; executar `pnpm lint` → zero erros
- **Critérios de Aceite:** `pnpm lint` PASS | `pnpm typecheck` PASS | Minimax audit PASS
- **Riscos:** Arquivos listados podem não existir em apps/web (podem ser do portal-connect-admin)
- **Dependências:** Aprovação de Alexandre/ChatGPT | Sprint 0.1.1 concluído
- **Artefatos:** PR com lint fixes, Minimax audit report
- **Status:** PENDING APPROVAL

---

# Wave 1 — Core Platform Stabilization

**Objetivo:** Conectar frontend ao Supabase real. Auth multi-tenant funcional. Rotas protegidas por role.

---

## Phase 1.1 — Auth & Tenant Context

### Sprint 1.1.1 — Tenant Resolution & Role Guards

- **Objetivo:** Frontend resolve tenant via URL/subdomínio e aplica guards por role
- **Escopo:** TenantProvider em apps/web | Tenant resolution na URL | Role-based route guards | Login → Dashboard com tenant context
- **Agente Recomendado:** Kimi (implementação) + Claude (review de segurança)
- **Tarefas:**
  1. Integrar `TenantProvider` de packages/ui em apps/web App.tsx
  2. Implementar tenant resolution (URL param ou subdomínio) em AuthProvider
  3. Adicionar role-based guards em router/config.tsx
  4. Testar: login como admin → acessa /admin | login como guest → redireciona
- **Critérios de Aceite:** Tenant context disponível em todos os admin pages | Cross-tenant data não visível no frontend | build + lint + typecheck PASS
- **Riscos:** RT-03 — se não implementado, RLS não é suficiente sozinho
- **Dependências:** Wave 0 completa; TanStack Query instalado
- **Artefatos:** PR com tenant context, evidência de teste
- **Status:** PENDING

### Sprint 1.1.2 — OTP Login & Invite Flow

- **Objetivo:** Login OTP funcional + Edge Function de convite de usuários
- **Escopo:** AuthPage com OTP implementado | Edge Function invite-user | Fluxo de aceite de convite
- **Agente Recomendado:** Codex CLI
- **Tarefas:**
  1. Verificar/implementar OTP form em AuthPage
  2. Criar Edge Function `invite-user`
  3. Criar página `/invite/:token` para aceite
  4. Testar fluxo completo
- **Critérios de Aceite:** Usuário consegue fazer login via OTP email | Admin pode convidar novo membro | Convite aceito aparece em user_tenants
- **Riscos:** SMTP não configurado em produção
- **Dependências:** Sprint 1.1.1
- **Artefatos:** Edge Function invite-user, página de invite
- **Status:** PENDING

---

## Phase 1.2 — Live Data Foundation

### Sprint 1.2.1 — React Query Setup & Data Layer

- **Objetivo:** Instalar e configurar TanStack Query. Criar hooks de dados para módulos core.
- **Escopo:** QueryClient provider em App.tsx | hooks: useBookings, useRoutes, useDrivers, useVehicles
- **Agente Recomendado:** Kimi
- **Tarefas:**
  1. Adicionar QueryClientProvider em App.tsx
  2. Criar `apps/web/src/hooks/data/useBookings.ts` (read + mutations)
  3. Criar `apps/web/src/hooks/data/useRoutes.ts`
  4. Criar `apps/web/src/hooks/data/useDrivers.ts`
  5. Criar `apps/web/src/hooks/data/useVehicles.ts`
  6. Conectar Dashboard page ao live data (remover mocks)
- **Critérios de Aceite:** Dashboard mostra dados reais do Supabase local | Sem mock data em dashboard
- **Riscos:** Seed data deve estar presente no Supabase local
- **Dependências:** Sprint 1.1.1 (tenant context)
- **Artefatos:** Hooks de dados, Dashboard com live data
- **Status:** PENDING

---

# Wave 2 — Admin Business Modules

**Objetivo:** Todos os módulos admin conectados ao backend real.

---

## Phase 2.1 — Core Operational Modules Live

### Sprint 2.1.1 — Bookings & Reservations Live

- **Objetivo:** Módulo de reservas funcional com backend real
- **Escopo:** BookingsPage live | BookingDetailDrawer com ações reais | NovaReservaForm com submit | Edge Functions conectadas
- **Agente Recomendado:** Kimi + Codex CLI
- **Tarefas:**
  1. useBookings hook com CRUD via Supabase e Edge Functions
  2. BookingsTable com dados reais, filtros funcionais
  3. BookingDetailDrawer com ações (confirmar, cancelar, remarcar)
  4. NovaReservaForm — hold → payment preference → confirmar
  5. Realtime update quando status muda
- **Critérios de Aceite:** Admin pode criar reserva | Admin pode cancelar/remarcar | Status atualiza em real-time
- **Riscos:** create-payment-preference ainda ausente — mock para Wave 2, real na Wave 4
- **Dependências:** Sprint 1.2.1
- **Artefatos:** Bookings module live
- **Status:** PENDING

### Sprint 2.1.2 — Routes, Vehicles, Drivers Live

- **Objetivo:** CRUD de rotas, veículos e motoristas com backend real
- **Agente Recomendado:** Kimi
- **Tarefas:** CRUD live para routes, vehicles, drivers | slot generation UI em Availability page
- **Critérios de Aceite:** Admin pode criar/editar/desativar rotas, veículos e motoristas
- **Dependências:** Sprint 1.2.1
- **Status:** PENDING

### Sprint 2.1.3 — Agenda VAN Live

- **Objetivo:** Agenda visual com dados reais de slots e reservas
- **Agente Recomendado:** Kimi + Codex CLI
- **Tarefas:** AgendaPage conectada a vehicle_slots e bookings | CalendarView real | Drag-and-drop (se viável em MVP)
- **Critérios de Aceite:** Agenda mostra slots e reservas do dia | Reservas confirmadas aparecem em real-time
- **Dependências:** Sprint 2.1.1 e 2.1.2
- **Status:** PENDING

### Sprint 2.1.4 — Customers, Partners, Categories Live

- **Objetivo:** Gestão de clientes, parceiros e categorias com backend real
- **Agente Recomendado:** Kimi
- **Tarefas:** CRUD live para customers (served_lodgings + guests), partners, route_categories
- **Critérios de Aceite:** Admin pode gerenciar todos os cadastros básicos
- **Dependências:** Sprint 1.2.1
- **Status:** PENDING

### Sprint 2.1.5 — Settings & User Management Live

- **Objetivo:** Configurações do tenant e gestão de equipe funcionais
- **Agente Recomendado:** Kimi
- **Tarefas:** SettingsEmpresa com update de tenants | SettingsEquipe com lista de user_tenants | SettingsPermissoes com role editing | Convidar membro (Sprint 1.1.2)
- **Critérios de Aceite:** Admin pode editar configurações do tenant | Admin pode gerenciar equipe
- **Dependências:** Sprint 1.1.2, Sprint 1.2.1
- **Status:** PENDING

---

# Wave 3 — Public Site & Booking Funnel

**Objetivo:** Site público funcional com catálogo, páginas de roteiros, SEO básico e CTA de reserva/WhatsApp.

---

## Phase 3.1 — Public Site Architecture

### Sprint 3.1.1 — Decisão de Arquitetura do Site Público

- **Objetivo:** Definir se apps/landing evolui para site público ou criamos apps/public
- **Agente Recomendado:** Claude (arquitetura) + ChatGPT (decisão de produto)
- **Tarefas:**
  1. Analisar apps/landing atual
  2. Propor ADR com 2 opções: (A) evoluir apps/landing, (B) novo apps/public
  3. Submeter para aprovação de Alexandre
- **Critérios de Aceite:** ADR criado, aprovado por Alexandre, estratégia definida
- **Riscos:** DA-01 — decisão arquitetural sem a qual Wave 3 não avança
- **Dependências:** Wave 0 completa
- **Artefatos:** ADR-009 (proposto)
- **Status:** NEEDS_DECISION

### Sprint 3.1.2 — Site Público: Shell, Catálogo, SEO

- **Objetivo:** Página inicial com catálogo de roteiros, busca, filtros e SEO básico
- **Agente Recomendado:** Kimi + Codex CLI
- **Tarefas:**
  1. Implementar Navbar e Footer do site público
  2. Página inicial com hero, catálogo de roteiros
  3. Componente RouteCard para listing
  4. Filtros básicos (categoria, preço, duração)
  5. Meta tags + OpenGraph básicos
  6. Integração com Supabase: listar routes disponíveis
- **Critérios de Aceite:** Site público mostra roteiros reais | SEO básico presente | Mobile-responsive
- **Dependências:** Sprint 3.1.1, Sprint 2.1.2 (routes live)
- **Status:** PENDING

### Sprint 3.1.3 — Página Individual de Roteiro

- **Objetivo:** Página `/roteiro/:slug` com detalhes completos, galeria, preço, disponibilidade e CTAs
- **Agente Recomendado:** Kimi + Codex IDE (visual)
- **Tarefas:**
  1. Rota `/roteiro/:slug`
  2. Dados completos da route (descrição, preço, duração, categorias, fotos)
  3. Slot availability widget (datas disponíveis)
  4. CTA "Reservar Online" → booking funnel
  5. CTA "WhatsApp" → deeplink com mensagem pré-formatada
  6. SEO: title, description, schema.org/Event
- **Critérios de Aceite:** Página mostra dados reais | Dois CTAs funcionais | SEO presente
- **Dependências:** Sprint 3.1.2
- **Status:** PENDING

---

## Phase 3.2 — Booking Funnel (Fluxo A — Online)

### Sprint 3.2.1 — Guest Booking Flow

- **Objetivo:** Fluxo completo de reserva online para o hóspede
- **Agente Recomendado:** Kimi + Codex CLI + Claude (review segurança)
- **Tarefas:**
  1. Página `/reservar/:route_slug` — seleção de data/pax
  2. Formulário de dados do hóspede
  3. Chamada ao Edge Function `create-booking-hold`
  4. Redirect para checkout (MP — Wave 4 via placeholder até lá)
  5. Página `/reserva/confirmacao/:booking_id`
  6. Histórico de reservas do hóspede (`/minhas-reservas`)
- **Critérios de Aceite:** Hóspede completa fluxo até hold criado | Confirmação visível | Mobile-responsive
- **Riscos:** MP checkout depende de Wave 4; usar placeholder com redirect simulado
- **Dependências:** Sprint 3.1.3, Sprint 2.1.1
- **Status:** PENDING

---

# Wave 4 — Partner/Client Site Integration & Payments

**Objetivo:** Pagamentos online completos via Mercado Pago. Widget/landing de parceiro com rastreamento.

---

## Phase 4.1 — Pagamentos Mercado Pago

### Sprint 4.1.1 — create-payment-preference Edge Function

- **Objetivo:** Criar Edge Function que gera preference Mercado Pago e retorna checkout URL
- **Agente Recomendado:** Codex CLI + Claude (review segurança/idempotência)
- **Tarefas:**
  1. Criar `supabase/functions/create-payment-preference/index.ts`
  2. Integrar MP REST API (POST /checkout/preferences)
  3. Campo `external_reference` = booking_id
  4. Armazenar preference_id em `payments`
  5. Idempotência: mesmo booking_id retorna mesma preference se pendente
- **Critérios de Aceite:** Edge Function retorna checkout_url | MP sandbox funciona end-to-end | Webhook confirma booking após pagamento
- **Riscos:** R-11 — MP sandbox não testado; R-08 (variáveis de ambiente de produção)
- **Dependências:** Sprint 3.2.1, MP API credentials
- **Artefatos:** Edge Function create-payment-preference, testes MP sandbox
- **Status:** PENDING

### Sprint 4.1.2 — MP SDK Frontend & Checkout UI

- **Objetivo:** Integrar SDK Mercado Pago no frontend para checkout in-app
- **Agente Recomendado:** Kimi
- **Tarefas:**
  1. Instalar `@mercadopago/sdk-js` ou usar redirect para MP checkout externo
  2. Conectar booking funnel → payment preference → redirect/modal MP
  3. Página de retorno pós-pagamento
  4. Tratamento de payment_fail/payment_pending no frontend
- **Critérios de Aceite:** E2E: hóspede reserva → paga no MP sandbox → recebe confirmação
- **Dependências:** Sprint 4.1.1
- **Status:** PENDING

---

## Phase 4.2 — Partner Integration Widget

### Sprint 4.2.1 — partner_integrations Table & Config

- **Objetivo:** Criar tabela, migrations e UI admin para configurar integrações de parceiros
- **Agente Recomendado:** Codex CLI + Claude (RLS review)
- **Tarefas:**
  1. Migration: criar `partner_integrations` com RLS
  2. Admin UI: página `/admin/partners/:id/integration`
  3. Campos: slug, whatsapp_number, commission_pct, allowed_route_ids
- **Critérios de Aceite:** Admin pode configurar integração de parceiro | RLS correto
- **Dependências:** Sprint 2.1.4 (partners live)
- **Status:** PENDING

### Sprint 4.2.2 — Landing Page de Parceiro

- **Objetivo:** Página pública rastreável por parceiro com catálogo filtrado
- **Agente Recomendado:** Kimi
- **Tarefas:**
  1. Rota `/parceiro/:partner_slug`
  2. Carregar `partner_integrations` pelo slug
  3. Exibir catálogo filtrado por `allowed_route_ids`
  4. CTA WhatsApp com número do parceiro
  5. CTA "Reservar" com rastreamento de origin
  6. Cookie de sessão com partner_id (30 dias)
  7. Campo `origin_partner_id` em booking ao criar hold
- **Critérios de Aceite:** Landing funciona com slug de parceiro real | Reserva criada registra origin_partner_id | WhatsApp com número correto do parceiro
- **Dependências:** Sprint 4.2.1, Sprint 3.2.1
- **Status:** PENDING

---

# Wave 5 — Driver App

**Objetivo:** PWA do motorista funcional em apps/driver.

---

## Phase 5.1 — Driver App Architecture

### Sprint 5.1.1 — apps/driver Setup

- **Objetivo:** Criar novo app PWA para motorista dentro do monorepo
- **Agente Recomendado:** Codex CLI + Claude (ADR)
- **Tarefas:**
  1. Criar ADR-010: App do Motorista — arquitetura PWA
  2. Criar `apps/driver/` com estrutura React+Vite+PWA
  3. Vite PWA plugin (vite-plugin-pwa) para Service Worker
  4. Supabase client via packages/core
  5. packages/ui compartilhado
  6. Adicionar ao pnpm-workspace.yaml e turbo.json
  7. Configurar RLS role `driver` no banco
- **Critérios de Aceite:** `pnpm dev:driver` inicia app | build passa | typecheck passa
- **Dependências:** Wave 1 completa (auth/tenant)
- **Artefatos:** ADR-010, apps/driver estruturado
- **Status:** NEEDS_DECISION (DA-02)

### Sprint 5.1.2 — Driver Auth & Agenda

- **Objetivo:** Login do motorista funcional + agenda diária
- **Agente Recomendado:** Kimi
- **Tarefas:**
  1. Login OTP para motorista (role driver)
  2. Página home: agenda do dia (lista de viagens)
  3. Query: bookings assigned to driver_id, data de hoje
  4. Realtime update para novas viagens
- **Critérios de Aceite:** Motorista faz login | Vê suas viagens do dia | Atualização em tempo real
- **Dependências:** Sprint 5.1.1, Sprint 2.1.3
- **Status:** PENDING

### Sprint 5.1.3 — Trip Management & Check-in

- **Objetivo:** Detalhe da viagem, check-in, check-out, status
- **Agente Recomendado:** Kimi + Codex CLI
- **Tarefas:**
  1. TripDetailPage: passageiros, origem/destino, observações
  2. Ação de check-in → atualiza status booking para `in_progress`
  3. Ação de check-out → status `completed`
  4. Deep-link para Google Maps/Waze com destino
  5. Formulário de ocorrência (upload foto via Supabase Storage)
- **Critérios de Aceite:** Motorista executa viagem completa pelo app | Status sincroniza com admin em tempo real
- **Dependências:** Sprint 5.1.2
- **Status:** PENDING

### Sprint 5.1.4 — PWA Offline Cache

- **Objetivo:** Cache offline das viagens do dia para áreas sem sinal
- **Agente Recomendado:** Codex CLI
- **Tarefas:**
  1. Service Worker caching para dados das viagens do dia
  2. Indicador de status de conectividade
  3. Queue de ações offline (check-in/out) com sync quando voltar online
- **Critérios de Aceite:** App funciona offline para viagens cacheadas | Ações offline sincronizam ao reconectar
- **Dependências:** Sprint 5.1.3
- **Status:** PENDING

---

# Wave 6 — Payments Hardening, WhatsApp & Notifications

**Objetivo:** Pagamentos completos com refund e reconciliação. WhatsApp CTA configurável. Notificações transacionais.

---

## Phase 6.1 — Payments Hardening

### Sprint 6.1.1 — Refund & Reconciliation

- **Objetivo:** Edge Functions de refund e reconciliação. UI admin para refunds.
- **Agente Recomendado:** Codex CLI + Claude (review)
- **Tarefas:**
  1. Edge Function `refund-payment`
  2. Reconciliation job (Edge Function com cron trigger)
  3. UI admin: botão de refund em PaymentDetailDrawer
  4. Reconciliation view com discrepâncias
- **Critérios de Aceite:** Admin pode iniciar refund | Reconciliação detecta e reporta discrepâncias
- **Dependências:** Sprint 4.1.2
- **Status:** PENDING

---

## Phase 6.2 — WhatsApp Integration

### Sprint 6.2.1 — WhatsApp CTA Configurável

- **Objetivo:** CTA WhatsApp em site público e landing de parceiro, número configurável por tenant/parceiro
- **Agente Recomendado:** Kimi
- **Tarefas:**
  1. Campo `whatsapp_number` em settings do tenant
  2. Componente `<WhatsAppCTA route={route} tenant={tenant} partner={partner} />`
  3. Link wa.me com mensagem pré-formatada por template
  4. Registro de click em `whatsapp_interactions` (analytics simples)
- **Critérios de Aceite:** CTA abre WhatsApp com número e mensagem corretos | Click registrado no banco
- **Dependências:** Sprint 3.1.3, Sprint 4.2.2
- **Status:** PENDING

---

## Phase 6.3 — Notifications

### Sprint 6.3.1 — Email Transacional

- **Objetivo:** Emails de confirmação de reserva e notificações básicas
- **Agente Recomendado:** Codex CLI
- **Tarefas:**
  1. Configurar SMTP no Supabase (Resend ou similar)
  2. Edge Function `send-booking-confirmation-email`
  3. Template de email de confirmação
  4. Trigger: booking confirmado → email automático
- **Critérios de Aceite:** Hóspede recebe email de confirmação após pagamento aprovado
- **Dependências:** Sprint 4.1.2
- **Status:** PENDING

---

# Wave 7 — Analytics, Finance & Reporting

**Objetivo:** Dashboards com dados reais, relatórios exportáveis, métricas operacionais, CRM básico.

---

### Sprint 7.1.1 — Reports & Dashboard Live

- **Objetivo:** ReportsPage e Dashboard com dados reais do período
- **Agente Recomendado:** Kimi
- **Tarefas:** Todos os componentes de Reports conectados ao Supabase | KPIs do Dashboard atualizados em tempo real
- **Status:** PENDING

### Sprint 7.1.2 — Receivables & Financial Module Live

- **Objetivo:** Módulo financeiro live (receivables, reconciliation, faturas)
- **Agente Recomendado:** Kimi
- **Tarefas:** CRUD live para invoices, receivables | Reconciliation view com dados reais
- **Status:** PENDING

### Sprint 7.1.3 — Partner Commissions

- **Objetivo:** Cálculo e visualização de comissões de parceiros
- **Agente Recomendado:** Kimi + Codex CLI
- **Tarefas:** RPC de cálculo de comissão por período | Dashboard de comissões para admin | Relatório exportável
- **Status:** PENDING

### Sprint 7.1.4 — CRM / Leads (Básico)

- **Objetivo:** Registro e gestão de leads (WhatsApp + formulários)
- **Agente Recomendado:** Kimi
- **Tarefas:** Tabela `leads` no banco | UI de leads no admin | Conversão lead → reserva
- **Status:** PENDING

---

# Wave 8 — Hardening, QA & Production Readiness

**Objetivo:** Segurança reforçada, testes completos, observabilidade, performance, deploy de produção.

---

### Sprint 8.1.1 — Playwright E2E Suite

- **Objetivo:** Suite de testes E2E cobrindo fluxos críticos
- **Agente Recomendado:** Codex CLI
- **Tarefas:** E2E: booking flow | E2E: payment flow | E2E: admin operations | E2E: driver app | E2E: partner landing
- **Critérios de Aceite:** Todos os fluxos críticos cobertos, todos passando
- **Status:** PENDING

### Sprint 8.1.2 — Security Audit

- **Objetivo:** Auditoria de segurança completa do produto
- **Agente Recomendado:** Claude
- **Tarefas:** RLS penetration test | JWT audit | Secrets audit | Input validation audit | CORS audit | OWASP Top 10 review
- **Critérios de Aceite:** Zero P0 security findings | Relatório de auditoria gerado
- **Status:** PENDING

### Sprint 8.1.3 — Observability Setup

- **Objetivo:** Sentry + analytics integrados
- **Agente Recomendado:** Codex CLI
- **Tarefas:** Sentry em apps/web e apps/driver | GA4 ou Plausible no site público | Supabase logs configurados
- **Status:** PENDING

### Sprint 8.1.4 — Performance Optimization

- **Objetivo:** Lighthouse > 90, LCP < 2.5s
- **Agente Recomendado:** Codex CLI + Codex IDE
- **Tarefas:** Lazy loading, code splitting por rota, imagens otimizadas (WebP), fonte com display=swap, bundle size audit
- **Status:** PENDING

### Sprint 8.1.5 — Production Deploy

- **Objetivo:** Provisionar ambiente de produção completo
- **Agente Recomendado:** Gemini + Claude (review)
- **Tarefas:** Vercel project creation para cada app | Supabase produção provisionado | Env vars de produção | Domain setup | Backup configuration | Runbooks documentados
- **Critérios de Aceite:** Smoke tests passando em produção | Rollback validado em < 15 min
- **Status:** PENDING

---

# Wave 9 — Launch & Post-Launch

**Objetivo:** Go-live controlado, monitoramento, correções urgentes, roadmap pós-MVP definido.

---

### Sprint 9.1.1 — Go-Live Checklist

- **Objetivo:** Checklist de go-live executado e validado
- **Agente Recomendado:** ChatGPT + Alexandre
- **Tarefas:** Validar todos os critérios de produção | Smoke tests em produção | Comunicação de lançamento
- **Status:** PENDING

### Sprint 9.1.2 — Post-Launch Monitoring & Hotfixes

- **Objetivo:** Monitoramento nas primeiras 2 semanas pós-lançamento
- **Agente Recomendado:** DeepSeek + Codex CLI (hotfixes)
- **Tarefas:** Monitoramento Sentry diário | Triagem de bugs | Hotfixes priorizados por impacto
- **Status:** PENDING

### Sprint 9.1.3 — Roadmap Pós-MVP

- **Objetivo:** Definir próximas funcionalidades com base em feedback real
- **Agente Recomendado:** ChatGPT + Alexandre
- **Tarefas:** Coletar feedback | Priorizar backlog pós-MVP | Planejar Wave 10+
- **Status:** PENDING

---

## 15. Definition of Ready

Um sprint está **pronto para iniciar** quando:

- [ ] Objetivo claramente definido
- [ ] Escopo detalhado e aprovado por ChatGPT/Alexandre (se escopo novo)
- [ ] Entradas disponíveis (código, dados, dependências anteriores concluídas)
- [ ] Agente responsável designado
- [ ] Critérios de aceite escritos e mensuráveis
- [ ] Riscos identificados
- [ ] Dependências de sprints anteriores em status DONE ou CONFIRMED
- [ ] Sprint NÃO expande escopo sem ADR + aprovação

## 16. Definition of Done

Um sprint está **concluído** quando:

- [ ] Todos os deliverables produzidos
- [ ] `pnpm build` PASS (evidência: log de build)
- [ ] `pnpm lint` PASS (zero warnings — evidência: output de lint)
- [ ] `pnpm typecheck` PASS (zero errors — evidência: tsc output)
- [ ] Testes relevantes passando (evidence: test runner output)
- [ ] PR revisado e aprovado
- [ ] CI passando
- [ ] Documentação atualizada (se mudança de interface ou comportamento)
- [ ] Minimax audit completo (para sprints críticos)
- [ ] Nenhum P0/P1 bug aberto
- [ ] Sem violations de governança
- [ ] ORCHESTRATOR_CONTEXT.md atualizado

## 17. Critérios para MVP

O produto está em **MVP** quando:

1. Hóspede consegue navegar no site público, selecionar roteiro, ver disponibilidade e criar reserva (hold)
2. Hóspede consegue pagar via Mercado Pago sandbox e receber confirmação
3. Admin consegue ver a reserva no painel, assinar motorista e marcar conclusão
4. CTA de WhatsApp funciona em todas as páginas de roteiro
5. App do motorista permite login, ver agenda do dia e executar check-in/check-out
6. Auth/RBAC funcional: admin, operador e motorista têm permissões corretas
7. Multi-tenant isolado: sem cross-tenant data leak
8. Build clean, lint clean, typecheck clean
9. Deploy em staging funcional

**Waves mínimas para MVP:** 0, 1, 2 (parcial), 3, 4.1 (parcial), 5 (parcial)

## 18. Critérios para Produção

O produto está **pronto para produção** quando TODOS os seguintes são verdadeiros:

1. Todos os critérios de MVP atendidos com dados reais (não sandbox)
2. RLS penetration test sem leakagem (Claude security audit)
3. Playwright E2E cobrindo 100% dos fluxos críticos
4. Lighthouse > 90 em todas as apps públicas
5. Sentry ativo e alertas configurados
6. Zero P0/P1 bugs abertos
7. Backup e rollback validados (< 15 min)
8. Runbooks operacionais documentados
9. Environment variables de produção documentadas e seguras
10. Mercado Pago produção configurado e testado
11. SMTP configurado para emails transacionais
12. Wave 8 completa

## 19. Backlog Pós-MVP

| Feature | Justificativa | Fase |
|---------|--------------|------|
| IA para recomendações de roteiros | Personalização avançada | Wave 10 |
| Chat concierge em tempo real | FOUNDATION.md — Fase 3 | Wave 10 |
| Split payments / marketplace MP | EXECUTION-PLAN-V2 — Out of V1 | Wave 10 |
| Push notifications nativas (PWA) | Melhor UX mobile | Wave 10 |
| White-label custom domains | Multi-tenant avançado | Wave 11 |
| Onboarding automatizado de novos tenants | Scale | Wave 11 |
| PWA offline avançado (beyond viagens do dia) | Operação em campo | Wave 10 |
| App nativo do motorista (React Native) | SE PWA insuficiente | Wave 11 |
| Portal self-service do parceiro | Autonomia de parceiro | Wave 10 |
| Reviews / avaliações de hóspedes | Feedback loop | Wave 10 |
| Programa de fidelidade | Retenção | Wave 11 |
| Analytics avançado com BI | Inteligência operacional | Wave 11 |

## 20. Próximas Ações Imediatas

As **5 ações imediatas** que desbloqueiam execução:

| # | Ação | Responsável | Urgência | Bloqueio Resolvido |
|---|------|------------|---------|-------------------|
| 1 | Commitar docs/governance/ + docs/EXECUTION/ + .github/ | ✅ RESOLVIDO S0.1 — Kimi/Codex | CONCLUÍDO | B-01, R-07 |
| 2 | Remover `@stripe/react-stripe-js` e auditar `firebase` em apps/web | Codex CLI | ALTA | DT-01, DT-02, R-02 |
| 3 | Aprovar Sprint S3 (lint cleanup) — decisão de Alexandre/ChatGPT | Alexandre / ChatGPT | ALTA | B-02 |
| 4 | Decidir: apps/landing → apps/public OU novo apps/public | Alexandre | ALTA | DA-01 |
| 5 | Decidir: App do Motorista — PWA em apps/driver (recomendado) ou outra abordagem | Alexandre | MÉDIA | DA-02 |

**Próximos prompts recomendados:**

### Para DeepSeek V4 Flash (Orquestrador):

```
Bootstrap: Carregar docs/governance/DEEPSEEK.md, MASTER_PORTFOLIO.md, GOVERNANCE_STATE.md, ORCHESTRATOR_CONTEXT.md.

Após bootstrap, executar acceptance test (ORCHESTRATOR_ACCEPTANCE_TEST.md).

Se PASS: Criar Execution Package para Sprint 0.1.1:
- Agente: Gemini (commit governance docs)
- Agente: Codex CLI (remover Stripe, auditar firebase, instalar TanStack Query + Zustand + RHF + Zod em apps/web)
- Critérios: build + lint + typecheck PASS após mudanças
- Evidência requerida: git log + build output

Aguardar evidências antes de declarar Sprint 0.1.1 DONE.
```

### Para Codex CLI (Execução Técnica):

```
Repositório: aistudio-experience-connect-admin
Tarefa: Sprint 0.1.1 — Dependency Audit & Repair

1. Verificar se @stripe/react-stripe-js está em apps/web/package.json
2. Se sim: pnpm remove @stripe/react-stripe-js --filter @connect/web
3. Verificar se firebase está em apps/web/package.json e se há imports em apps/web/src/
4. Se sem uso: pnpm remove firebase --filter @connect/web
5. pnpm add @tanstack/react-query zustand react-hook-form zod --filter @connect/web
6. pnpm build && pnpm lint && pnpm typecheck
7. Reportar: build output, lint output, typecheck output com evidence lines

NÃO alterar lógica de negócio. NÃO alterar migrations. NÃO alterar arquivos de governança.
```

### Para ChatGPT (Orquestrador Estratégico):

```
Revisão do EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md.

Itens que precisam de decisão sua:
1. Aprovação do Sprint S3 (lint cleanup) — PENDING APPROVAL em GOVERNANCE_STATE.md
2. Validação das Decisões Arquiteturais DA-01 a DA-05 (apps/landing vs apps/public, PWA vs native, etc.)
3. Confirmação de que o Exec Plan deste documento está alinhado com a visão de produto
4. Autorização para DeepSeek iniciar execução das Waves 0 e 1

Forneça: GO / NO-GO para Sprint S3 | Decisões sobre DA-01 e DA-02 | Confirmação de alinhamento.
```

---

## 21. Auditoria Claude — Conclusão

### O repo tem governança suficiente para iniciar execução controlada?

**SIM, COM CONDIÇÕES.**

A governança é madura e funcional: DEEPSEEK.md v1.0 com 9 seções de hardening, ADR-008 aceito, CONNECT-READDY-STANDARD v1.1.0, QA-GATES, SESSION_BOOTSTRAP_REQUIREMENTS, ORCHESTRATOR_CONTEXT atualizado. O framework é sólido.

**Condição crítica:** Os docs de governança estão **untracked** (`git status` confirma). Esse é o primeiro blocker a resolver — sem commit, a governança existe apenas em memória de sessão, não no histórico do repo.

### Quais são os blockers reais?

| # | Blocker | Severidade |
|---|---------|-----------|
| B-01 | Docs de governança não commitados | ✅ RESOLVIDO |
| B-02 | Sprint S3 aguardando aprovação humana | ALTO |
| B-03 | firebase sem uso documentado em apps/web | ALTO |
| B-04 | @stripe/react-stripe-js instalado incorretamente | ALTO |
| B-05 | TanStack Query, Zustand, RHF, Zod ausentes em apps/web | CRÍTICO para live integration |
| B-06 | live data integration não iniciada | CRÍTICO para MVP |

### Quais decisões precisam do Alexandre?

1. **Aprovar Sprint S3** (lint cleanup) — GOVERNANCE_STATE mostra como pending
2. **DA-01:** apps/landing evolui para site público OU criamos apps/public separado?
3. **DA-02:** App do motorista é PWA (recomendado) ou React Native?
4. **DA-03:** Widget de parceiro: iframe, script embed ou landing page?
5. **DA-04:** Multi-idioma para MVP do site público?
6. **DA-05:** apps/admin e apps/landing — deprecar, manter ou evoluir?

### Quais sprints podem começar imediatamente?

- **Sprint 0.1.1** — Commit governance docs + fix critical deps (Gemini + Codex CLI)
- **Sprint 0.1.2** — Verificar update_updated_at_column + re-executar RLS tests (Codex CLI) — RESOLVIDO (OR1)

Esses dois sprints têm todas as entradas disponíveis e não requerem decisões de Alexandre.

### Quais sprints dependem de auditoria técnica do Codex CLI?

- Sprint 0.1.1 (deps audit + repair) — **NEEDS CODEX CLI**
- Sprint 0.1.2 (RLS + trigger verification) — **NEEDS CODEX CLI**
- Sprint 0.2.1 (lint S3, após aprovação) — **NEEDS KIMI ou CODEX CLI**
- Sprint 4.1.1 (create-payment-preference Edge Function) — **NEEDS CODEX CLI + CLAUDE REVIEW**
- Sprint 8.1.2 (security audit) — **NEEDS CLAUDE**

### Onde o DeepSeek V4 Flash deve atuar primeiro?

1. **Sessão 1:** Bootstrap (carregar 4 docs obrigatórios) + acceptance test (ORCHESTRATOR_ACCEPTANCE_TEST.md)
2. **Sessão 1:** Criar Execution Package para Sprint 0.1.1 (Gemini + Codex CLI)
3. **Sessão 2 (após evidência de Sprint 0.1.1):** Criar Execution Package para Sprint 0.1.2
4. **Sessão 3:** Escalar decisões DA-01/DA-02 para ChatGPT/Alexandre para liberar Wave 3/5
5. **Ongoing:** Coordenar Wave 1 (live data integration) após Wave 0 completa

### Há risco de desalinhamento com a governança existente?

**BAIXO**, com uma observação importante:

O CONNECT_EXECUTION_GOVERNANCE_REFERENCE aponta para `aistudio-portal-connect-admin` como fonte canônica de governança. Este Exec Plan cria um plano **específico** para o Experience Connect, o que é complementar, não conflitante. Recomendo que o DeepSeek registre este documento em ORCHESTRATOR_CONTEXT.md como referência ativa.

**O único risco real** de desalinhamento seria se as decisões arquiteturais deste plano (ex: criar apps/driver, apps/public) forem executadas sem o ADR adequado. O processo está mapeado — cada decisão tem seu sprint de ADR associado.

### O plano está pronto para execução multi-agente?

**SIM.** O Exec Plan tem:
- 9 Waves com phases e sprints definidos
- Agente recomendado por sprint
- Critérios de aceite mensuráveis
- Dependências mapeadas
- Riscos documentados
- Artefatos esperados
- Prompts recomendados para DeepSeek, Codex CLI e ChatGPT

**Condição para GO:** ~~Resolver B-01 (commit governance docs)~~ ✅ RESOLVIDO — e obter decisão de Alexandre sobre Sprint S3 (B-02).

---

*Documento gerado por Claude (Premium Architecture & Governance Auditor)*
*Data de auditoria: 2026-06-11*
*Baseado em estado real do repositório: branch main, commit 080c4c7*
*Versão do produto auditado: v0.4.0-frontend-foundation-stable (2026-05-17)*
