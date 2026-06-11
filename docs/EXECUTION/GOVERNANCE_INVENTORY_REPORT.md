# GOVERNANCE INVENTORY REPORT

> **Sprint:** 0.1.1  
> **Data:** 2026-06-11  
> **Contexto:** Blocker B-01 — Documentação de governança não commitada  
> **Propósito:** Inventário completo para revisão do DeepSeek e auditoria do Claude  
> **Status:** ✅ RESOLVIDO — Pendências commitadas em S0.1  

---

## 1. ESCOPE DO INVENTÁRIO

| Diretório | Status | Arquivos Encontrados |
|-----------|--------|---------------------|
| `docs/governance/` | ✅ Existe | 14 |
| `docs/architecture/` | ✅ Existe | 9 |
| `docs/roadmap/` | ✅ Existe | 6 |
| `docs/versions/` | ✅ Existe | 6 |
| `docs/database/` | ✅ Existe | 2 |
| `docs/frontend/` | ✅ Existe | 1 |
| `docs/EXECUTION/` | ✅ Existe | 1 |
| `docs/runtime/` | ❌ Não existe | 0 |
| `docs/blockers/` | ❌ Não existe | 0 |
| `docs/handoffs/` | ❌ Não existe | 0 |
| `docs/decisions/` | ❌ Não existe | 0 |

**Total de arquivos inventariados:** 39  
**Diretórios esperados mas ausentes:** 4 (`runtime/`, `blockers/`, `handoffs/`, `decisions/`)

---

## 2. TABELA MESTRE — ARQUIVOS, CATEGORIA, STATUS

### 2.1 governance/ (14 arquivos)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| G01 | `ADR-008-DeepSeek-Orchestrator-Constitution.md` | ACCEPTED | ADR-008 | DEEPSEEK.md, CONNECT_EXECUTION_GOVERNANCE_V1.md | — | — |
| G02 | `ATTRACTIONS_FREEZE_POLICY.md` | Active | 1.0 | — | — | — |
| G03 | `CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md` | — | — | CONNECT_EXECUTION_GOVERNANCE_V1.md + 4 externos | Proxy para portal externo | Duplicata funcional de G04 |
| G04 | `CONNECT_EXECUTION_GOVERNANCE_V1.md` | STRICT / MANDATORY | V1 | PORTAL_CONNECT_MASTER_EXECUTION_PLAN_V2 (externo) | — | — |
| G05 | `DEEPSEEK.md` | APPROVED | 1.0 | AGENTS.md (externo), AI_RULES.md (externo) | — | — |
| G06 | `DEEPSEEK_BOOTSTRAP_PROMPT.md` | — | — | G05, G01, G04, G10, G12, G07, G11 | — | — |
| G07 | `GOVERNANCE_STATE.md` | ACTIVE | 1.0 | G01, G05, G04, G10, G09, G12, G11 | — | — |
| G08 | `GOVERNANCE_TRANSITION_REPORT.md` | OFFICIAL | — | G05, G01, AGENTS.md (externo), AI_RULES.md (externo) | — | — |
| G09 | `INVENTORY_QUALITY_GATE_V1.md` | Active | 1.0 | — | — | — |
| G10 | `SESSION_BOOTSTRAP_REQUIREMENTS.md` | MANDATORY | 1.0 | G05, G12, G07, G11 + EXEC_PLAN_STATUS.md (inexistente), NEXT_ACTIONS.md (inexistente) | — | — |
| G11 | `ORCHESTRATOR_CONTEXT.md` | ACTIVE | 1.0 | G08, G13 | — | — |
| G12 | `MASTER_PORTFOLIO.md` | ACTIVE | 1.0 | — | — | — |
| G13 | `OPERATIONAL_START_RECOMMENDATION.md` | GO WITH CONDITIONS | — | G08, G05, G01, G10, G09 | — | — |
| G14 | `ORCHESTRATOR_ACCEPTANCE_TEST.md` | MANDATORY | 1.0 | G05, G10 | — | — |

