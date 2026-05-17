# FOUNDATION — Dom Pietro Experience Connect

> Documento técnico fundacional. Define a visão, arquitetura, stack e diretrizes do projeto.

---

## 1. Visão do Produto

**Dom Pietro Experience Connect** é uma plataforma SaaS multi-tenant premium para gestão de experiências turísticas.

### Conceito

"Concierge digital para hóspedes de alto padrão." A plataforma conecta hóspedes a experiências exclusivas: transfers privativos, roteiros personalizados, gastronomia local, atividades turísticas e serviços de concierge — tudo em um único ecossistema digital.

### Diferenciais

- Experiência unificada: hóspede não precisa de múltiplos apps
- Operação inteligente: agenda da VAN, otimização de rotas, previsibilidade
- Pagamento integrado: Mercado Pago com split e conciliação
- Concierge digital: roteiros, reservas, comunicação centralizada
- Multi-tenant nativo: cada pousada/operadora tem sua instância isolada

---

## 2. Arquitetura

### 2.1. Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Landing    │  │   Web App   │  │     Admin Panel     │  │
│  │  (Next.js)  │  │  (React+Vite)│  │   (React+Vite)      │  │
│  └─────────────┘  └──────┬──────┘  └──────────┬──────────┘  │
│                          │                      │             │
└──────────────────────────┼──────────────────────┼─────────────┘
                           │                      │
                           ▼                      ▼
              ┌─────────────────────────────────────────┐
              │           SUPABASE PLATFORM              │
              │  ┌─────────────┐    ┌─────────────────┐  │
              │  │  PostgreSQL │    │ Edge Functions  │  │
              │  │  + RLS      │    │  (Deno/TS)      │  │
              │  └─────────────┘    └─────────────────┘  │
              │  ┌─────────────┐    ┌─────────────────┐  │
              │  │  Auth       │    │  Storage        │  │
              │  │  (OAuth+OTP)│    │  (Images/PDFs)  │  │
              │  └─────────────┘    └─────────────────┘  │
              │  ┌─────────────┐    ┌─────────────────┐  │
              │  │  Realtime   │    │  Vector/AI      │  │
              │  │  (WebSocket)│    │  (pgvector)     │  │
              │  └─────────────┘    └─────────────────┘  │
              └─────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────────────────────┐
              │           MERCADO PAGO                  │
              │      (Payments + Subscriptions)         │
              └─────────────────────────────────────────┘
