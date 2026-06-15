# Mock Inventory — Experience Connect Admin

**Documento:** `docs/EXECUTION/MOCK_INVENTORY.md`
**Versao:** 1.0
**Data:** 2026-06-15
**Contexto:** Onda C — Consolidacao Tecnica (C3)

---

## 1. Resumo

A camada de servicos (11 arquivos) e hooks (13/15) esta 100% integrada ao Supabase live. Porem, 86 imports de mocks persistem em componentes de pagina que _bypassam_ os hooks, criando duas camadas de dados desconectadas.

---

## 2. Matriz Mock → Status

| Mock File | Importado por | # Imports | Status |
|-----------|---------------|-----------|--------|
| `admin-transfers.ts` | pages/admin/transfers/*, DashboardTransfers, search | 8 | **MOCK** |
| `admin-receivables.ts` | pages/admin/receivables/*, reconciliation/* | 12 | **MOCK** |
| `admin-reports.ts` | pages/admin/reports/components/* | 6 | **MOCK** |
| `admin-experiences.ts` | pages/admin/experiences/*, DashboardExperiencesOverview, search | 8 | **MOCK** |
| `admin-checkins.ts` | pages/admin/checkins/* | 6 | **MOCK** |
| `admin-availability.ts` | pages/admin/availability/* | 5 | **MOCK** |
| `admin-notifications.ts` | pages/admin/notifications/*, AdminTopbar | 5 | **MOCK** |
| `admin-customers.ts` | pages/admin/customers/components/*, search | 5 | **MOCK** |
| `admin-bookings.ts` | pages/admin/search/* | 2 | **MOCK** |
| `admin-drivers.ts` | search page, DashboardAvailabilitySnapshot | 2 | **MOCK** |
| `admin-vehicles.ts` | search page, DashboardAvailabilitySnapshot | 2 | **MOCK** |
| `admin-routes.ts` | search page | 1 | **MOCK** |
| `admin-payments.ts` | search page | 1 | **MOCK** |
| `admin-settings.ts` | pages/admin/settings/* | 4 | **MOCK** |
| `admin-dashboard.ts` | — (nenhum consumidor encontrado) | 0 | **DEAD CODE** |
| `admin-agenda.ts` | — (nenhum consumidor encontrado) | 0 | **DEAD CODE** |

---

## 3. Modulos Live vs Mock

### Modulos 100% LIVE (via hooks + servicos Supabase)
- Bookings (useBookings, bookingService)
- Dashboard KPIs (useDashboardKPIs, dashboardService)
- Agenda (useAgenda — migrado em S2.1.3)
- Payments (usePayments, paymentService)
- Settings (useSettings, settingsService)
- Drivers (useDrivers, driverService)
- Vehicles (useVehicles, vehicleService)
- Routes (useRoutes, routeService)
- Customers (useCustomers, customerService)
- Categories (useCategories, categoryService)
- Partners (usePartners, partnerService)

### Modulos ainda MOCK (importam mocks diretamente, bypassam hooks)
- **Transfers** — consome `mockTransfers` em 8 componentes
- **Receivables** — consome `mockReceivables` em 12 componentes
- **Reports** — consome `mockReports` em 6 componentes
- **Experiences** — consome `mockExperiences` em 8 componentes
- **Checkins** — consome `mockCheckins` em 6 componentes
- **Availability** — consome `mockAvailability` em 5 componentes
- **Notifications** — consome `mockNotifications` em 5 componentes
- **Search** — consome 7 mocks diferentes para global search

---

## 4. Caminho de Migracao Recomendado

Para cada modulo MOCK, o padrao de migracao e:

1. Criar servico em `apps/web/src/services/` (ex: `transfers.ts`) com queries Supabase
2. Criar hook em `apps/web/src/hooks/` (ex: `useTransfers.ts`) com React Query
3. Substituir imports de mock por hook nos componentes de pagina
4. Remover arquivo mock quando zero imports restantes

### Prioridade Sugerida

| Prioridade | Modulo | Justificativa |
|------------|--------|---------------|
| P0 | Transfers | Core do produto (reservas de transfer) |
| P1 | Checkins | Operacional critico |
| P1 | Notifications | Experiencia do usuario |
| P2 | Experiences | Catalogo de experiencias |
| P2 | Availability | Gestao de slots |
| P3 | Receivables | Financeiro |
| P3 | Reports | Analytics |
| P4 | Search | Depende de outros modulos live primeiro |

---

## 5. Dead Code

| Mock File | Acao Recomendada |
|-----------|-----------------|
| `admin-dashboard.ts` | **Remover** — sem consumidores |
| `admin-agenda.ts` | **Remover** — migrado para live em S2.1.3 |
