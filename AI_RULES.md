# Experience Connect — AI RULES

> **Repository:** `aistudio-experience-connect-admin`  
> **Base:** `connect-engineering/AGENTS.md` + `host-connect/AI_RULES.md`  
> **Effective:** 2026-06-11  

Authority hierarchy: AGENTS.md > AI_RULES.md > repo docs/governance/ > connect-engineering AGENTS.md.

## 0. Operating Contract

- Orchestrator (DeepSeek): task framing, scope, acceptance criteria.
- DEV (Kimi/Codex): implementation, validation, evidence capture.
- GP (Alexandre/ChatGPT): business priority, approvals, risk decisions.
- No scope change without explicit Orchestrator/GP approval.
- Plan first, implement second, gate third, commit fourth.

## 1. Security & Data Governance

- Multi-tenant isolation: `tenant_id` required in all tenant-scoped tables.
- RLS enabled on all multi-tenant tables with SELECT/INSERT/UPDATE/DELETE policies.
- Never trust frontend authorization — enforce server-side + RLS.
- Direct DB access by client apps is prohibited.
- Service role restricted to approved backend workflows.

## 2. Development Workflow

- Branch: `feature/<scope>`, `fix/<scope>`, `hotfix/<scope>`.
- Commit: conventional format in português.
- PR checklist: scope match, security impact, migration/rollback, QA evidence.
- Sync to git only after all gates pass.
- Evidence capture mandatory for all changes.

## 3. Quality Gates (mandatory)

1. `pnpm typecheck` — 0 errors
2. `pnpm lint` — 0 errors
3. `pnpm build` — ok
4. `codex review` — all findings resolved

## 4. Database & Migrations

- Schema changes only via `supabase/migrations/*.sql`.
- Idempotent SQL: `IF NOT EXISTS` / `IF EXISTS`.
- No manual console drift in staging/production.
- Rollback strategy required for each migration set.

## 5. UI Standards

- Mobile-first, breakpoints: base → sm(640) → md(768) → lg(1024) → xl(1280).
- States: loading, empty, error, success para todos os componentes.
- PT-BR para textos de UI.
- shadcn/ui + TailwindCSS + Framer Motion.
- Acessibilidade WCAG AA.

## 6. Repo Overrides

```json
{
  "dev": "pnpm dev",
  "build": "pnpm build",
  "lint": "pnpm lint",
  "typecheck": "pnpm typecheck",
  "test": "pnpm test"
}
```
