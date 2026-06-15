# Experience Connect — AGENTS.md

> **Repo:** `aistudio-experience-connect-admin`  
> **Archetype:** product (SaaS multi-tenant)  
> **Risk Surface:** high (booking, payments, PII)  
> **Data Sensitivity:** production customer data  
> **Deployment:** Vercel + Supabase  

## Authority Hierarchy

1. **Root `AGENTS.md`** in the current repository is the first authority.
2. `01-engineering/connect-engineering/AGENTS.md` is the fallback for ecosystem-wide rules.
3. `docs/governance/` is authoritative for governance-specific standards.
4. Legacy files remain reference inputs until formally deprecated.

## Agent Roles

| Agent | Role | Scope |
|-------|------|-------|
| **DeepSeek** | Orchestrator | Sprint planning, governance, context setup |
| **Kimi** | Primary Executor | Code changes, documentation, refactoring — Kimi K2.7 |
| **Codex** | Execution + Sprint Auditor | Code review, SQL migrations, RLS changes, sprint audit |
| **Claude** | Premium Auditor | Architecture audit, security review, premium sprint closure audit |
| **Gemini** | Governance Auditor | Git audit, governance compliance |
| **Minimax** | Independent Validator | Sprint validation support, cross-audit verification |

## Operating Standard

- **DeepSeek** prepara contexto e prompt completo.
- **Kimi** executa com `kimi -y -p "prompt detalhado"` (Kimi K2.7).
- **Codex** audita com `codex review` antes do commit. Auditor de sprint.
- **Claude** auditoria premium para fechamento de sprint e segurança.
- Gates obrigatórios: `pnpm typecheck` → `pnpm lint` → `pnpm build`.
- Commits em português (conventional commits).
- Texto de UI em português.
- Stage apenas arquivos da sprint.
- Sem refactors desnecessários.
- Seguir padrões existentes do repositório.

## Execution Rules

1. Diagnose before editing.
2. Preserve governance-first, repo-authoritative.
3. Prefer minimal, auditable, additive changes.
4. Protect tenant isolation and RLS-first posture.
5. No infrastructure mega-phases without explicit need.

## Stop Rules

- Stop on security ambiguity, tenant-boundary risk, RLS/policy ambiguity.
- Stop on conflicting governance sources.
- Stop when required validation cannot be completed.
