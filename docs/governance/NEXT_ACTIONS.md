# NEXT_ACTIONS.md — Experience Connect

**Version:** 1.2  
**Generated:** 2026-06-15  
**Active Plan:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md`

---

## Priority Actions

### Action 1 — Executar Onda C: Consolidação Técnica
**Priority:** P0 — EXECUTION  
**Owner:** Kimi + Codex  
**Descrição:** Verificar gates (typecheck/lint/build), Playwright E2E, inventory de mocks, cobertura de hooks, RLS baseline (Supabase Cloud), operational risks update, remover apps/admin.
**Dependências:** Onda A concluída, Onda B aprovada, Claude audit
**Repo:** `aistudio-experience-connect-admin`
**Doc:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` — Seção 4

---

### Action 2 — Claude Audit: Consolidation Exec Plan V1
**Priority:** P0 — AUDIT  
**Owner:** Claude  
**Descrição:** Revisar o Consolidation Exec Plan V1 quanto a segurança, arquitetura, RLS/tenant isolation e riscos operacionais. Emitir relatório com findings classificados por severidade.
**Dependências:** Nenhuma
**Repo:** `aistudio-experience-connect-admin`
**Doc:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` — Seção 11

---

### Action 3 — Implementar Driver App (apps/driver)
**Priority:** P1 — PRODUCT  
**Owner:** Kimi + Codex  
**Descrição:** Criar PWA mobile-friendly para motorista responsável pelo grupo. 7 sprints: setup (D1), auth (D2), agenda (D3), trip detail (D4), navegação + ocorrências (D5), offline (D6), testes (D7).
**Dependências:** Onda C concluída
**Repo:** `aistudio-experience-connect-admin`
**Doc:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md` — Seção 5

---

### Action 4 — Minimax Audit: Pós-Onda C
**Priority:** P1 — VALIDATION  
**Owner:** Minimax  
**Descrição:** Auditoria independente de validação técnica após conclusão da Onda C.
**Dependências:** Action 1 (Onda C concluída)
**Repo:** `aistudio-experience-connect-admin`

---

### Action 5 — Commit e Versionamento
**Priority:** P2 — GOVERNANCE  
**Owner:** Gemini (Git & Governance)  
**Descrição:** Commitar todos os arquivos atualizados na Onda A (EXEC_PLAN_STATUS.md, ORCHESTRATOR_CONTEXT.md, NEXT_ACTIONS.md, CURRENT_BLOCKERS.md, GOVERNANCE_STATE.md) e o novo CONSOLIDATION_EXEC_PLAN_V1.md. Seguir conventional commits em português.
**Dependências:** Onda A concluída
**Repo:** `aistudio-experience-connect-admin`

---

## Completed Actions

| # | Action | Completed |
|---|--------|-----------|
| 1 | Approve Sprint S3 | ✅ 2026-06-11 |
| 2 | Commit governance | ✅ 2026-06-11 |
| 3 | Execute Sprint S3 | ✅ 2026-06-11 |
| 4 | Resolve governance conflict (REFERENCE mantido como ponteiro benigno) | ✅ 2026-06-15 |
| 5 | Resolve external deps | ✅ 2026-06-11 |
| 6 | Fase 1 Core (parcialmente concluído via S2.1.x + S3.1.x) | ✅ 2026-06-12 |
| 7 | R3: DB RPC Seat-Release Duplication | ✅ 2026-06-12 |

---

## Summary Matrix

| # | Action | Priority | Complexity | Dependencies | Status |
|---|--------|----------|------------|--------------|--------|
| 1 | Onda C — Consolidação Técnica | P0 | M | Onda B + Claude audit | PENDING |
| 2 | Claude Audit — Exec Plan V1 | P0 | S | Nenhuma | PENDING |
| 3 | Driver App PWA | P1 | L | Onda C concluída | PENDING |
| 4 | Minimax Audit — Pós-Onda C | P1 | S | Action 1 | PENDING |
| 5 | Commit e Versionamento | P2 | S | Onda A concluída | PENDING |
