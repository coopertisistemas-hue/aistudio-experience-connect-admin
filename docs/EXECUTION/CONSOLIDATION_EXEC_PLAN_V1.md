# Consolidation & Continuity Exec Plan — Experience Connect Admin

**Documento:** `docs/EXECUTION/CONSOLIDATION_EXEC_PLAN_V1.md`
**Versao:** 1.0
**Data:** 2026-06-15
**Orquestrador:** DeepSeek V4 Pro
**Classificacao:** EXECUTION PLAN — Sujeito a auditoria Claude + aprovacao Alexandre
**Status:** APROVADO — Em execucao

---

## 1. Sumario Executivo

O repositorio `aistudio-experience-connect-admin` acumulou sprints nao documentados (S2.1.x admin live data, S3.1.x landing page) que nao estao refletidos nos documentos de tracking. Alem disso, 3 decisoes arquiteturais precisam ser formalizadas e o baseline tecnico precisa de verificacao completa antes de avancar para novos features. Este plano estrutura o trabalho em 3 ondas sequenciais + especificacao do app do motorista.

**Contexto atual do repo:**
- 3 apps (web, landing, admin-stub) + 3 packages (core, ui, config)
- 14 migrations Supabase, 9 Edge Functions
- 199 source files em apps/web, 23 em apps/landing
- Git: branch `main`, clean, 15 commits recentes em portugues
- Supabase: cloud-first (sem credenciais commitadas)

---

## 2. Onda A — Saneamento de Governanca

**Objetivo:** Sincronizar 5 documentos de tracking com a realidade dos commits.

**Duracao estimada:** 30 minutos
**Agente:** DeepSeek (orquestrador — atualizacoes de tracking docs)

### A1 — Atualizar `docs/governance/EXEC_PLAN_STATUS.md`

| Acao | Detalhe |
|------|---------|
| Sprint History | Adicionar S2.1.1 a S2.1.5 (admin live data migration) e S3.1.1 a S3.1.5 (landing page + CI/E2E) |
| Phase Progress | Recalcular Fase 1 ~90%, Fase 2 ~65% |
| Sprint History table | Adicionar coluna de commit hash para cada sprint |

### A2 — Atualizar `docs/governance/ORCHESTRATOR_CONTEXT.md`

| Acao | Detalhe |
|------|---------|
| Next Sprint | Definir como "Onda A/B/C — Consolidation" (este plano) |
| Sprints Completed | Adicionar S2.1.1-S2.1.5 e S3.1.1-S3.1.5 |
| Current Blockers | Remover B-02 (ja resolved). Todos os 4 blockers RESOLVED. |
| Agent Availability | Confirmar status de todos os 6 agentes |

### A3 — Atualizar `docs/governance/NEXT_ACTIONS.md`

| Acao | Detalhe |
|------|---------|
| Fechar | Actions 1-5 e 7 (todas COMPLETED ou obsoletas) |
| Nova Action 1 | "Executar Onda A — Saneamento de Governanca" — P0 |
| Nova Action 2 | "Aprovar decisoes arquiteturais Onda B" — P1 |
| Nova Action 3 | "Executar Onda C — Consolidacao" — P1 |
| Remover | Action 4 (REFERENCE.md nao e conflito — e documento ponteiro benigno) |

### A4 — Atualizar `docs/blockers/CURRENT_BLOCKERS.md`

| Acao | Detalhe |
|------|---------|
| B-02 | Marcar RESOLVED (aprovado em 2026-06-11) |
| Limpeza | Remover todos os blockers ja closed da secao Active |
| Secao vazia | "No active blockers" |

### A5 — Atualizar `docs/governance/GOVERNANCE_STATE.md`

| Acao | Detalhe |
|------|---------|
| Pending Approvals | Limpar tabela (todos ja resolvidos) |
| Active ADRs | Adicionar este plano como item de tracking |
| Operational Risks | Atualizar status dos 5 riscos (R1 resolvido via OR1, R2-R5 tracking) |

### Criterios de Aceite — Onda A

