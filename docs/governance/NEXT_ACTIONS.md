# NEXT_ACTIONS.md — Experience Connect

**Version:** 1.0  
**Generated:** 2026-06-11  

---

## Priority Actions

### Action 1 — Obter Aprovação para Sprint S3
**Priority:** P0 — BLOCKER  
**Owner:** Alexandre/ChatGPT  
**Descrição:** Sprint S3 (Lint Cleanup & Type Hardening) aguarda aprovação humana para iniciar.
**Dependências:** Nenhuma
**Repo:** `aistudio-experience-connect-admin`

---

### Action 2 — Commit Governança Pendente
**Priority:** P0 — DOCUMENTATION  
**Owner:** Kimi  
**Descrição:** Commitar AGENTS.md, AI_RULES.md, EXEC_PLAN_STATUS.md, NEXT_ACTIONS.md e diretórios runtime/, blockers/, handoffs/, decisions/.
**Dependências:** Nenhuma
**Repo:** `aistudio-experience-connect-admin`

---

### Action 3 — Executar Sprint S3: Lint Cleanup & Type Hardening
**Priority:** P1 — EXECUTION  
**Owner:** Kimi + Codex  
**Descrição:** Corrigir erros de lint, hardening de tipos TypeScript, gates obrigatórios.
**Dependências:** Action 1 (approval)
**Repo:** `aistudio-experience-connect-admin`

---

### Action 4 — Resolver Conflito de Governança (V1 vs REFERENCE)
**Priority:** P1 — GOVERNANCE  
**Owner:** DeepSeek  
**Descrição:** Unificar CONNECT_EXECUTION_GOVERNANCE_V1.md e CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md em governance V2.
**Dependências:** Action 2
**Repo:** `aistudio-experience-connect-admin`

---

### Action 5 — Resolver Dependências Externas (AGENTS.md, AI_RULES.md)
**Priority:** P1 — GOVERNANCE  
**Owner:** DeepSeek  
**Descrição:** Garantir que AGENTS.md e AI_RULES.md existam no repo e sejam referenciados corretamente.
**Dependências:** Action 2
**Repo:** `aistudio-experience-connect-admin`

---

### Action 6 — Avançar Fase 1 (Core)
**Priority:** P2 — PRODUCT  
**Owner:** Kimi  
**Descrição:** CRUD de reservas (frontend UI), Agenda VAN, App do hóspede, Painel admin, Integração Mercado Pago.
**Dependências:** Action 3
**Repo:** `aistudio-experience-connect-admin`

---

## Summary Matrix

| # | Action | Priority | Complexity | Dependencies |
|---|--------|----------|------------|--------------|
| 1 | Approve Sprint S3 | P0 | S | None |
| 2 | Commit governance | P0 | S | None |
| 3 | Execute Sprint S3 | P1 | M | Action 1 |
| 4 | Resolve governance conflict | P1 | S | Action 2 |
| 5 | Resolve external deps | P1 | S | Action 2 |
| 6 | Fase 1 Core | P2 | XL | Action 3 |
