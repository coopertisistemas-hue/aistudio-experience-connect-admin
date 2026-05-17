# Roadmap V1 — Dom Pietro Experience Connect

> **Status: SUPERSEDED by `EXECUTION-PLAN-V2.md`.**
> Kept for historical reference only. Phase organization, scope, and timeline
> have been restructured in V2. Do not use as planning source of truth.

> Roadmap técnico e de produto para o MVP e fases iniciais.

---

## Legenda

| Status | Ícone |
|--------|-------|
| Concluído | ✅ |
| Em andamento | 🔄 |
| Planejado | ⬜ |
| Bloqueado | 🚫 |

---

## Fase 0 — Foundation (Semanas 1-2)

**Objetivo:** Ambiente de desenvolvimento pronto, design system base, autenticação funcional.

### Infraestrutura

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 0.1 | Estrutura monorepo PNPM + Turbo | ✅ | Dev |
| 0.2 | Configuração TypeScript base | ⬜ | Dev |
| 0.3 | Setup ESLint + Prettier | ⬜ | Dev |
| 0.4 | Configuração TailwindCSS + shadcn/ui | ⬜ | Dev |
| 0.5 | CI/CD GitHub Actions (lint, build, test) | ⬜ | Dev |
| 0.6 | Setup Supabase local (Docker) | ⬜ | Dev |
| 0.7 | Migrações iniciais do banco | ⬜ | Dev |
| 0.8 | Seed data + fixtures | ⬜ | Dev |
| 0.9 | Tipos gerados do banco (supabase gen types) | ⬜ | Dev |

### Design System

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 0.10 | Tokens de design (colors, spacing, typography) | ⬜ | Design/Dev |
| 0.11 | Componentes base shadcn/ui configurados | ⬜ | Dev |
| 0.12 | Layout base (mobile-first) | ⬜ | Dev |
| 0.13 | Animações padrão (Framer Motion) | ⬜ | Dev |
| 0.14 | Dark mode / tema claro | ⬜ | Dev |

### Autenticação

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 0.15 | Auth context + provider | ⬜ | Dev |
| 0.16 | Login por OTP (SMS/Email) | ⬜ | Dev |
| 0.17 | Login social (Google) | ⬜ | Dev |
| 0.18 | Proteção de rotas | ⬜ | Dev |
| 0.19 | Logout + refresh token | ⬜ | Dev |

**Entregável:** Ambiente funcional, login/logout operacional, design system aplicado.

---

## Fase 1 — Core Transfer (Semanas 3-6)

**Objetivo:** Fluxo completo de reserva de transfer, agenda VAN, painel admin básico.

### App do Hóspede (Web)

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 1.1 | Tela inicial / dashboard | ⬜ | Dev |
| 1.2 | Catálogo de rotas | ⬜ | Dev |
| 1.3 | Formulário de reserva (origem, destino, data, passageiros) | ⬜ | Dev |
| 1.4 | Seleção de veículo | ⬜ | Dev |
| 1.5 | Carrinho / resumo da reserva | ⬜ | Dev |
| 1.6 | Integração Mercado Pago (checkout) | ⬜ | Dev |
| 1.7 | Tela de confirmação | ⬜ | Dev |
| 1.8 | Histórico de reservas | ⬜ | Dev |
| 1.9 | Detalhes da reserva (status, motorista) | ⬜ | Dev |
| 1.10 | Perfil do hóspede | ⬜ | Dev |

### Painel Admin

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 1.11 | Dashboard com KPIs (reservas do dia, receita) | ⬜ | Dev |
| 1.12 | Lista de reservas (filtros, busca, paginação) | ⬜ | Dev |
| 1.13 | Detalhes da reserva (editar, cancelar) | ⬜ | Dev |
| 1.14 | Agenda VAN (calendário dia/semana) | ⬜ | Dev |
| 1.15 | Atribuir motorista/veículo | ⬜ | Dev |
| 1.16 | CRUD de veículos | ⬜ | Dev |
| 1.17 | CRUD de rotas | ⬜ | Dev |
| 1.18 | CRUD de motoristas | ⬜ | Dev |

### Backend

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 1.19 | Edge Function: criar preferência Mercado Pago | ⬜ | Dev |
| 1.20 | Edge Function: webhook Mercado Pago | ⬜ | Dev |
| 1.21 | Edge Function: otimização de agenda | ⬜ | Dev |
| 1.22 | Realtime: atualizações de status da reserva | ⬜ | Dev |
| 1.23 | Notificações: email de confirmação | ⬜ | Dev |
| 1.24 | RLS completo em todas as tabelas | ⬜ | Dev |

**Entregável:** Hóspede pode reservar transfer e pagar. Admin gerencia reservas e agenda.

---

## Fase 2 — Experiências & Concierge (Semanas 7-10)

**Objetivo:** Expandir para experiências turísticas, roteiros e concierge digital.