- [ ] `EXEC_PLAN_STATUS.md` reflete todos os sprints executados com commit hashes
- [ ] `ORCHESTRATOR_CONTEXT.md` tem Next Sprint definido e blockers limpos
- [ ] `NEXT_ACTIONS.md` sem itens stale; acoes ordenadas por prioridade real
- [ ] `CURRENT_BLOCKERS.md` mostra "No active blockers"
- [ ] `GOVERNANCE_STATE.md` atualizado com tracking deste plano

---

## 3. Onda B — Decisoes Arquiteturais

**Objetivo:** Formalizar 3 decisoes pendentes com justificativa de melhores praticas.

**Aprovador:** Alexandre (Product Owner)
**Suporte tecnico:** Claude (Security & Architecture Auditor)
**Status:** APROVADO (2026-06-15) — adocao de melhores praticas

### DA-05: Remover `apps/admin` (dead stub)

**Situacao:** `apps/admin` contem 2 arquivos fonte (`App.tsx` com placeholder "Em desenvolvimento", `main.tsx` minimo). Sem providers, sem dados, sem funcionalidade. O admin real opera em `apps/web/src/pages/admin/` (20+ paginas CRUD).

**Decisao:** **REMOVER** — Codigo morto causa:
- Confusao sobre qual admin e o canonico
- Custo de manutencao (dependencies, builds, CI)
- Falsa impressao de funcionalidade ao inspecionar o monorepo

**Best practice:** Monorepos devem conter apenas codigo ativo. Stubs e placeholders pertencem a branches de feature ou sao criados sob demanda.

**Acao tecnica:** Remover `apps/admin/`, atualizar `pnpm-workspace.yaml`, `turbo.json`, e remover referencias em CI.

### DA-01: Manter `apps/landing` como app separada de `apps/web`

**Situacao:**
- `apps/landing` = site B2C para hospedes (7 paginas, booking wizard, Mercado Pago, React Query + dados reais, tema escuro "Dom Pietro Experience")
- `apps/web/home` = landing B2B para operadores hoteleiros (pagina estatica de marketing, tema claro "Experience Connect")

**Analise:** Nao ha sobreposicao funcional. Servem publicos e propositos diferentes. Compartilham `packages/core` e `packages/ui` via monorepo. Zero codigo duplicado.

**Decisao:** **MANTER SEPARADOS** — Justificativa:
- Separation of concerns: B2C hospede vs B2B operador
- Cada app tem seu proprio Vercel deploy, SEO strategy e dominio
- Compartilhamento via packages e a abordagem correta de monorepo
- Unificar forcaria acoplamento indevido entre audiencias distintas

**Best practice:** Micro-frontends e apps separados por audiencia sao padrao em monorepos SaaS multi-tenant.

### DA-02: App do Motorista como PWA no monorepo

**Situacao:** Necessidade de um app mobile-friendly para o motorista responsavel pelo grupo de turismo. Funcionalidades: agenda diaria, lista de viagens, check-in/check-out, navegacao (Google Maps/Waze), registro de ocorrencias, modo offline.

**Decisao:** **PWA em `apps/driver`** dentro do monorepo — Justificativa:

| Criterio | PWA no monorepo | React Native |
|----------|----------------|--------------|
| Reuso de packages | Total (`@connect/core`, `@connect/ui`) | Nenhum — stack separada |
| Curva de aprendizado | Zero — mesma stack (React+Vite+TS) | Alta — nova stack |
| Offline | Service Worker (PWA) | Nativo |
| Deploy | Vercel (igual aos outros apps) | App Store + Google Play |
| GPS/Navegacao | Deep-link para Google Maps/Waze | Nativo |
| Custo MVP | Baixo | Alto |
| Tempo MVP | ~1-2 sprints | ~4-6 sprints |

**Best practice:** PWAs sao a recomendacao padrao para apps internos/operacionais em 2026. App stores so se justificam quando ha necessidade de push notifications nativas, acesso a hardware especifico, ou distribuicao publica para usuarios finais. Nenhum desses casos se aplica ao app do motorista no MVP.

**Escopo do MVP — apps/driver:**

