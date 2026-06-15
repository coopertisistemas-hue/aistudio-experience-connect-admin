# MASTER STATUS BOARD — Experience Connect Admin

**Versao:** 1.0  
**Data:** 2026-06-15  
**Sprint atual:** Consolidation Exec Plan V1 (Onda A/B/C + Driver D1-D4)  
**Auditoria Premium:** Claude (fechamento de sprint)  

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | COMPLETO — gates passaram, commit realizado |
| 🔄 | EM PROGRESSO — parcialmente implementado |
| ⬜ | PENDENTE — nao iniciado |
| ⚠️ | BLOQUEADO — depende de fator externo |
| ❌ | CANCELADO — nao se aplica mais |

---

## Wave 0 — Governance, Inventory & Baseline

**Objetivo:** Baseline solido, debitos criticos corrigidos.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 0.1.1 | Commit Governance Docs & Fix Critical Deps | Gemini + Codex | ✅ COMPLETO | — |
| 0.1.2 | Verify update_updated_at_column & RLS Baseline | Codex | ✅ COMPLETO | RLS verificado via REST API — bookings/tenants/users bloqueados para anon
| 0.2.1 | Lint S3 Cleanup (Lint & Type Hardening) | Kimi | ✅ COMPLETO | — |
| S0.1 | Governance Inventory Normalization | Claude / Kimi | ✅ COMPLETO | — |
| S0.2 | Foundation Repairs | Kimi | ✅ COMPLETO | — |

### Pendências Wave 0

Nenhuma — todos os sprints completos e verificados.

---

## Wave 1 — Core Platform Stabilization

**Objetivo:** Auth multi-tenant, rotas protegidas, live data foundation.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 1.1.1 | Tenant Resolution & Role Guards | Kimi | ✅ COMPLETO | Commit `a8de7bb` |
| 1.1.2 | OTP Login & Invite Flow | Codex | ✅ COMPLETO | Commit `91e0120` |
| 1.2.1 | React Query Setup & Data Layer | Kimi | ✅ COMPLETO | Commit `481dafa`, hooks + servicos 100% live |

### Pendências Wave 1

Nenhuma — todos os sprints completos e commitados.

---

## Wave 2 — Admin Business Modules

**Objetivo:** Todos os modulos admin conectados ao backend real.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 2.1.1 | Bookings & Reservations Live | Kimi + Codex | ✅ COMPLETO | commit via S2.1.x |
| 2.1.2 | Routes, Vehicles, Drivers Live | Kimi | ✅ COMPLETO | Commit `e39fa4e` |
| 2.1.3 | Agenda VAN Live | Kimi + Codex | ✅ COMPLETO | Commit `ccdb8e1` |
| 2.1.4 | Customers, Partners, Categories Live | Kimi | ✅ COMPLETO | Commit `43be7dc` |
| 2.1.5 | Settings & User Management Live | Kimi | ✅ COMPLETO | Commit `1dd3033` |

### Pendências Wave 2

| # | Item | Bloqueio |
|---|------|----------|
| 1 | Modulo Search ainda consome 7 mocks (depende de todos os outros modulos live primeiro) | Bloqueio em cadeia |

---

## Wave 3 — Public Site & Booking Funnel

**Objetivo:** Site publico funcional com catalogo, SEO e booking funnel.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 3.1.1 | Decisao de Arquitetura do Site Publico | Claude | ✅ COMPLETO | DA-01 resolvido — landing mantido separado |
| 3.1.2 | Site Publico: Shell, Catalogo, SEO | Kimi + Codex | ✅ COMPLETO | Commit `c2ed14b` |
| 3.1.3 | Pagina Individual de Roteiro | Kimi + Codex | ✅ COMPLETO | Commit `ed9db78` |
| 3.1.4 | Landing Reserva Flow | Kimi | ✅ COMPLETO | Commit `dcdc4d4` |
| 3.1.5 | Formulario de Contato | Kimi | ✅ COMPLETO | Commit `2e181b8` |
| 3.2.1 | Guest Booking Flow (Fluxo A — Online) | Kimi + Codex + Claude | 🔄 EM PROGRESSO | Booking wizard implementado; MP checkout pendente (Wave 4) |

### Pendências Wave 3

| # | Item | Bloqueio |
|---|------|----------|
| 1 | MP checkout real no booking flow | Depende de Wave 4 (MP SDK + credenciais) |

---

## Wave 4 — Partner/Client Site Integration & Payments

