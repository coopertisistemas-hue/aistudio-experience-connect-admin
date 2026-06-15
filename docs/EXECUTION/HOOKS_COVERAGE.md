# Hooks Coverage — Experience Connect Admin

**Documento:** `docs/EXECUTION/HOOKS_COVERAGE.md`
**Versao:** 1.0
**Data:** 2026-06-15
**Contexto:** Onda C — Consolidacao Tecnica (C4)

---

## 1. Matriz de Hooks

| Hook | Data Source | React Query | Error Handling | Loading State | Status |
|------|-------------|-------------|----------------|---------------|--------|
| `useBookings` | LIVE (bookingService → Supabase + Edge Functions) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useDashboardKPIs` | LIVE (dashboardService → Supabase) | ✅ useQuery (refetchInterval 60s) | ✅ | ✅ | OK |
| `usePaymentPolling` | LIVE (paymentService → Supabase) | ❌ Custom (useState/useEffect) | ✅ try/catch | ✅ | ⚠️ Migrar p/ React Query |
| `useSettings` | LIVE (settingsService → Supabase + Edge) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useAgenda` | LIVE (agendaService → bookingService → Supabase) | ✅ useQuery | ✅ | ✅ | OK |
| `useDrivers` | LIVE (driverService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useVehicles` | LIVE (vehicleService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useRoutes` | LIVE (routeService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `usePayments` | LIVE (paymentService → Supabase + Edge) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useCustomers` | LIVE (customerService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useCategories` | LIVE (categoryService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `usePartners` | LIVE (partnerService → Supabase) | ✅ useQuery/useMutation | ✅ | ✅ | OK |
| `useAuth` | LIVE (AuthContext → Supabase session) | ❌ Context-based | ❌ | ✅ | OK |
| `useScrollReveal` | UI-only (IntersectionObserver) | N/A | N/A | N/A | OK |
| `useGlobalSearch` | UI-only (localStorage) | N/A | ✅ localStorage try/catch | N/A | OK |

---

## 2. Analise

### Pontos Fortes
- 13/15 hooks integrados ao Supabase live — **87% de cobertura live**
- Todos os hooks de dados usam React Query com cache, invalidation e refetch
- Todos os hooks de dados tem tratamento de erro e loading states
- Nenhum hook usa mock data como fallback

### Pontos de Atencao
- **usePaymentPolling** usa implementacao customizada (useState/useEffect) em vez de React Query. Recomendado migrar para `useQuery` com `refetchInterval` para consistencia com o padrao do projeto
- **useAuth** nao tem tratamento de erro proprio (delega ao AuthContext)
- 2 hooks UI-only nao se aplicam a analise de dados

### Modulos sem Hook Correspondente
Os seguintes modulos ainda nao tem hooks implementados (consomem mocks diretamente nas paginas):

| Modulo | Hook Necessario | Status |
|--------|-----------------|--------|
| Transfers | `useTransfers` | ❌ Nao existe |
| Checkins | `useCheckins` | ❌ Nao existe |
| Notifications | `useNotifications` | ❌ Nao existe |
| Experiences | `useExperiences` | ❌ Nao existe |
| Availability | `useAvailability` | ❌ Nao existe |
| Receivables | `useReceivables` | ❌ Nao existe |

---

## 3. Recomendacoes

1. **Migrar usePaymentPolling** para React Query — alinhar com padrao do projeto
2. **Criar hooks para modulos mock** — seguindo o template:
   ```ts
   // Template: use[Modulo].ts
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { [modulo]Service } from '@/services/[modulo]';
   
   export function use[Modulos]() {
     return useQuery({
       queryKey: ['[modulos]'],
       queryFn: () => [modulo]Service.list(),
     });
   }
   ```
3. **Remover mocks** `admin-dashboard.ts` e `admin-agenda.ts` (dead code)