### 2.2 architecture/ (9 arquivos)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| A01 | `ARCHITECTURE-V1.md` | SUPERSEDED | 1.0 | A02 | Par de versão com A02 | Substituído por A02 |
| A02 | `ARCHITECTURE-V2.md` | Active | 2.0 | A03, A04, A05, A06, A07, A08, A09 | Par de versão com A01 | Substitui A01 |
| A03 | `OPERATIONAL-DOMAINS.md` | — | — | — | — | — |
| A04 | `MULTI-TENANT-SECURITY.md` | — | — | — | — | — |
| A05 | `BOOKING-ORCHESTRATION.md` | — | — | A06 | — | — |
| A06 | `PAYMENT-ORCHESTRATION.md` | — | — | A05 | — | — |
| A07 | `SYSTEM-INVARIANTS.md` | — | — | — | — | — |
| A08 | `RELEASE-GOVERNANCE.md` | — | — | QA-GATES.md | — | — |
| A09 | `OBSERVABILITY.md` | — | — | — | — | — |

### 2.3 roadmap/ (6 arquivos)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| R01 | `EXECUTION-PLAN-V1.md` | SUPERSEDED BY V2 | V1 | — | Par de versão com R02 | Substituído por R02 |
| R02 | `EXECUTION-PLAN-V2.md` | — | V2 | R01, R05 | Par de versão com R01 | Substitui R01 |
| R03 | `EXECUTION-PLAN-REVIEW-V1.md` | ARCHIVED | — | A08, A09, QA-GATES.md, R01 | — | — |
| R04 | `QA-GATES.md` | MANDATORY | — | — | — | — |
| R05 | `ROADMAP-V1.md` | SUPERSEDED | 1.0 | R02 | Par de versão com R02 | Substituído por R02 |
| R06 | `v0.5.0-live-data-integration.md` | PLANNED | v0.5.0 | — | — | — |

### 2.4 versions/ (6 arquivos)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| V01 | `CHANGELOG.md` | — | — | — | — | — |
| V02 | `RELEASE-v0.3.0-backend-foundation.md` | — | v0.3.0 | — | — | — |
| V03 | `RELEASE-v0.3.1-frontend-ready.md` | — | v0.3.1 | — | — | — |
| V04 | `RUNTIME-HARDENING-REPORT-2026-05-16.md` | — | 2026-05-16 | — | — | — |
| V05 | `SPRINT-VALIDATION-2026-05-16.md` | — | 2026-05-16 | — | — | — |
| V06 | `v0.4.0-frontend-foundation-stable.md` | — | v0.4.0 | — | — | — |

### 2.5 database/ (2 arquivos)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| D01 | `DATABASE-V1.md` | — | V1 | — | Par de versão com D02 | Substituído por D02 |
| D02 | `DATABASE-V2.md` | — | V2 | — | Par de versão com D01 | Substitui D01 |

### 2.6 frontend/ (1 arquivo)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| F01 | `CONNECT-READDY-STANDARD.md` | — | — | — | — | — |

### 2.7 EXECUTION/ (1 arquivo)

| # | Arquivo | Status | Versão | Dependências | Duplicidades | Conflitos |
|---|---------|--------|--------|--------------|--------------|-----------|
| E01 | `EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md` | ACTIVE | 1.0 | 26 dependências internas + 3 externas | Referencia todos os docs | — |

---

## 3. DOCUMENTOS ÓRFÃOS

Documentos que existem mas não são referenciados por nenhum outro documento dentro do repositório:

| Arquivo | Categoria | Referenciado por |
|---------|-----------|-----------------|
| `ATTRACTIONS_FREEZE_POLICY.md` | governance | Apenas E01 (inventário) |
| `INVENTORY_QUALITY_GATE_V1.md` | governance | Apenas E01 (inventário) |
| `CONNECT-READDY-STANDARD.md` | frontend | Apenas E01 (inventário) |
| `DATABASE-V1.md` | database | Nenhum (V2 não o referencia) |
| `RELEASE-v0.3.0-backend-foundation.md` | versions | Nenhum |
| `RELEASE-v0.3.1-frontend-ready.md` | versions | Nenhum |
| `RUNTIME-HARDENING-REPORT-2026-05-16.md` | versions | Nenhum |
| `SPRINT-VALIDATION-2026-05-16.md` | versions | Nenhum |
| `v0.4.0-frontend-foundation-stable.md` | versions | Nenhum |

> **Nota:** Vários documentos de `versions/` são artefatos de release que naturalmente não são referenciados.
> Documentos de governança órfãos sugerem quebra na cadeia de rastreabilidade.