**Objetivo:** Pagamentos Mercado Pago completos + landing de parceiro.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 4.1.1 | create-payment-preference Edge Function | Codex + Claude | ✅ COMPLETO | Edge Function criada (`supabase/functions/create-payment-preference/index.ts`) |
| 4.1.2 | MP SDK Frontend & Checkout UI | Kimi | 🔄 EM PROGRESSO | create-payment-preference existe; integracao SDK frontend pendente |
| 4.2.1 | partner_integrations Table & Config | Codex + Claude | ⬜ PENDENTE | — |
| 4.2.2 | Landing Page de Parceiro | Kimi | ⬜ PENDENTE | Depende de 4.2.1 + 3.2.1 |

### Pendências Wave 4

| # | Item | Bloqueio |
|---|------|----------|
| 1 | MP SDK integracao frontend | Falta `@mercadopago/sdk-js` instalacao + config |
| 2 | MP sandbox E2E test | Falta credenciais MP sandbox |
| 3 | partner_integrations migration + UI | Nao iniciado |

---

## Wave 5 — Driver App

**Objetivo:** PWA do motorista funcional em apps/driver.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 5.1.1 | apps/driver Setup (PWA) | Codex | ✅ COMPLETO | Commit `c168c5b` — D1: Vite+PWA, 421KB build |
| 5.1.2 | Driver Auth & Agenda | Kimi | ✅ COMPLETO | D2/D3: Login OTP + Agenda diaria |
| 5.1.3 | Trip Management & Check-in | Kimi + Codex | ✅ COMPLETO | D4: check-in/out, passageiros, Google Maps |
| 5.1.4 | PWA Offline Cache | Codex | ✅ COMPLETO | useOfflineSync hook implementado (D6) |
| D5 | IncidentForm | Codex | ✅ COMPLETO | Registro de ocorrencia + upload foto Storage |
| D6 | Offline Sync Queue | Codex | ✅ COMPLETO | Hook useOfflineSync com localStorage queue |
| D7 | Playwright E2E Driver | Kimi | ✅ COMPLETO | 5 testes smoke (login, auth guard, 404, estrutura) |

### Pendências Wave 5

| # | Sprint | Descricao |
|---|--------|-----------|
| 1 | D5 | IncidentForm (registro de ocorrencia + upload foto Supabase Storage) |
| 2 | D6 | PWA offline sync queue (acoes offline → replay ao reconectar) |
| 3 | D7 | Playwright E2E tests para fluxo do motorista |

---

## Wave 6 — Payments Hardening, WhatsApp & Notifications

**Objetivo:** Refund, reconciliacao, WhatsApp CTA, emails transacionais.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 6.1.1 | Refund & Reconciliation | Codex + Claude | ⬜ PENDENTE | Depende de Wave 4 |
| 6.2.1 | WhatsApp CTA Configuravel | Kimi | ⬜ PENDENTE | Depende de Wave 3 + 4 |
| 6.3.1 | Email Transacional | Codex | ⬜ PENDENTE | Depende de Wave 4 |

---

## Wave 7 — Analytics, Finance & Reporting

**Objetivo:** Dashboards com dados reais, relatorios exportaveis.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 7.1.1 | Reports & Dashboard Live | Kimi | ⬜ PENDENTE | — |
| 7.1.2 | Receivables & Financial Module Live | Kimi | ⬜ PENDENTE | — |
| 7.1.3 | Partner Commissions | Kimi + Codex | ⬜ PENDENTE | — |
| 7.1.4 | CRM / Leads (Basico) | Kimi | ⬜ PENDENTE | — |

---

## Wave 8 — Hardening, QA & Production Readiness

**Objetivo:** Seguranca, testes completos, observabilidade, deploy.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 8.1.1 | Playwright E2E Suite Completa | Codex | 🔄 EM PROGRESSO | 21 specs existentes; faltam fluxos driver + payments |
| 8.1.2 | Security Audit | Claude | ⬜ PENDENTE | — |
| 8.1.3 | Observability Setup (Sentry) | Codex | ⬜ PENDENTE | — |
| 8.1.4 | Performance Optimization | Codex | ⬜ PENDENTE | — |
| 8.1.5 | Production Deploy | Gemini + Claude | ⬜ PENDENTE | Credenciais Vercel + Supabase prod |

---

## Wave 9 — Launch & Post-Launch

**Objetivo:** Go-live controlado, monitoramento, roadmap pos-MVP.

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| 9.1.1 | Go-Live Checklist | ChatGPT + Alexandre | ⬜ PENDENTE | — |
| 9.1.2 | Post-Launch Monitoring & Hotfixes | DeepSeek + Codex | ⬜ PENDENTE | — |
| 9.1.3 | Roadmap Pos-MVP | ChatGPT + Alexandre | ⬜ PENDENTE | — |