```

### 2.2. Princípios Arquiteturais

1. **Multi-tenant por design:** Cada tabela possui `tenant_id`. RLS garante isolamento total.
2. **Backend-for-Frontend (BFF):** Edge Functions expõem APIs específicas por app.
3. **Event-driven:** Mudanças críticas disparam eventos (webhooks, realtime).
4. **CQRS leve:** Leituras otimizadas via views/materialized views. Escritas via RPC.
5. **Segurança em camadas:** RLS + JWT + input validation + rate limiting.

### 2.3. Camadas

| Camada | Responsabilidade | Tecnologia |
|--------|------------------|------------|
| Presentation | UI/UX, animações, estados locais | React, Tailwind, shadcn/ui, Framer Motion |
| Application | Orquestração, navegação, formulários | React Router, React Query, Zod |
| Domain | Regras de negócio, validações | TypeScript puro, Zod schemas |
| Infrastructure | Clientes HTTP, DB, storage, pagamento | Supabase Client, Mercado Pago SDK |
| Shared | Componentes, utilitários, tipos | packages/ui, packages/core |

---

## 3. Stack Detalhada

### 3.1. Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | ^19 | UI library |
| Vite | ^6 | Build tool |
| TypeScript | ^5.7 | Type safety |
| TailwindCSS | ^4 | Utility-first CSS |
| shadcn/ui | latest | Componentes base |
| Framer Motion | ^11 | Animações |
| React Router | ^7 | Roteamento (web/admin) |
| TanStack Query | ^5 | Server state |
| Zustand | ^5 | Client state |
| Zod | ^3 | Validação |
| React Hook Form | ^7 | Formulários |

### 3.2. Backend

| Tecnologia | Uso |
|------------|-----|
| Supabase | Plataforma backend-as-a-service |
| PostgreSQL | Banco relacional |
| Row Level Security | Isolamento multi-tenant |
| Edge Functions | Serverless compute (Deno) |
| Realtime | WebSocket para updates ao vivo |
| Storage | Arquivos (imagens, documentos) |
| pgvector | Embeddings para busca semântica/IA |

### 3.3. DevOps & Tooling

| Ferramenta | Uso |
|------------|-----|
| Vercel | Deploy frontend (preview + production) |
| Supabase CLI | Migrações, deploy functions, local dev |
| PNPM Workspaces | Monorepo management |
| Turbo | Build pipeline otimizada |
| Prettier | Formatação |
| ESLint | Linting |
| GitHub Actions | CI/CD |

---

## 4. Multi-Tenant

### 4.1. Modelo

Isolamento lógico via `tenant_id` em todas as entidades. Um único banco PostgreSQL serve múltiplos tenants com RLS garantindo que cada tenant só veja seus dados.

### 4.2. Entidades com tenant_id

- `tenants` — Registro do tenant (Dom Pietro Experience, etc.)
- `users` — Perfis de usuário (extensão de auth.users, sem tenant_id)
- `user_tenants` — Associações usuário-tenant (membership model V2)
- `bookings` — Reservas
- `booking_holds` — Holds de inventário
- `booking_passengers` — Passageiros por reserva
- `routes` — Rotas e experiências
- `route_categories` — Categorias de rotas
- `vehicles` — Frota
- `vehicle_slots` — Slots de inventário (inventory pool)
- `drivers` — Motoristas
- `served_lodgings` — Pousadas/atendidas
- `partners` — Parceiros (restaurantes, atrações)
- `payments` — Pagamentos (source of truth de status)
- `payment_events` — Eventos de pagamento (append-only)
- `invoices` — Faturas/financeiro
- `messages` — Comunicação
- `audit_logs` — Logs de auditoria (append-only)
- `booking_status_changes` — Mudanças de status (append-only)
- `webhook_deliveries` — Entregas de webhook (append-only)

### 4.3. RLS Pattern

```sql
-- Exemplo de política RLS V2
CREATE POLICY "tenant_isolation" ON bookings
  FOR SELECT
  USING (is_tenant_member(tenant_id));