---

## 4. DOCUMENTOS DUPLICADOS (PARES DE VERSÃO)

| Par | V1 | V2 | Risco |
|-----|----|----|-------|
| Arquitetura | `ARCHITECTURE-V1.md` | `ARCHITECTURE-V2.md` | Baixo (V1 explicitamente SUPERSEDED) |
| Database | `DATABASE-V1.md` | `DATABASE-V2.md` | **Médio** (V1 sem status SUPERSEDED explícito) |
| Execution Plan | `EXECUTION-PLAN-V1.md` | `EXECUTION-PLAN-V2.md` | Baixo (V1 explicitamente SUPERSEDED BY V2) |
| Roadmap | `ROADMAP-V1.md` | `EXECUTION-PLAN-V2.md` (substituto funcional) | Baixo (V1 explicitamente SUPERSEDED) |
| Governance Ref | `CONNECT_EXECUTION_GOVERNANCE_V1.md` | `CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md` | **Alto** — mesmo propósito, origens diferentes (local vs portal externo) |

---

## 5. DOCUMENTOS CONTRADITÓRIOS OU CONFLITANTES

| Conflito | Envolvidos | Descrição |
|----------|-----------|-----------|
| **Governança local vs portal** | `CONNECT_EXECUTION_GOVERNANCE_V1.md` vs `CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md` | O REFERENCE aponta para `aistudio-portal-connect-admin` como fonte canônica, enquanto V1 define governança local. Duas fontes de verdade concorrentes. |
| **Arquitetura v1 vs v2** | `ARCHITECTURE-V1.md` vs `ARCHITECTURE-V2.md` | Resolvido — V1 marcado SUPERSEDED. Mas ambos coexistem sem referência cruzada explícita no V1 apontando que foi substituído. |
| **Roadmap vs Execution Plan** | `ROADMAP-V1.md` vs `EXECUTION-PLAN-V2.md` | Resolvido — ROADMAP-V1 marcado SUPERSEDED e referencia V2. |
| **Origens externas conflitantes** | `DEEPSEEK.md` + `ADR-008` referenciam `AGENTS.md` e `AI_RULES.md` | Estes arquivos **não existem** neste repositório. DeepSeek depende de regras de outro ecossistema. |

---

## 6. DOCUMENTOS REFERENCIADOS MAS INEXISTENTES

| Referência | Origem | Tipo | Impacto |
|-----------|--------|------|---------|
| `PORTAL_CONNECT_MASTER_EXECUTION_PLAN_V2.md` | ADR-008, CONNECT_EXECUTION_GOVERNANCE_REFERENCE, CONNECT_EXECUTION_GOVERNANCE_V1 | Externo (outro repo) | **ALTO** — Plano mestre ausente localmente |
| `PORTAL_CONNECT_ECOSYSTEM_AUDIT_A.md` (e B, C, D) | CONNECT_EXECUTION_GOVERNANCE_REFERENCE | Externo (outro repo) | **ALTO** — Auditorias de ecossistema ausentes |

---

## 7. ANÁLISE DE DEPENDÊNCIAS — GRAFO RESUMIDO

```
ADR-008 ──► DEEPSEEK.md ──► AGENTS.md ✅ (criado S0.1)
  │                         AI_RULES.md ✅ (criado S0.1)
  ├──► CONNECT_EXECUTION_GOVERNANCE_V1.md ──► PORTAL_CONNECT_MASTER_EXECUTION_PLAN_V2.md ✗
  └──► CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md ──► (4 portais externos) ✗

ARCHITECTURE-V2.md ──► OPERATIONAL-DOMAINS.md
                  ├──► MULTI-TENANT-SECURITY.md
                  ├──► BOOKING-ORCHESTRATION.md ◄──► PAYMENT-ORCHESTRATION.md
                  ├──► SYSTEM-INVARIANTS.md
                  ├──► RELEASE-GOVERNANCE.md ──► QA-GATES.md
                  └──► OBSERVABILITY.md

SESSION_BOOTSTRAP_REQUIREMENTS.md ──► EXEC_PLAN_STATUS.md ✅ (criado S0.1)
                                   └──► NEXT_ACTIONS.md ✅ (criado S0.1)

EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md ──► (todos os 26+ documentos)
```