| Funcionalidade | Prioridade |
|----------------|------------|
| Login OTP (role: driver) | P0 |
| Agenda diaria (viagens do dia) | P0 |
| Detalhe da viagem (passageiros, origem/destino, observacoes) | P0 |
| Check-in / Check-out da viagem | P0 |
| Status em tempo real (Supabase Realtime) | P0 |
| Deep-link Google Maps/Waze | P1 |
| Registro de ocorrencias (texto + foto) | P1 |
| Modo offline (Service Worker cache) | P2 |
| Sincronizacao automatica com admin | Automatico (Realtime) |

---

## 4. Onda C — Consolidacao Tecnica

**Objetivo:** Verificar baseline tecnico usando Supabase Cloud (nao Docker local).

**Duracao estimada:** 1-2 horas
**Agentes:** Kimi (execucao) + Codex (auditoria)

### C1 — Verificacao de Gates

```bash
pnpm typecheck   # Deve retornar 0 errors
pnpm lint        # Deve retornar 0 errors
pnpm build       # Deve compilar todos os 3 apps
```

**Evidencia:** Output completo dos 3 comandos com timestamps.

### C2 — Playwright E2E

```bash
pnpm test:e2e    # Executa booking.spec.ts, landing.spec.ts, smoke.spec.ts
```

**Nota:** Testes E2E usam `VITE_PUBLIC_SUPABASE_URL` do `.env.e2e.example` (placeholder). Para testes reais, configurar `.env.e2e` com URL do Supabase Cloud.

### C3 — Inventory de Mocks Pendentes

Listar todos os 16 arquivos em `apps/web/src/mocks/` e verificar quais modulos admin correspondentes ja foram migrados para dados live (S2.1.1-S2.1.5). Output esperado: matriz `mock → status (LIVE / MOCK / PARCIAL)`.

### C4 — Cobertura de Hooks

Verificar os 15 hooks em `apps/web/src/hooks/`:
- Quais usam Supabase live vs mock fallback?
- Quais tem tratamento de erro e loading states?
- Identificar hooks que precisam de refactor (ex: `usePaymentPolling` pode ser substituido por Supabase Realtime)

### C5 — RLS Baseline (Supabase Cloud)

**Adaptacao para Cloud:** Em vez de Docker local + `test-rls.sh`:

1. Executar `scripts/test-rls.sql` contra o Supabase Cloud usando `psql` com connection string do cloud
2. Validar 49/49 politicas RLS
3. Se `psql` direto nao disponivel, usar Supabase Dashboard SQL Editor ou Edge Function de teste

**Fallback:** Se acesso ao Cloud nao estiver configurado, documentar como bloqueio e agendar.

### C6 — Operational Risks Update

Atualizar `docs/EXECUTION/EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md` e `GOVERNANCE_STATE.md`:

| Risco | Status | Evidencia |
|-------|--------|-----------|
| R1 — update_updated_at_column | CONFIRMED — RESOLVIDO | Commit `56dea14` (OR1) |
| R2 — Orphaned edge functions | PROBABLE — Verificar | Listar edge functions nao referenciadas |
| R3 — Duplicated edge functions | PROBABLE — Verificar | Comparar logica entre funcoes |
| R4 — Infrastructure visibility | UNKNOWN — Tracking | Validar Vercel + Supabase configs |
| R5 — Security migrations | CONFIRMED — RESOLVIDO | Commits `56dea14`, `1dd3033` |

### C7 — Remocao de apps/admin (DA-05 APROVADO)

- Remover diretorio `apps/admin/`
- Atualizar `pnpm-workspace.yaml` (remover entrada)
- Atualizar `turbo.json` (se referenciado)
- Rodar `pnpm install` para limpar lockfile
- Verificar `pnpm build` sem erros

### Criterios de Aceite — Onda C

- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm build` → sucesso em todos os apps
- [ ] Playwright E2E → todos passando (ou documentar blockers)
- [ ] Matriz mock→live documentada em `docs/EXECUTION/MOCK_INVENTORY.md`
- [ ] Hooks coverage mapeado em `docs/EXECUTION/HOOKS_COVERAGE.md`
- [ ] RLS baseline: 49/49 ou documentar pendencia
- [ ] Operational risks atualizados
- [ ] apps/admin removido (APROVADO)

---

## 5. Especificacao — App do Motorista (Driver PWA)

### 5.1 Arquitetura

```
apps/driver/
  ├── index.html
  ├── package.json              # @connect/driver v0.1.0
  ├── vite.config.ts            # Vite + PWA plugin
  ├── tsconfig.json
  ├── vercel.json
  └── src/
      ├── main.tsx
      ├── App.tsx
      ├── router/
      │   └── config.tsx        # / → Agenda, /trip/:id → Detalhe, /login
      ├── pages/
      │   ├── Login.tsx         # OTP login (role: driver)
      │   ├── Agenda.tsx        # Viagens do dia
      │   └── TripDetail.tsx    # Detalhe + check-in/out + ocorrencias
      ├── hooks/
      │   ├── useDriverTrips.ts # Query: bookings do motorista logado
      │   └── useTripActions.ts # Mutations: check-in, check-out, ocorrencia
      ├── components/
      │   ├── TripCard.tsx      # Card de viagem na agenda
      │   ├── TripTimeline.tsx  # Status: pendente → em andamento → concluida
      │   ├── PassengerList.tsx # Lista de passageiros
      │   ├── CheckInButton.tsx # Acao de check-in
      │   ├── IncidentForm.tsx  # Registro de ocorrencia + foto
      │   └── NavigationButton.tsx # Deep-link Google Maps/Waze
      ├── providers/
      │   └── DriverAuth.tsx    # AuthProvider adaptado para role driver
      └── lib/
          └── supabase.ts       # Reusa @connect/core/supabase
```

### 5.2 Dependencias

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-router-dom": "^7.6.3",
    "@tanstack/react-query": "^5.62.16",
    "@connect/core": "workspace:*",
    "@connect/ui": "workspace:*"
  },
  "devDependencies": {
    "vite": "^8.0.1",
    "vite-plugin-pwa": "^1.0.0",
    "typescript": "^5.7.3"
  }
}
```

### 5.3 Integracao com Supabase

- **Auth:** Supabase Auth com OTP (email). Role verificada via `user_tenants.role = 'driver'`
- **Dados:** Queries via `@connect/core/supabase` com tipagem `Database`
- **Realtime:** `supabase.channel('driver-trips').on('postgres_changes', ...)` para atualizacoes ao vivo
- **Storage:** Bucket `driver-incidents` para upload de fotos de ocorrencias
- **RLS:** Nova policy para role `driver` — acesso apenas as proprias viagens (`bookings.driver_id = auth.uid()`)

### 5.4 PWA Config (vite-plugin-pwa)

- Service Worker com estrategia cache-first para viagens do dia
- Manifest com icone, nome "Dom Pietro Driver", tema standalone
- Sincronizacao offline: queue de acoes (check-in/out) → replay ao reconectar

### 5.5 Sequencia de Implementacao

| Sprint | Descricao | Dono | Dependencia |
|--------|-----------|------|-------------|
| D1 | Criar `apps/driver/` com Vite+PWA, pacote, router, Supabase client | Codex | DA-02 APROVADO |
| D2 | Login OTP + AuthProvider para role driver | Kimi | D1 |
| D3 | Agenda diaria (lista de viagens do motorista) + TripCard | Kimi | D2 |
| D4 | TripDetail: passageiros, check-in/out, status timeline | Kimi | D3 |
| D5 | Navegacao (Google Maps/Waze deep-link) + IncidentForm | Codex | D4 |
| D6 | PWA offline cache + sync queue | Codex | D5 |
| D7 | Testes E2E (Playwright) + Polimento visual | Kimi | D6 |

---

## 6. Atribuicao de Agentes

| Onda/Sprint | Agente Primario | Agente de Revisao | Auditor |
|-------------|----------------|-------------------|---------|
| Onda A (A1-A5) | DeepSeek | — | DeepSeek (self-check) |
| Onda B (DA-01/02/05) | DeepSeek (planejamento) | Claude | Alexandre (aprovacao) |
| Onda C (C1-C7) | Kimi K2.6 | Codex | Codex (premium) |
| Driver D1-D7 | Kimi + Codex | Claude (seguranca) | Codex (premium) |

