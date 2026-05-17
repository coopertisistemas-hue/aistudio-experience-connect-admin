# Dom Pietro Experience — Connect Admin

Plataforma Premium de Experiências para Hóspedes. SaaS multi-tenant escalável para transfers, pousadas, experiências turísticas, roteiros e concierge digital.

> **Primeiro tenant:** Dom Pietro Experience

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + TypeScript |
| Estilos | TailwindCSS + shadcn/ui |
| Animações | Framer Motion |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Segurança | RLS multi-tenant |
| Deploy | Vercel |
| Package Manager | PNPM |

## Monorepo

```
├── apps/
│   ├── web/      → App do hóspede (React + Vite)
│   ├── admin/    → Painel administrativo (React + Vite)
│   └── landing/  → Landing page institucional (React + Vite)
├── packages/
│   ├── ui/       → Design system + componentes compartilhados
│   ├── core/     → Tipos, utilitários, hooks, clientes Supabase
│   └── config/   → Configurações compartilhadas (ESLint, TS, Tailwind)
├── supabase/
│   ├── migrations/ → Migrações de banco (PostgreSQL)
│   └── functions/  → Edge Functions (TypeScript)
└── docs/
    ├── architecture/ → Documentação de arquitetura
    ├── database/     → Modelagem e schemas
    ├── roadmap/      → Roadmap técnico e produto
    └── versions/     → Changelogs e versionamento
```

## Primeiros passos

Requisitos:
- Node.js >= 20
- PNPM >= 9
- Git

Instalação:

```bash
# Instalar dependências
pnpm install

# Iniciar ambiente de desenvolvimento (todas as apps)
pnpm dev

# Iniciar apenas uma app
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter landing dev
```

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todas as apps em paralelo |
| `pnpm build` | Build de produção de todas as apps |
| `pnpm lint` | Lint em todas as apps |
| `pnpm format` | Formata todos os arquivos |
| `pnpm typecheck` | Verificação de tipos TypeScript |
| `pnpm test` | Executa testes |
| `pnpm db:start` | Inicia Supabase local |
| `pnpm db:reset` | Reseta banco local com seed |

## Padrão Connect

- **Mobile-first:** Todo design nasce mobile e escala para desktop
- **UX premium:** Transições suaves, microinterações, feedback visual imediato
- **Código limpo:** Princípios SOLID, DRY, composição sobre herança
- **Performance:** Lazy loading, code splitting, otimização de assets
- **Acessibilidade:** WCAG 2.1 AA, navegação por teclado, screen readers

## Documentação

- [FOUNDATION.md](./FOUNDATION.md) — Visão do produto, arquitetura e stack
- [docs/versions/RELEASE-v0.3.1-frontend-ready.md](./docs/versions/RELEASE-v0.3.1-frontend-ready.md) — **Último Release Notes**
- [docs/versions/CHANGELOG.md](./docs/versions/CHANGELOG.md) — Histórico de mudanças
- [docs/architecture/ARCHITECTURE-V2.md](./docs/architecture/ARCHITECTURE-V2.md) — Arquitetura V2
- [docs/roadmap/EXECUTION-PLAN-V2.md](./docs/roadmap/EXECUTION-PLAN-V2.md) — Plano de execução atualizado

## Licença

UNLICENSED — Dom Pietro Experience.