**Legenda:** `✗` = referenciado mas inexistente | `◄──►` = bidirecional

---

## 8. CATEGORIZAÇÃO POR STATUS

| Status | Quantidade | Arquivos |
|--------|-----------|----------|
| **ACTIVE / APPROVED / MANDATORY** | 11 | G01, G02, G04, G05, G07, G09, G10, G11, G12, G14, E01 |
| **GO WITH CONDITIONS** | 1 | G13 |
| **OFFICIAL** | 1 | G08 |
| **SUPERSEDED / ARCHIVED** | 5 | A01, R01, R03, R05, D01 |
| **PLANNED** | 1 | R06 |
| **Sem status explícito** | 16 | G03, G06, A02–A09, R02, R04, D02, V01–V06, F01 |

> **Observação:** 41% dos documentos (16/39) não possuem status explícito, dificultando auditoria de relevância e vigência.

---

## 9. DIRETÓRIOS AUSENTES (ESCOPO SPRINT 0.1.1)

Os diretórios abaixo são esperados pela estrutura de governança mas **não existem**:

| Diretório | Finalidade esperada | Prioridade |
|-----------|-------------------|------------|
| `docs/runtime/` | Documentação de runtime, configurações, environment vars | Média |
| `docs/blockers/` | Registro de bloqueadores ativos com resolução | **Alta** (bloqueadores conhecidos existem) |
| `docs/handoffs/` | Handoffs entre agentes (DeepSeek ↔ Claude) | **Alta** (orquestração multi-agente) |
| `docs/decisions/` | ADRs e decisões arquiteturais | Média (ADR-008 está em governance/) |

---

## 10. RISCOS IDENTIFICADOS

| ID | Risco | Severidade | Documentos envolvidos | Status |
|----|-------|-----------|----------------------|--------|
| RISK-01 | Duas fontes de verdade de governança (local vs portal) | **CRÍTICO** | G03 vs G04 | 🔴 Aberto |
| RISK-02 | Dependências externas não resolvidas (AGENTS.md, AI_RULES.md) | ~~CRÍTICO~~ | G01, G05, G08 | ✅ **RESOLVIDO S0.1** |
| RISK-03 | Sessão DeepSeek depende de EXEC_PLAN_STATUS.md e NEXT_ACTIONS.md inexistentes | ~~ALTO~~ | G10 | ✅ **RESOLVIDO S0.1** |
| RISK-04 | 16 documentos sem status explícito de maturidade/vigência | **MÉDIO** | G03, G06, A02–A09, R02, R04, D02, V01–V06, F01 | 🟡 Aberto |
| RISK-05 | DATABASE-V1 sem marcação SUPERSEDED, coexistindo com V2 | **MÉDIO** | D01, D02 | 🟡 Aberto |
| RISK-06 | 4 diretórios de governança esperados não existem | ~~MÉDIO~~ | runtime/, blockers/, handoffs/, decisions/ | ✅ **RESOLVIDO S0.1** |

---

## 11. RECOMENDAÇÕES

1. ~~**Resolução de dependências críticas:** Incorporar ou referenciar formalmente `AGENTS.md`, `AI_RULES.md`, `EXEC_PLAN_STATUS.md`, `NEXT_ACTIONS.md` neste repositório.~~ ✅ **RESOLVIDO S0.1**
2. **Unificação de governança:** Decidir se `CONNECT_EXECUTION_GOVERNANCE_V1.md` ou `CONNECT_EXECUTION_GOVERNANCE_REFERENCE.md` é a fonte canônica — ou criar V2 que resolva o conflito.
3. **Marcação de status:** Adicionar frontmatter YAML com `status:` e `superseded_by:` em todos os documentos sem status.
4. ~~**Criação de diretórios ausentes:** `docs/blockers/` e `docs/handoffs/` são prioritários para o fluxo multi-agente.~~ ✅ **RESOLVIDO S0.1** (runtime/, blockers/, handoffs/, decisions/ criados)
5. **Auditoria de pares de versão:** Confirmar se DATABASE-V1 ainda é relevante ou deve ser arquivado.

---

*Report gerado para Sprint 0.1.1 — Blocker B-01*  
*Revisão pendente: DeepSeek + Claude*
