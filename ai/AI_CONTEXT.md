# AI Context

Este documento descreve o contexto técnico do projeto para uso por agentes de IA.

---

# Projeto

- Repositório: `aistudio-experience-connect-admin`
- Produto: Experience Connect Admin
- Objetivo: operação administrativa de experiências, reservas, disponibilidade, pagamentos, relatórios e integrações do ecossistema Connect

---

# Stack

- Frontend: React + Vite + TypeScript
- Banco de dados: Supabase Postgres com RLS
- Backend: Supabase Edge Functions em `supabase/functions`
- Monorepo: turbo + pnpm
- Infraestrutura: apps em `apps/`, pacotes compartilhados em `packages/`

---

# Arquitetura

- Monorepo com apps em `apps/`
- Frontend consome operações administrativas via Edge Functions
- Fluxos sensíveis devem permanecer backend-first; o cliente não é autoridade de tenancy
- Documentação arquitetural detalhada está em `docs/architecture/` quando disponível

---

# Modelo de Tenancy

- Multi-tenant com `org_id` obrigatório
- Queries, políticas e mutações devem preservar isolamento por tenant
- Não confiar em `org_id` vindo apenas do cliente quando existir contexto autenticado confiável

---

# Componentes Principais

- `apps/admin`: app administrativo
- `apps/web`: app web
- `packages/core`: lógica compartilhada
- `packages/ui`: componentes compartilhados
- `supabase/functions`: Edge Functions
- `supabase/migrations`: evolução de schema e políticas

---

# Regras Importantes

- Preservar arquitetura e contratos existentes
- Respeitar RLS e isolamento por `org_id`
- Não mover mutações sensíveis para o frontend
- Preferir patch mínimo, sem refactor estrutural
- Validar apenas o necessário para o escopo tocado

---

# Comandos Oficiais

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (quando disponível)