---

## 7. Linha do Tempo

```
Sessao 1 (hoje)        → Onda A completa + Onda B aprovada
Sessao 2                → Onda C (C1-C7) completa
Sessao 3                → Driver D1-D2 (setup + auth)
Sessao 4                → Driver D3-D4 (agenda + trip detail)
Sessao 5                → Driver D5-D7 (navegacao + offline + testes)
```

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Supabase Cloud inacessivel | Media | Alto (bloqueia C5) | Solicitar credenciais ao Alexandre; fallback: SQL Editor no Dashboard |
| .env Cloud ausente | Alta | Medio (bloqueia C2 E2E) | Criar `.env` e `.env.e2e` com credenciais fornecidas |
| apps/admin referenciado em CI/CD | Baixa | Baixo | Verificar `turbo.json` e `.github/workflows/ci.yml` antes de remover |
| Driver app complexidade subestimada | Media | Medio | Escopo MVP bem definido (secao 5.2); adiar features P2 se necessario |

---

## 9. Definition of Ready

Uma onda esta pronta para iniciar quando:
- [ ] Todas as dependencias da onda anterior estao CONFIRMED
- [ ] Agentes designados estao disponiveis
- [ ] Credenciais necessarias estao provisionadas (Supabase Cloud .env)
- [ ] Aprovacoes arquiteturais (Onda B) estao assinadas

## 10. Definition of Done

Uma onda esta concluida quando:
- [ ] Todos os criterios de aceite listados estao marcados
- [ ] Evidencias (logs, screenshots, outputs) estao anexadas
- [ ] `pnpm typecheck && pnpm lint && pnpm build` passam
- [ ] Documentacao de tracking atualizada
- [ ] Minimax audit (para ondas C e Driver)

---

## 11. Codex Premium Audit Request

**Para:** Codex (Premium Auditor)
**Assunto:** Auditoria Premium — Consolidation Exec Plan V1 (Onda A/B/C + Driver D1-D4)
**Status:** CONCLUIDO — aguardando auditoria

### Escopo da Auditoria

1. **Gates:** typecheck ✅ / lint ✅ / build ✅ / E2E 21/21 ✅ — validar outputs
2. **Arquitetura:** DA-01 (landing separado), DA-02 (PWA driver), DA-05 (apps/admin removido) — validar decisoes
3. **Seguranca:** Driver OTP (`shouldCreateUser: false`), RLS policies V2, supabase client isolation
4. **Codigo:** apps/driver/ (23 arquivos), TripDetail `as any` workarounds (2 locais), DriverAuth context pattern
5. **Riscos operacionais:** 5 riscos do TRANSITION REPORT — R1 ✅, R5 ✅, R2-R4 tracking
6. **Mocks:** 6 modulos ainda mock (bypassam hooks) — documentados em MOCK_INVENTORY.md

### Evidencias

| Item | Status | Evidencia |
|------|--------|-----------|
| typecheck | ✅ 0 errors | 6 packages, exit 0 |
| lint | ✅ 0 errors, 0 warnings | `--max-warnings 0`, 6 packages |
| build | ✅ 3 apps | web 349KB / landing 374KB / driver 421KB PWA |
| E2E Playwright | ✅ 21/21 | 9 smoke + 5 booking + 7 landing — 42.7s |
| Commits | 3 | `fa2a280`, `c168c5b`, `0c416bf` |

### Output Esperado

Relatorio de auditoria premium com:
- Findings por severidade (CRITICAL/HIGH/MEDIUM/LOW)
- Validacao de cada gate com evidencias
- Recomendacoes acionaveis por prioridade
- GO / NO-GO para deploy

---

## 12. Changelog

| Data | Versao | Mudanca |
|------|--------|---------|
| 2026-06-15 | 1.0 | Lancamento inicial. Onda B aprovada (adocao de melhores praticas). |

---

*Fim do plano. Governado por DEEPSEEK.md v1.0 e ADR-008.*