### Produto

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 2.1 | Modelo de dados: experiências | ⬜ | Dev |
| 2.2 | Catálogo de experiências (app) | ⬜ | Dev |
| 2.3 | Reserva de experiências | ⬜ | Dev |
| 2.4 | Roteiros sugeridos (templates) | ⬜ | Dev |
| 2.5 | Roteiros personalizados | ⬜ | Dev |
| 2.6 | Concierge digital v1 (chat/solicitações) | ⬜ | Dev |
| 2.7 | Galeria de fotos por experiência | ⬜ | Dev |
| 2.8 | Avaliações e reviews | ⬜ | Dev |

### Admin

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 2.9 | CRUD de experiências | ⬜ | Dev |
| 2.10 | CRUD de roteiros | ⬜ | Dev |
| 2.11 | Gestão de avaliações | ⬜ | Dev |
| 2.12 | Templates de mensagem (concierge) | ⬜ | Dev |
| 2.13 | Relatórios financeiros básicos | ⬜ | Dev |

### Backend

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 2.14 | Edge Function: notificações push | ⬜ | Dev |
| 2.15 | Edge Function: geração de roteiro com IA | ⬜ | Dev |
| 2.16 | Storage: otimização de imagens | ⬜ | Dev |
| 2.17 | Realtime: chat concierge | ⬜ | Dev |

**Entregável:** Plataforma completa de experiências. Concierge digital operacional.

---

## Fase 3 — Scale & AI (Semanas 11-14)

**Objetivo:** Preparar para múltiplos tenants, analytics avançado e recursos de IA.

### Multi-Tenant

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 3.1 | Onboarding automatizado de novos tenants | ⬜ | Dev |
| 3.2 | White-label: configurações de branding | ⬜ | Dev |
| 3.3 | Subdomínios / custom domains | ⬜ | Dev |
| 3.4 | Planos e billing (freemium/pro/enterprise) | ⬜ | Dev |
| 3.5 | Isolamento completo de tenants | ⬜ | Dev |

### Inteligência Artificial

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 3.6 | Embeddings de experiências (pgvector) | ⬜ | Dev |
| 3.7 | Busca semântica de experiências | ⬜ | Dev |
| 3.8 | Recomendações personalizadas | ⬜ | Dev |
| 3.9 | Assistente virtual (chatbot) | ⬜ | Dev |
| 3.10 | Otimização de rotas com IA | ⬜ | Dev |

### Analytics & Relatórios

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 3.11 | Dashboard analytics avançado | ⬜ | Dev |
| 3.12 | Funnels de conversão | ⬜ | Dev |
| 3.13 | Relatórios exportáveis (PDF/Excel) | ⬜ | Dev |
| 3.14 | Integração Google Analytics 4 | ⬜ | Dev |

### Mobile

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 3.15 | PWA (Progressive Web App) | ⬜ | Dev |
| 3.16 | Push notifications nativas | ⬜ | Dev |
| 3.17 | App wrapper (Capacitor/React Native) | ⬜ | Dev |

**Entregável:** SaaS enterprise pronto para escalar. IA operacional. Múltiplos tenants.

---

## Fase 4 — Polish & Launch (Semanas 15-16)

**Objetivo:** Qualidade premium, performance, segurança e go-to-market.

| # | Tarefa | Status | Responsável |
|---|--------|--------|-------------|
| 4.1 | Performance audit (Lighthouse > 90) | ⬜ | Dev |
| 4.2 | Accessibility audit (WCAG AA) | ⬜ | Dev |
| 4.3 | Security audit (pen test básico) | ⬜ | Dev |
| 4.4 | Testes E2E críticos (Playwright) | ⬜ | QA |
| 4.5 | Testes de carga (k6/Artillery) | ⬜ | Dev |
| 4.6 | Documentação de API (OpenAPI) | ⬜ | Dev |
| 4.7 | Documentação de usuário (help center) | ⬜ | Produto |
| 4.8 | Landing page otimizada (SEO) | ⬜ | Marketing |
| 4.9 | Setup produção (Vercel + Supabase) | ⬜ | Dev |
| 4.10 | Monitoramento (Sentry, Analytics) | ⬜ | Dev |
| 4.11 | Backup e DR strategy | ⬜ | Dev |
| 4.12 | Go-live Dom Pietro Experience | ⬜ | Todos |

**Entregável:** Produto em produção, estável e escalável.

---

## Métricas de Acompanhamento

| Métrica | Target | Medição |
|---------|--------|---------|
| Velocity | 30 pts/sprint | Sprint retrospective |
| Bug density | < 5% | Bugs / total tasks |
| Test coverage | > 70% | Coverage report |
| Build time | < 2 min | CI pipeline |
| Deploy frequency | 1+ / dia | GitHub Actions |
| Uptime | > 99.5% | Vercel/Supabase status |
| NPS interno | > 50 | Equipe + stakeholders |

---

*Última atualização: 2026-05-16*
*Versão: 1.0*
*Status: Draft*
