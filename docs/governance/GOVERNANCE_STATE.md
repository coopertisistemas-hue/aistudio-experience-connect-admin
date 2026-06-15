# GOVERNANCE_STATE.md

**Version:** 1.2  
**Status:** ACTIVE  
**Updated:** 2026-06-15  

---

## Active ADRs

| ADR | Status | Scope |
|-----|--------|-------|
| ADR-008 — DeepSeek Orchestrator Constitution | **ACCEPTED** | All DeepSeek-based orchestrators |
| Consolidation Exec Plan V1 | **ACTIVE** | `aistudio-experience-connect-admin` — Onda A concluída, Onda B aprovada |

---

## Pending Approvals

| Item | Requested By | Approver | Status |
|------|-------------|----------|--------|
| — | — | — | Nenhuma aprovação pendente |

---

## Known Exceptions / Waivers

| Exception | Rationale | Expires |
|-----------|-----------|---------|
| MASTER_PORTFOLIO.md stub filled retroactively | Bootstrap dependency unblock | Permanent |
| GOVERNANCE_STATE.md stub filled retroactively | Bootstrap dependency unblock | Permanent |
| ORCHESTRATOR_CONTEXT.md stub filled retroactively | Bootstrap dependency unblock | Permanent |

---

## Governance Version References

- DEEPSEEK.md — v1.0 (2026-06-05)
- ADR-008 — v1.0 (2026-06-05)
- CONNECT_EXECUTION_GOVERNANCE_V1.md — v1.0 (2026-06-05, updated 2026-06-06)
- CONSOLIDATION_EXEC_PLAN_V1.md — v1.0 (2026-06-15)
- SESSION_BOOTSTRAP_REQUIREMENTS.md — v1.0 (2026-06-05)
- EXEC_PLAN_STATUS.md — v1.2 (2026-06-15)
- ORCHESTRATOR_CONTEXT.md — v1.2 (2026-06-15)
- NEXT_ACTIONS.md — v1.2 (2026-06-15)
- CURRENT_BLOCKERS.md — v1.1 (2026-06-15)
- ORCHESTRATOR_ACCEPTANCE_TEST.md — v1.0 (2026-06-05)

---

## Agent Certification Status

| Agent | Role | Certified | Notes |
|-------|------|-----------|-------|
| DeepSeek | Orchestrator | ✅ YES | Onda A concluída; Onda B aprovada |
| Kimi | Factory Floor Lead / Execution | ✅ YES | Atribuído: Onda C + Driver D2-D4, D7 |
| Claude | Security & Architecture Auditor | ✅ YES | Audit request: Consolidation Exec Plan V1 |
| Gemini | Git & Governance Auditor | ✅ YES | Atribuído: commit e versionamento |
| Codex | Execution + Premium Auditor | ✅ YES | Atribuído: auditoria premium Onda A/B/C + Driver D1-D4 |
| Minimax | Independent Validator | ✅ YES | Suporte cross-audit |

---

## Active Exec Plan

| Document | Status | Progress |
|----------|--------|----------|
| `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` | IN PROGRESS | Onda A ✅ / Onda B ✅ / Onda C ⬜ / Driver ⬜ |

---

## Operational Risks

| # | Risk | Status | Owner | Evidence |
|---|------|--------|-------|----------|
| R1 | update_updated_at_column() validation | ✅ RESOLVED | Codex/Claude | Commit `56dea14` (OR1) |
| R2 | Orphaned edge functions | 🔍 VERIFY | Kimi/Gemini | Pendente — Onda C |
| R3 | Duplicated edge functions | 🔍 VERIFY | Codex | Pendente — Onda C |
| R4 | Infrastructure visibility validation | ⏳ TRACKING | Gemini/ChatGPT | Validar Vercel + Supabase configs |
| R5 | Security migration execution | ✅ RESOLVED | Claude/Codex | Commits `56dea14`, `1dd3033` |
