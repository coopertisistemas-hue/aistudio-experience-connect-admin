# GOVERNANCE_STATE.md

**Version:** 1.1  
**Status:** ACTIVE  
**Updated:** 2026-06-12  

---

## Active ADRs

| ADR | Status | Scope |
|-----|--------|-------|
| ADR-008 — DeepSeek Orchestrator Constitution | **ACCEPTED** | All DeepSeek-based orchestrators |

---

## Pending Approvals

| Item | Requested By | Approver | Status |
|------|-------------|----------|--------|
| Sprint S3 — Lint Cleanup & Type Hardening | DeepSeek (Orchestrator) | ✅ RESOLVIDO — lint/typecheck já zerados | COMPLETED |
| Sprint S0.1 — Governance Inventory Normalization | Claude | Kimi / DeepSeek | ✅ COMPLETED (2026-06-11) |

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
- SESSION_BOOTSTRAP_REQUIREMENTS.md — v1.0 (2026-06-05)
- ORCHESTRATOR_ACCEPTANCE_TEST.md — v1.0 (2026-06-05)

---

## Agent Certification Status

| Agent | Role | Certified | Notes |
|-------|------|-----------|-------|
| DeepSeek | Orchestrator | ✅ YES | Passed acceptance test, approved by ChatGPT/Alexandre |
| Kimi | Factory Floor Lead / Execution | ✅ YES | Sprint S0.2 delivered |
| Claude | Security & Architecture Auditor | ✅ YES | |
| Gemini | Git & Governance Auditor | ✅ YES | |
| Codex | Execution | ✅ YES | |
| Minimax | Independent Validator | ✅ YES | Audit layer active |

---

## Operational Risks (from Transition Report)

1. touch_updated_at() validation — Owner: Codex/Claude — Tracking: Sprint 1.2+
2. Orphaned edge functions — Owner: Kimi/Gemini — Tracking: Sprint 0.2/Phase 1 cleanup
3. Duplicated edge functions — Owner: Codex/Minimax — Tracking: Phase 7, Sprint 7.1
4. Infrastructure visibility validation — Owner: Gemini/ChatGPT — Tracking: Sprint 0.2+
5. Security migration execution — Owner: Claude/Codex — Tracking: Phase 1, Sprints 1.1–1.2