```

### 4.4. Autenticação Multi-Tenant

- Membership via `user_tenants` (users não possui tenant_id diretamente)
- `is_tenant_member()` verifica associação ativa no tenant
- Convites por email/link com scope de tenant

---

## 5. Padrão Connect

### 5.1. Filosofia

> "Código limpo, visual premium, performance alta, experiência impecável."

### 5.2. Diretrizes

- **Mobile-first:** Breakpoints: base → sm(640) → md(768) → lg(1024) → xl(1280)
- **UX Premium:**
  - Transições de 150-300ms
  - Skeleton loaders
  - Toasts para feedback
  - Estados vivos (hover, active, focus)
  - Empty states ilustrados
- **Performance:**
  - Code splitting por rota
  - Imagens otimizadas (WebP, lazy)
  - Fonts com display=swap
  - Bundle size monitorado
- **Acessibilidade:**
  - ARIA labels
  - Contraste WCAG AA
  - Navegação por teclado
  - Reduced motion respeitado
- **Código:**
  - Composição > Herança
  - Hooks customizados para lógica compartilhada
  - Barrel exports (index.ts)
  - Absolute imports (@/components)

### 5.3. Convenções de Nomenclatura

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `BookingCard.tsx` |
| Hooks | camelCase com prefixo use | `useBooking.ts` |
| Utilitários | camelCase | `formatCurrency.ts` |
| Tipos/Interfaces | PascalCase com prefixo | `BookingFormData`, `UserRole` |
| Constants | UPPER_SNAKE_CASE | `MAX_BOOKING_DAYS` |
| Arquivos de teste | `.test.ts` ou `.spec.ts` | `BookingCard.test.tsx` |

---

## 6. Módulos V1 (MVP)

### 6.1. App do Hóspede (apps/web)

| Módulo | Funcionalidade |
|--------|---------------|
| Auth | Login por telefone/email (OTP), OAuth Google/Apple |
| Dashboard | Próximas reservas, resumo da estadia |
| Transfers | Agendar transfer, acompanhar motorista, histórico |
| Experiências | Catálogo de experiências, reserva, pagamento |
| Roteiros | Roteiros sugeridos, personalização |
| Concierge | Chat com concierge, solicitações |
| Pagamentos | Carteira, histórico, reembolsos |
| Perfil | Dados pessoais, preferências, dependentes |

### 6.2. Painel Admin (apps/admin)

| Módulo | Funcionalidade |
|--------|---------------|
| Dashboard | KPIs, gráficos, alertas |
| Agenda VAN | Calendário visual, drag-and-drop, otimização |
| Reservas | CRUD completo, filtros avançados, status |
| Hóspedes | Cadastro, histórico, segmentação |
| Frota | Veículos, manutenção, disponibilidade |
| Motoristas | Cadastro, escalas, avaliações |
| Experiências | Cadastro, preços, disponibilidade |
| Financeiro | Receitas, conciliação, relatórios |
| Comunicação | Templates, campanhas, notificações |
| Configurações | Tenant, integrações, usuários admin |

### 6.3. Landing Page (apps/landing)

| Seção | Descrição |
|-------|-----------|
| Hero | Value proposition, CTA principal |
| Serviços | Transfer, experiências, concierge |
| Como funciona | Passo a passo para hóspedes |
| Depoimentos | Reviews de hóspedes |
| Galeria | Fotos das experiências |
| Contato | Formulário, WhatsApp, localização |
| Footer | Links, redes sociais, políticas |

---

## 7. Roadmap Inicial

### Fase 0 — Foundation (Semanas 1-2)

- [x] Estrutura do monorepo
- [x] Setup CI/CD
- [x] Configuração Supabase local
- [x] Design system base (colors, typography, spacing)
- [x] Autenticação base (login/logout)

### Fase 1 — Core (Semanas 3-6)

- [x] Schema V2 completo e migrado
- [x] RLS policies e isolamento multi-tenant (49/49 testes)
- [x] Edge Functions operacionais (Hold, Webhook, Payment, Expiry)
- [x] Suite de testes runtime (concorrência, segurança, auditabilidade)
- [ ] CRUD de reservas (frontend UI)
- [ ] Agenda da VAN (calendário UI)
- [ ] App do hóspede (reservas e status)
- [ ] Painel admin (dashboard + reservas)
- [ ] Integração Mercado Pago (produção)

### Fase 2 — Frontend Foundation (v0.4.0)

- [ ] Connect Design System (@connect/ui)
- [ ] Shell multi-tenant (Guest, Admin, Landing)
- [ ] Integração Supabase Client Scaffolding
- [ ] Catálogo de experiências (Guest Flow)
- [ ] Agenda Operacional (Admin Flow)
- [ ] Concierge digital v1
- [ ] Notificações push/email
- [ ] Avaliações e reviews

### Fase 3 — Scale (Semanas 11-14)

- [ ] Onboarding de novos tenants
- [ ] White-label configurações
- [ ] Analytics avançado
- [ ] IA para recomendações
- [ ] App mobile (PWA / native)

---

## 8. Segurança & Compliance

- RLS em 100% das tabelas tenant-scoped
- HTTPS everywhere
- Dados sensíveis criptografados em repouso (AES-256)
- JWT com expiry curto + refresh tokens
- Rate limiting em APIs públicas
- GDPR/LGPD ready (consentimento, exportação, exclusão)
- Logs de auditoria para ações críticas

---

## 9. Métricas de Sucesso

| Métrica | Target V1 |
|---------|-----------|
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Time to First Byte | < 200ms |
| LCP | < 2.5s |
| Taxa de conversão reserva | > 15% |
| NPS hóspedes | > 50 |
| Uptime | > 99.9% |

---

*Última atualização: 2026-05-16*
*Versão do documento: 1.0*
