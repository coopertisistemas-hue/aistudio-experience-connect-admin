# BASELINE VERIFICATION — 2026-06-11

**Sprint:** 0.1.2  
**Status:** PARCIAL (PostgreSQL local não disponível)  

---

## RLS Tests (test-rls.sh)

| Result | Detail |
|--------|--------|
| ❌ Não executado | PostgreSQL não instalado localmente. Requer Supabase local rodando. |

**Observação:** Schema V2 RLS já foi validado em S0.2 com 49/49 testes passando.

## Concurrency Tests (test-concurrency.sh)

| Result | Detail |
|--------|--------|
| ❌ Não executado | PostgreSQL não instalado localmente. |

**Observação:** Concurrency hardening foi verificado em S0.2 com 0% overbooking.

## Gates

| Gate | Status |
|------|--------|
| typecheck | ✅ 5/5 |
| lint | ✅ 5/5 |
| build | ✅ 3/3 |
| RLS (local) | ⚠️ Pendente — requer Supabase local |

## Recomendação

RLS e concurrency foram aprovados em S0.2. Validar novamente quando Supabase local estiver configurado ou em CI.
