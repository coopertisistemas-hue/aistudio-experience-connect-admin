# EXEC_PLAN_STATUS.md — Experience Connect

**Version:** 1.2  
**Updated:** 2026-06-15  
**Product:** Dom Pietro Experience Connect  
**Active Plan:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md`

---

## Executive Summary

Experience Connect está em **Fase 1 → Fase 2** (transição). Backend (schema V2, RLS, Edge Functions) completo. Frontend v0.6.x estável com admin live data (S2.1.x) e landing page pública (S3.1.x) concluídos. Plano ativo: **Consolidation & Continuity** (Onda A/B/C + Driver App). Próximo sprint: Onda C — Consolidação Técnica.

---

## Sprint History

| Sprint | Status | Key Deliverables | Date | Commit |
|--------|--------|------------------|------|--------|
| S3.1.5 — EXEC_PLAN_STATUS Update | ✅ COMPLETE | EXEC_PLAN_STATUS.md updated with Wave 3 sprints | 2026-06-12 | `2e181b8` |
| S3.1.4 — Landing Reserva Flow | ✅ COMPLETE | Booking flow no landing implementado | 2026-06-12 | `dcdc4d4` |
| S3.1.3 — Landing Roteiro Detail | ✅ COMPLETE | Página de detalhe de roteiro com disponibilidade | 2026-06-12 | `ed9db78` |
| S3.1.2 — Landing Shell + Catálogo | ✅ COMPLETE | Site público com catálogo e SEO | 2026-06-12 | `c2ed14b` |
| S3.1.1 — Claude Audit Wave 3 Fixes | ✅ COMPLETE | 3 blockers corrigidos | 2026-06-12 | `438626e` |
| S2.1.5 — Settings & User Mgmt Live | ✅ COMPLETE | Settings e user management migrados para dados live | 2026-06-12 | `1dd3033` |
| S2.1.4 — Customers, Partners, Categories Live | ✅ COMPLETE | customers, partners e categories com dados live | 2026-06-12 | `43be7dc` |
| S2.1.3 — Agenda VAN Live | ✅ COMPLETE | Agenda VAN migrada para dados live | 2026-06-12 | `ccdb8e1` |
| S2.1.2 — Routes, Vehicles, Drivers Live | ✅ COMPLETE | Rotas, veículos e motoristas com dados live | 2026-06-12 | `e39fa4e` |
| S2.1.1 — Bookings & Reservations Live | ✅ COMPLETE | Módulo de reservas com backend real | 2026-06-12 | (via S2.1.x) |
| S0.2 — Foundation Repairs | ✅ COMPLETE | Migration hardening, governance docs committed | 2026-06-04 | `080c4c7` |
| S0.1 — Governance Inventory | ✅ COMPLETE | Inventory report, blocker B-01 resolved | 2026-06-11 | `8327fb3` |
| S3 — Lint Cleanup & Type Hardening | ✅ COMPLETE | Lint/typecheck zerados, escopo realinhado | 2026-06-11 | `c736976` |
| S1.1.1 — Tenant Resolution & Role Guards | ✅ COMPLETE | TenantProvider, role-based guards, rotas protegidas | 2026-06-11 | `a8de7bb` |
| S1.1.2 — OTP Login & Invite Flow | ✅ COMPLETE | OTP login flow, invite flow | 2026-06-11 | `91e0120` |
| S1.2 — AuthProvider & Supabase Unification | ✅ COMPLETE | AuthProvider canônico, Supabase client unification | 2026-06-04 | `481dafa` |
| E2E1 — Playwright Setup | ✅ COMPLETE | 9 smoke tests configurados | 2026-06-12 | `db7b731` |
| R3 — DB RPC Seat-Release Dedup | ✅ COMPLETE | release_slot_capacity extraída, 3 funções refatoradas | 2026-06-12 | `ea514c5` |
| OR1 — Operational Risk Fixes | ✅ COMPLETE | R1/R4/R5 resolvidos | 2026-06-12 | `56dea14` |

---

## Phase Progress

| Phase | Progress | Status |
|-------|----------|--------|
| Fase 0 — Foundation (Weeks 1-2) | 100% | ✅ |
| Fase 1 — Core (Weeks 3-6) | ~90% | 🟡 |
| Fase 2 — Frontend Foundation (v0.4.0 → v0.6.x) | ~65% | 🟡 |
| Fase 3 — Scale (Weeks 11-14) | 0% | ⚪ |

---

## Active Exec Plan

| Document | Status |
|----------|--------|
| `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` | ACTIVE — Onda A concluída, Onda B aprovada, Onda C pendente |

---

## Blockers

| # | Blocker | Owner | Impact | Status |
|---|---------|-------|--------|--------|
| — | Nenhum blocker ativo | — | — | Clear |

---

## Key Artifact Paths

| Artifact | Path |
|----------|------|
| Consolidation Exec Plan | `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` |
| Governance Inventory | `docs/EXECUTION/GOVERNANCE_INVENTORY_REPORT.md` |
| Full Exec Plan | `docs/EXECUTION/EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md` |
| Architecture V2 | `docs/architecture/ARCHITECTURE-V2.md` |
| Governance State | `docs/governance/GOVERNANCE_STATE.md` |
| Orchestrator Context | `docs/governance/ORCHESTRATOR_CONTEXT.md` |