---

## Consolidation Exec Plan (Onda A/B/C)

| Sprint | Descricao | Agente | Status | Pendencia |
|--------|-----------|--------|--------|-----------|
| Onda A | Saneamento de Governanca (5 docs tracking) | DeepSeek | ✅ COMPLETO | Commit `fa2a280` |
| Onda B | Decisoes Arquiteturais (DA-01/02/05) | DeepSeek + Alexandre | ✅ COMPLETO | 3 decisoes aprovadas |
| Onda C (C1) | Gates: typecheck + lint + build | Kimi | ✅ COMPLETO | 0 errors |
| Onda C (C2) | Playwright E2E | Kimi | ✅ COMPLETO | 21/21 passando |
| Onda C (C3) | Mock Inventory | DeepSeek | ✅ COMPLETO | MOCK_INVENTORY.md |
| Onda C (C4) | Hooks Coverage | DeepSeek | ✅ COMPLETO | HOOKS_COVERAGE.md |
| Onda C (C5) | RLS Baseline (Supabase Cloud) | Codex | ✅ COMPLETO | Bookings/Tenants/Users bloqueados — RLS ativo |
| Onda C (C6) | Operational Risks Update | DeepSeek | ✅ COMPLETO | R1/R5 resolved, R2-R4 tracking |
| Onda C (C7) | Remover apps/admin | Kimi | ✅ COMPLETO | 13 arquivos removidos |
| Premium Audit | Codex re-audit consolidado | Codex | 🔄 PENDENTE | — |

---

## Resumo por Wave

| Wave | Sprints | Completos | Em Progresso | Pendentes | Bloqueados |
|------|---------|-----------|-------------|-----------|------------|
| Wave 0 | 5 | 4 | 0 | 0 | 1 |
| Wave 1 | 3 | 3 | 0 | 0 | 0 |
| Wave 2 | 5+5 | 6 | 0 | 0 | 0 |
| Wave 3 | 6 | 5 | 1 | 0 | 0 |
| Wave 4 | 4 | 1 | 1 | 2 | 0 |
| Wave 5 | 4+3 | 6 | 0 | 0 | 0 |
| Wave 6 | 3 | 0 | 0 | 3 | 0 |
| Wave 7 | 4 | 0 | 0 | 4 | 0 |
| Wave 8 | 5 | 0 | 1 | 4 | 0 |
| Wave 9 | 3 | 0 | 0 | 3 | 0 |
| Onda A/B/C | 7 | 6 | 0 | 0 | 1 |
| **TOTAL** | **62** | **41** | **1** | **18** | **2** |

---

## Percentual por Fase

| Fase | Progresso | Status |
|------|-----------|--------|
| Fase 0 — Foundation | 100% (4/5, 1 bloqueado) | ✅ |
| Fase 1 — Core (Wave 0-1-2) | ~92% (12/13, 1 bloqueado) | 🟢 |
| Fase 2 — Frontend (Wave 3-4-5) | ~67% (9/14, 2 em progresso) | 🟡 |
| Fase 3 — Scale (Wave 6-7-8-9) | ~6% (1/15, 1 em progresso) | ⚪ |

---

## Top Bloqueios

| # | Bloqueio | Impacto | Ondas afetadas |
|---|----------|---------|----------------|
| 1 | Credenciais Supabase Cloud (URL + ANON_KEY) | ALTO | Wave 0 (0.1.2), Onda C (C5), Wave 8 (8.1.5) |
| 2 | Credenciais Mercado Pago sandbox | MEDIO | Wave 4 (4.1.1, 4.1.2), Wave 3 (3.2.1) |
| 3 | Credenciais Vercel deploy | MEDIO | Wave 8 (8.1.5) |

---

## Top Acoes Prioritarias

| # | Acao | Dono | Dependencia |
|---|------|------|-------------|
| 1 | Solicitar credenciais Supabase Cloud | Alexandre | Nenhuma |
| 2 | Codex Premium Audit (re-audit consolidado) | Codex | Nenhuma — iniciar agora |
| 3 | Driver D5: IncidentForm + Storage | Codex | Nenhuma |
| 4 | Driver D6: PWA offline sync queue | Codex | D5 |
| 5 | Criar hooks para modulos mock (Transfers P0) | Kimi | Nenhuma |
| 6 | MP SDK frontend checkout (4.1.2) | Kimi | Credenciais MP |

---

*Fim do MASTER STATUS BOARD — atualizado em 2026-06-15.*
