# RUNTIME_CONFIG.md

**Version:** 1.0  
**Updated:** 2026-06-11  

---

## Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | `apps/web/.env.example` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ | `apps/web/.env.example` |
| `VITE_PUBLIC_MP_PUBLIC_KEY` | Mercado Pago public key | ❌ | — (não configurado ainda) |

## Local Development

```bash
pnpm install
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # Type check (via turbo)
```

## Supabase Local

```bash
supabase start           # Start local Supabase
supabase migration up    # Apply migrations
supabase functions serve # Serve Edge Functions locally
```

## Deployment

- Frontend: Vercel (preview + production)
- Backend: Supabase (managed PostgreSQL + Edge Functions)
- Migrations: `supabase/migrations/*.sql`

## Health Checks

| Check | Command | Expected |
|-------|---------|----------|
| Build | `pnpm build` | Exit 0 |
| TypeScript | `tsc --noEmit` | 0 errors |
| Lint | `pnpm lint` | 0 errors |
| Tests | `pnpm test` | All passing |
