# MASTER_PORTFOLIO.md

**Version:** 1.1  
**Status:** ACTIVE  
**Updated:** 2026-06-12  

---

## Active Products & Repositories

| # | Product | Short | Repository Path | Phase | Sprint | Status |
|---|---------|-------|-----------------|-------|--------|--------|
| 1 | Connect Governance | gov | `00-governance/connect-governance` | 0 | — | baseline |
| 2 | Connect Engineering | eng | `01-engineering/connect-engineering` | 0 | — | baseline |
| 3 | Agency AI System | ai-agency | `02-ai-workspace/agency-ai-system` | 0 | — | baseline |
| 4 | AI Workspace Ecosystem | ai-eco | `02-ai-workspace/workspace-ai-ecosystem` | 0 | — | baseline |
| 5 | Experience Connect Admin | ec-admin | `03-products/experience-connect/aistudio-experience-connect-admin` | 1 | 1.1.2 | active |
| 6 | Host Connect Admin | hc-admin | `03-products/host-connect/aistudio-host-connect-admin` | 1 | pending | ready |
| 7 | MD Connect Admin | md-admin | `03-products/md-connect/aistudio-md-connect-admin` | 1 | pending | ready |
| 8 | MD Connect App | md-app | `03-products/md-connect/aistudio-md-connect-app` | 1 | pending | ready |
| 9 | Portal Connect Admin | pc-admin | `03-products/portal-connect/aistudio-portal-connect-admin` | 1 | S0.2 done | active |
| 10 | Portal Urubici PC | pu-pc | `03-products/portal-connect/aistudio-portal-urubici-pc` | 1 | — | dirty (14 files) |
| 11 | Reserve Connect Admin | rc-admin | `03-products/reserve-connect/aistudio-reserve-connect-admin` | 1 | pending | ready |
| 12 | Reserve Connect PC | rc-pc | `03-products/reserve-connect/aistudio-reserve-connect-pc` | 1 | pending | ready |
| 13 | Wine Connect Admin | wc-admin | `03-products/wine-connect/aistudio-wine-connect-admin` | 1 | pending | ready |
| 14 | Araujo Innovation Lab | lab-araujo | `04-labs/araujo-innovation-lab` | 0 | — | baseline |
| 15 | Connect Scraper | scraper | `05-infra/connect-scraper` | 0 | — | baseline |

---

## Dependency Graph

```
05-infra/scraper ─┬─> 03-products/* (data ingestion)
01-engineering ───┤
02-ai-workspace ──┤
00-governance ────┘
```

---

## Active Mission Registry

| Mission | Owner | Target Repos | Status |
|---------|-------|-------------|--------|
| Foundation Repairs | Kimi / DeepSeek | pc-admin | S0.2 COMPLETED |
| Lint Cleanup & Type Hardening | Kimi | ec-admin | S3 COMPLETED |
| Tenant Resolution & Role Guards | Kimi | ec-admin | S1.1.1 COMPLETED |
| OTP Login & Invite Flow | Kimi | ec-admin | S1.1.2 COMPLETED |
| AuthProvider & Supabase Unification | Kimi | ec-admin | S1.2 COMPLETED |
| Tenant Context Hardening | TBD | pc-admin | SPRINT A1 ACTIVE |
| Host Production Readiness | TBD | hc-admin | committed |
| Reserve Stripe Activation | TBD | rc-admin | committed |

---

## Governance Coverage

All 15 repositories have `AGENTS.md` or equivalent governance reference.
