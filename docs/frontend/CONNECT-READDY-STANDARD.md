# CONNECT READDY STANDARD

**Official Frontend Governance Standard for the Connect Ecosystem**

**Version:** 1.1.0  
**Status:** Active / Mandatory  
**Applies To:** All Connect ecosystem repositories, including but not limited to Dom Pietro Experience, Wine Connect, Guia Medico, and all future SaaS products, multi-tenant admin systems, guest applications, landing pages, and operational dashboards.  
**Enforcement:** AI orchestration agents (GPT, Readdy, Kimi, Codex, Gemini) and human contributors.

---

## 1. Purpose

### 1.1 Why This Standard Exists

The Connect ecosystem has matured into a reusable AI-assisted development framework. Without a unified frontend governance standard, every project risks divergent UX, inconsistent schema integration, duplicated engineering effort, and degraded operational safety. This document exists to eliminate that variance.

### 1.2 Ecosystem Reuse Goals

- **Accelerate delivery** on new SaaS products by reusing proven frontend patterns, component systems, and integration rules.
- **Eliminate re-invention** of layouts, navigation, multi-tenant logic, and CRUD flows across projects.
- **Standardize AI-assisted development** so that each orchestration agent operates within predictable, non-overlapping boundaries.
- **Reduce onboarding friction** for engineers, designers, and operators joining any Connect project.

### 1.3 Governance Goals

- Ensure every frontend decision is traceable, auditable, and reversible.
- Prevent unauthorized structural changes (shell, layout, navigation, backend mapping).
- Mandate schema-first implementation so the UI can never drift from the database truth.
- Guarantee that multi-tenant isolation is present by default, never opt-in.

### 1.4 Frontend Consistency Goals

- A user moving from Dom Pietro Experience to Wine Connect to Guia Medico must feel the same premium quality, spacing rhythm, and operational clarity.
- Common actions (create, edit, filter, switch organization, invite user) must behave identically.
- Visual language (cards, badges, tables, drawers, typography) must be ecosystem-wide, not project-specific.

### 1.5 Schema-First Philosophy

In the Connect ecosystem, the Supabase schema is the single source of truth. UI generation does not precede schema definition. Forms are not sketched before columns exist. Components are not built against mocked entities. The frontend is a **reflection** of the backend, not an invention of it.

---

## 2. Connect Frontend Philosophy

### 2.1 Premium UX

Every screen must feel intentional, polished, and trustworthy. Operators and end users must believe the system is enterprise-grade from the first interaction. There is no tolerance for "MVP UI" or "we'll fix it later" visual debt.

### 2.2 Clean UI

- Remove everything that does not serve the current task.
- Prefer whitespace and hierarchy over borders and dividers.
- Use color purposefully: status, action, danger, neutral. Never decorative.

### 2.3 Mobile-First

All layouts, tables, forms, and navigation must be designed for mobile viewports first, then scaled to desktop. "It works on desktop" is insufficient. Mobile is the default validation environment.

### 2.4 Operational Clarity

The UI must answer three questions within three seconds:
1. Where am I?
2. What can I do here?
3. What just happened?

Loading states, empty states, error states, and success feedback must be explicit and immediate.

### 2.5 Multi-Tenant by Default

Every frontend module must assume multi-tenancy. There is no single-tenant mode. Tenant context (`tenant_id`, `organization_id`) must flow through navigation, data fetching, filtering, and form submission automatically.

### 2.6 Backend-First Architecture

The frontend does not own data shapes. Edge Functions, database views, and RPC calls define the contract. The UI consumes that contract. The frontend may not reshape, flatten, or reinterpret backend payloads without documented, reviewed transformation layers.

### 2.7 Schema-First Implementation

Before any UI component is generated:
1. The migration must exist.
2. The table or view must be queryable.
3. The TypeScript types (generated from the schema) must be available.
4. RLS policies must be active.

### 2.8 Reusable Component Systems

- Use `packages/ui/` for cross-project design system primitives.
- Use `packages/core/` for business-logic hooks, utilities, and Supabase clients.
- Do not embed project-specific logic in shared packages without a `packages/config/` extension.

---

## 3. Official AI Orchestration Model

The Connect ecosystem uses a five-agent orchestration model. Each agent has defined responsibilities, inputs, outputs, and boundaries. Overlap is prohibited.

### 3.1 Agent Responsibilities

| Agent | Role | Responsibilities |
|-------|------|------------------|
| **GPT** | Orchestration | Defines sprint scope, assigns tasks, sequences milestones, coordinates handoffs between agents, and resolves ambiguity before implementation begins. |
| **Readdy** | Frontend Generation | Generates UI code from structured prompts. Produces React components, Tailwind classes, Shadcn/ui usage, and layout structures. Does not write backend logic. |
| **Kimi** | Engineering Implementation | Writes, edits, and wires frontend and backend code. Integrates Readdy output into the codebase. Implements hooks, types, and Supabase calls. Validates builds. |
| **Codex** | Audit / Review | Reviews code for compliance with this standard, architectural integrity, security posture, and minimal diff discipline. Acts as a gate before milestone transitions. |
| **Gemini** | Versioning / Governance | Manages version tags, changelog entries, release notes, and governance checkpoints. Tracks standard evolution and ensures documentation parity with code. |

### 3.2 Boundaries & Non-Overlapping Responsibilities

- **GPT does not write code.** It coordinates. If GPT produces code, Kimi must revalidate and reimplement it under this standard.
- **Readdy does not invent schema.** It generates UI against existing types and migrations. If a required field is missing, Readdy must flag it, not mock it.
- **Kimi does not redesign shells without authorization.** Layout changes require explicit sign-off from GPT and architectural review from Codex.
- **Codex does not implement.** It reviews, comments, and gates. Codex may request changes but does not commit fixes directly.
- **Gemini does not engineer.** It documents, versions, and governs. Gemini ensures the standard itself is versioned alongside the codebase.

### 3.3 Handoff Rules

1. GPT defines the sprint brief and routes it to Readdy or Kimi.
2. Readdy receives a structured prompt (Section 7) and returns UI code.
3. Kimi integrates Readdy output, wires Supabase calls, and runs the build.
4. Codex audits the resulting PR or branch before it merges or advances.
5. Gemini tags the release, updates the changelog, and records governance compliance.

---

## 4. Absolute Rules

The following rules are **non-negotiable**. Violation blocks release.

### 4.1 Layout & Shell

- **Never redesign existing shell/layout without explicit authorization.**
  - Sidebar, topbar, navigation hierarchy, and organization switcher are protected assets.
  - Changes require GPT scoping + Codex architectural review.

### 4.2 Backend Integrity

- **Never invent backend entities.**
  - If a table, column, enum, view, RPC, or Edge Function does not exist in the governed backend contract, the frontend may not reference it.
- **Never invent database fields.**
  - Forms must map to real columns. No hidden frontend-only state pretending to be persistent data.
- **Never mock disconnected backend structures.**
  - Do not build UI against JSON fixtures, localStorage objects, or hardcoded arrays that simulate a future schema.

### 4.3 Multi-Tenant Safety

- **Never bypass multi-tenant rules.**
  - Every query, mutation, and subscription must include tenant scope.
  - Global admin views are the only exception and must be explicitly marked.

### 4.4 Operational Security

- **Never expose operational-only Edge Functions.**
  - Functions intended for super-admin or maintenance use must not be callable from standard user UI routes.

### 4.5 Quality Gates

- **Never bypass QA gates.**
  - No feature merges without build pass, visual QA, responsive QA, tenant isolation QA, and authenticated smoke validation (Sections 10 and 11).

### 4.6 UX Anti-Patterns

- **Never create generic admin-template UX.**
  - No Bootstrap-style crowded dashboards.
  - No inconsistent spacing or typography.
  - No noisy gradients or decorative clutter.
  - The UI must feel custom, premium, and intentionally designed.

### 4.7 Authorization Boundaries

- **Never treat frontend checks as authorization.**
  - Hidden buttons, route guards, disabled actions, and client-side role checks improve UX but do not replace backend authorization.
  - RLS, authenticated backend contracts, and membership validation remain the final trust boundaries.

---

## 5. Supabase Schema-First Standard

### 5.1 Schema Is the Single Source of Truth

The Supabase database schema is the **authoritative contract** between backend and frontend. No UI component may be generated or merged unless the schema it depends on is already deployed and queryable.

### 5.2 UI Must Consume Real Schema

- All frontend types must be generated from the live Supabase schema (`supabase gen types`).
- No hand-rolled types that duplicate or approximate database shapes.
- If the schema changes, types must be regenerated before UI code is updated.

### 5.3 Migrations Must Be Reviewed Before UI Generation

- A migration file in `supabase/migrations/` must exist and be applied.
- RLS policies must be defined for the new table or column.
- Kimi must confirm schema availability before Readdy receives a prompt that references it.

### 5.4 Forms Must Map to Real Columns

- Every form field must have a corresponding database column.
- Field labels may differ from column names, but the mapping must be explicit.
- Foreign key dropdowns must query real related tables, not static options.

### 5.5 Enums Must Map to Real Enums

- Use PostgreSQL enums or lookup tables.
- UI select components must derive options from the database enum or reference table.
- No hardcoded option arrays for enum-like fields.

### 5.6 Foreign Keys Must Map to Real Relationships

- All relational dropdowns, nested tables, and detail views must use actual foreign key constraints.
- Use `supabase.from('table').select('*,related(*)')` patterns, not manual ID lookups.

### 5.7 Tenant ID Rules Are Mandatory

- Every tenant-scoped table must include `tenant_id` (or equivalent) as a non-nullable column unless a documented backend exception is approved.
- RLS policies must enforce `tenant_id` filtering on all operations.
- The frontend must inject `tenant_id` into queries implicitly via `packages/core/` hooks, never manually per component unless an approved exception documents why.

### 5.8 Audit Fields Are Mandatory

Every table must include:
- `created_at`
- `updated_at`
- `created_by` (where applicable)
- `updated_by` (where applicable)

UI must display these fields in detail views and audit logs. They must not be editable by end users.

### 5.9 No Frontend-Only Entities Allowed

- There is no "local state that acts like a table."
- There are no "draft records" that exist only in React state if they represent persistent entities.
- If it needs to persist, it belongs in the schema or in an approved backend-owned ephemeral contract.

### 5.10 CRUD Mapping Rules

| Action | Frontend Pattern | Backend Contract |
|--------|------------------|------------------|
| Create | Form submit -> insert flow | `insert()` or approved RPC with RLS enforced |
| Read | Table list, detail view, filters | `select()`, approved view, or approved RPC with tenant scope |
| Update | Inline edit or drawer form | `update()` or approved RPC with record scope and RLS |
| Delete | Confirm modal -> soft or hard delete | `delete()` or `update()` setting `deleted_at` under policy |

### 5.11 Relationship Rules

- One-to-many: master-detail tables, nested lists.
- Many-to-one: select dropdowns with search.
- Many-to-many: junction tables exposed as tag inputs or multi-selects.
- All relationships must be traversable in Supabase and reflected in generated types or approved transformation layers.

### 5.12 Validation Rules

- Database constraints (`NOT NULL`, `CHECK`, `UNIQUE`) are the primary validators.
- Frontend validation must mirror backend constraints.
- Do not add frontend-only validation that is stricter than the database unless explicitly required by product and documented.
- Display database error messages returned by Supabase, or map them to reviewed user-safe messages without losing the failure reason in logs.

### 5.13 Optimistic Update Rules

- Use optimistic updates only for actions whose failure semantics are well understood.
- Revert on error and surface the failure.
- Keep optimistic state scoped to the component or hook, not global unless justified.
- Do not use optimistic mutation for security-sensitive transitions unless backend reconciliation behavior is documented.

### 5.14 Realtime Readiness Expectations

- Tables that drive live UI must have realtime enabled when live updates are part of the product contract.
- Frontend must subscribe via `supabase.channel()` and update local cache on `postgres_changes` events.
- Unsubscribe on unmount and on tenant context change.

---

## 6. Multi-Tenant Frontend Rules

### 6.1 Tenant-Aware Navigation

- The sidebar and topbar must display the current organization/tenant name.
- Navigation items may be hidden or shown based on tenant features (feature flags stored per tenant).

### 6.2 Organization Switching

- A visible organization switcher must exist in the shell unless a documented shell exception is approved.
- Switching must clear client-side caches, refetch user context, invalidate persisted tenant-scoped data, and redirect to the tenant-appropriate landing page.
- Do not retain stale data from the previous tenant in memory, local cache, or background subscriptions.

### 6.3 Tenant-Scoped Datasets

- Every list, table, chart, and report must be filtered by the active tenant.
- The tenant filter must be implicit in data hooks, not an optional UI toggle.

### 6.4 Tenant-Scoped Filters

- Global search and filters must respect tenant boundaries.
- Admin-level cross-tenant views are separate routes, explicitly marked, and protected by role checks and backend authorization.

### 6.5 Role-Aware UI

- Hide actions the user cannot perform when doing so improves operational clarity.
- Disable buttons when the user lacks permission, with tooltip explanation where appropriate.
- Do not show forbidden-action failures as default user journeys.
- UI gating is advisory only; backend authorization remains mandatory.

### 6.6 Guest Isolation

- Guest users (unauthenticated or invite-pending) must see only public or explicitly guest-scoped routes.
- Guest navigation must be minimal and clearly branded.

### 6.7 Admin / Operator / Super Admin Distinctions

| Role | UI Behavior |
|------|-------------|
| **Guest** | Public routes, read-only public data, branded entry points |
| **User** | Tenant-scoped CRUD on assigned modules |
| **Operator** | Tenant-scoped CRUD + user management + reporting |
| **Admin** | Tenant configuration, billing access, advanced settings |
| **Super Admin** | Cross-tenant views, system settings, operational dashboards (separate shell if needed) |

---

## 7. Readdy Prompt Structure Standard

Readdy receives structured prompts. All prompts must follow this template to ensure predictable, high-quality output.

### 7.1 Required Prompt Sections

```txt
# Readdy Prompt - [Module/Page Name]

## Context
- Project: [Connect product name]
- Sprint: [Sprint ID]
- Schema Version: [Migration file or tag]
- Existing Layout: [Sidebar/Topbar version reference]
- Tech Stack: React + Tailwind + Shadcn/ui + Supabase

## Objective
[One-sentence goal. e.g., "Create the reservation list view with inline status updates."]

## Route / Page
- Path: `/app/reservations`
- Parent layout: `AppShell`
- Required auth: `operator` or higher

## Existing Layout Preservation
- Sidebar: preserve current navigation hierarchy
- Topbar: preserve organization switcher, user menu, notifications
- Do not modify shell spacing, colors, or typography

## KPIs
[If applicable, describe summary cards or stats to display. Map to real columns.]

## Tables
- Table name: `reservations`
- Columns to display: [list real columns]
- Sortable: [yes/no per column]
- Filterable: [yes/no per column]
- Actions per row: [edit, delete, view]
- Pagination: [cursor-based or offset]

## Forms
- Form purpose: [create / edit]
- Fields: [map each field to a real column, type, and validation]
- Submit action: [insert / update RPC]
- Error handling: display Supabase error inline

## Drawers / Modals
- Trigger: [button or row action]
- Content: [form or detail view]
- Width: [default / wide / full]
- Close behavior: [confirm if dirty]

## Actions
- Primary: [create button -> drawer]
- Secondary: [export, filter toggle]
- Bulk: [if applicable]

## Multi-tenant Rules
- Tenant scope column: `tenant_id`
- RLS enforced: yes
- Admin override route: none / `/admin/reservations`

## Audit Block
- Display `created_at`, `updated_at` in detail view
- Show `created_by` user name (join to `profiles`)

## QA Requirements
- Responsive down to 375px
- Loading skeleton for table
- Empty state with CTA
- Error state with retry
- Form validation inline
- Optimistic update on status change

## Deliverables
- Component file(s)
- Hook file(s) if custom data logic
- Type imports from generated Supabase types
- No layout changes
- No mock data
```

### 7.2 Prompt Discipline

- Readdy must not deviate from the provided prompt structure.
- If a prompt is missing schema references, Readdy must reject it and request migration details.
- Readdy must never invent fields, tables, views, RPCs, or relationships not listed in the prompt.

---

## 8. Readdy Output Validation Rules

Prompt quality alone is insufficient. Readdy-generated output must pass acceptance review before integration.

### 8.1 Mandatory Acceptance Review

Before Kimi integrates Readdy output, the following must be validated:
- Schema alignment against the referenced migration, table, view, enum, or RPC.
- Route authorization alignment against the required role in the prompt.
- Shell preservation against the current protected shell assets.
- Tenant isolation behavior in data hooks, route assumptions, and action visibility.
- Form-field mapping against real backend columns or approved contract fields.
- Generated type alignment against current Supabase-generated TypeScript types.
- Supabase integration feasibility for queries, mutations, subscriptions, and auth headers.
- CRUD alignment with the stated backend contract.
- Auth-bound action visibility for create, edit, delete, billing, and admin controls.

### 8.2 Required Integration Review

Kimi must document, at minimum:
- Which generated files were accepted as-is.
- Which generated files required integration edits.
- Which prompt assumptions were not directly implementable.
- Which backend contracts were consumed.
- Whether shell, role, and tenant rules remained intact after integration.

### 8.3 Rejection Conditions

Readdy output must be rejected and regenerated or manually reworked if any of the following occur:
- Invented schema fields, tables, relationships, views, RPCs, or Edge Functions.
- Unauthorized shell changes.
- Unclear tenant scope.
- Component behavior that depends on frontend-only persistence pretending to be backend truth.
- Missing generated type usage where required.
- Route access that does not match the prompt.
- Actions visible to unauthorized roles without explicit reason.
- CRUD flows that do not map to an approved backend contract.

### 8.4 Auditability Requirement

- Readdy prompts and final accepted output references must be stored in the PR description, linked work item, or documented sprint artifact.
- A reviewer must be able to reconstruct which prompt version produced which integrated UI.

---

## 9. Connect Visual Standard

### 9.1 Premium Visual Language

- The UI must feel like a modern SaaS product, not an admin template.
- Favor subtle shadows, rounded corners, and clean borders over heavy chrome.
- Use neutral backgrounds with purposeful accent colors.

### 9.2 Clean Layouts

- Maximize content area. Minimize decorative frames.
- Use grid and flexbox intentionally. Avoid arbitrary absolute positioning.
- Content hierarchy must be readable without color (test in grayscale).

### 9.3 Spacing Philosophy

- Base unit: 4px or 8px scale.
- Consistent vertical rhythm: 16px, 24px, 32px, 48px.
- No arbitrary magic numbers. Use design token values.
- Whitespace is a feature, not a bug.

### 9.4 Typography Rules

- Use a single font family ecosystem-wide (unless product branding requires otherwise).
- Scale: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl` with defined line heights.
- Headings must have clear weight differentiation from body text.
- Monospace for IDs, timestamps, and code.

### 9.5 Cards

- Use cards for self-contained modules (KPIs, forms, detail summaries).
- Consistent padding (typically 24px).
- Optional header with title and action.
- No nested cards unless absolutely necessary.

### 9.6 Badges

- Use for status, role, and category indicators.
- Limited color palette: success, warning, danger, info, neutral.
- No gradient badges.

### 9.7 Tables

- Clean header with light background separation.
- Row hover state.
- Actions in an explicit column or overflow menu.
- Sticky header for long lists.
- Horizontal scroll on mobile, never squashed columns.

### 9.8 Drawers

- Slide from right (default) or bottom (mobile).
- Overlay with backdrop blur or dim.
- Fixed header and footer, scrollable body.
- Width: 480px (default), 640px (wide), full-screen (mobile).

### 9.9 Responsive Behavior

- Mobile-first breakpoints: `sm`, `md`, `lg`, `xl`.
- Tables become horizontally scrollable or card lists on mobile.
- Drawers become bottom sheets on mobile.
- Sidebar becomes collapsible or hidden behind hamburger on mobile.

### 9.10 Mobile-First Expectations

- Design and test on 375px width before desktop.
- Touch targets minimum 44x44px.
- No hover-dependent interactions on mobile.
- Reduce form density: stack fields, use full-width inputs.

### 9.11 Explicitly Prohibited

| Prohibition | Rationale |
|-------------|-----------|
| Generic Bootstrap look | Undermines premium brand perception |
| Crowded dashboards | Violates operational clarity |
| Inconsistent spacing | Breaks visual rhythm and trust |
| Heavy enterprise UI | Slows cognitive processing |
| Noisy gradients | Distracts from content and actions |
| Arbitrary color usage | Destroys semantic meaning |
| Overuse of borders | Creates visual clutter; prefer whitespace |

---

## 10. Frontend QA Governance

QA is not optional. Every release candidate must pass the following gates.

### 10.1 Gate Classification

- **Automated gates:** build, typecheck, lint, route-level smoke where available, and repeatable contract validation checks.
- **Manual gates:** visual review, responsive review, operational UX review, and exception verification where automation does not fully cover behavior.
- A release candidate is incomplete if either automated or manual required gates are missing.

### 10.2 Visual QA

- [ ] No visual regressions against baseline screenshots (where available).
- [ ] Color contrast meets WCAG 2.1 AA minimum.
- [ ] No broken layouts at any breakpoint.
- [ ] Icons and imagery render correctly.

### 10.3 Responsive QA

- [ ] Verified on 375px, 768px, 1024px, 1440px.
- [ ] Tables scroll or stack correctly.
- [ ] Drawers adapt to bottom sheets.
- [ ] Navigation collapses or hides appropriately.

### 10.4 Sidebar / Navigation QA

- [ ] All links route correctly.
- [ ] Active state matches current route.
- [ ] Organization switcher refreshes data.
- [ ] Hidden items correspond to role permissions.

### 10.5 Form Validation QA

- [ ] Required fields block submission when empty.
- [ ] Invalid formats show inline errors.
- [ ] Database errors surface without crashing.
- [ ] Submit button disables during pending state.

### 10.6 Loading / Empty / Error States

- [ ] Skeleton screens for async content.
- [ ] Empty state with contextual CTA (not just "No data").
- [ ] Error state with message and retry action.
- [ ] No infinite spinners on failure.

### 10.7 Build Validation

- [ ] `pnpm build` passes with zero errors.
- [ ] TypeScript compilation succeeds.
- [ ] ESLint passes with project config.
- [ ] No unused imports or variables.

### 10.8 Tenant Isolation QA

- [ ] User A in Tenant X cannot see Tenant Y data.
- [ ] Switching tenants clears prior data.
- [ ] RLS errors are not exposed as UI state leaks.
- [ ] Persisted tenant-scoped cache does not leak across tenant switches or restored sessions.

### 10.9 Supabase Integration QA

- [ ] All queries use generated types where applicable.
- [ ] No hardcoded IDs in production code.
- [ ] Realtime subscriptions update UI correctly.
- [ ] Edge Function calls include auth headers and expected tenant context.

### 10.10 i18n QA

- [ ] All user-facing strings are translatable.
- [ ] No concatenated strings with variables (use interpolation).
- [ ] Dates and numbers formatted per locale.

### 10.11 Accessibility Baseline

- [ ] All interactive elements keyboard accessible.
- [ ] Focus indicators visible.
- [ ] ARIA labels on icon-only buttons.
- [ ] Screen-reader friendly table headers.

---

## 11. Authenticated Smoke Flow Requirements

These flows are governance-critical for Connect ecosystem products and must be validated on release candidates.

### 11.1 Required Smoke Flows

- Login succeeds for an authorized user.
- Session restore works after refresh or app reopen.
- Protected routes reject unauthenticated access.
- Tenant switch updates visible context and data scope.
- Role-restricted actions render only for eligible users.
- Forbidden access resolves to a reviewed UX state and not to raw backend failures.
- Logout clears sensitive client state and prevents access to previously loaded protected content.
- Token expiration or invalid session state results in safe re-authentication or safe session failure handling.
- Realtime subscriptions reconnect safely after temporary disconnect and remain tenant-scoped.

### 11.2 Minimum Smoke Evidence

- Route or flow list validated.
- Environment used for validation.
- User role(s) used during validation.
- Result of each flow: pass, fail, or blocked.
- Linked evidence artifact for failures or notable conditions.

### 11.3 Failure Handling

- A failure in any required authenticated smoke flow blocks release unless a documented emergency exception is approved under Section 16.

---

## 12. Compliance Evidence & Audit Artifacts

This standard is enforceable only when compliance is evidenced. Every governed change must produce reviewable artifacts.

### 12.1 Mandatory PR Evidence

Each governed PR must include, in the PR description or linked implementation artifact:
- Scope summary.
- Referenced migration filename(s), schema tag, or backend contract reference.
- Generated type reference or regeneration confirmation.
- Routes affected.
- Tenant and role scope affected.
- QA checklist reference.
- Readdy prompt/output reference when applicable.
- Exception reference when applicable.

### 12.2 Frontend QA Evidence

Required QA evidence includes:
- Screenshots or equivalent visual artifacts for changed screens or states.
- Responsive validation notes for required breakpoints.
- Build, typecheck, and lint outcomes.
- Authenticated smoke flow results.
- Accessibility and i18n notes where relevant to the change.

### 12.3 Tenant Isolation Evidence

Changes affecting data scope, auth, routing, org switching, or shared hooks must include evidence of:
- Tenant-scoped dataset validation.
- Organization-switch isolation behavior.
- Role-bound action visibility.
- Absence of stale data across tenant context changes.

### 12.4 Schema Alignment Evidence

Changes affecting forms, tables, filters, CRUD flows, or data hooks must include:
- Referenced migration file(s) or approved contract document.
- Generated type file reference or regeneration timestamp.
- Mapping confirmation between UI fields and backend columns/contracts.
- RLS or backend authorization acknowledgment when tenant-sensitive.

### 12.5 Release Approval Evidence

Before milestone advancement, the release artifact set must include:
- Codex audit decision.
- QA completion status.
- Release notes link.
- Changelog link.
- Version identifier.
- Known issues and rollback note if applicable.

### 12.6 Codex Audit Evidence

Codex audit output must record:
- Audit date.
- Scope reviewed.
- Decision: approved, approved with conditions, or blocked.
- Blocking issues or conditions.
- Required follow-ups, if any.

### 12.7 Gemini Versioning Evidence

Gemini-owned governance/versioning work must record:
- Version tag created or updated.
- Changelog section updated.
- Release notes published.
- Governance document version changes where applicable.

### 12.8 Artifact Retention

- Evidence must remain accessible from the merged PR, sprint record, or release record.
- Missing evidence is a governance failure even if the code appears correct.

---

## 13. Backend Contract Evolution Policy

Schema-first governance applies not only to tables, but to all backend contracts consumed by the frontend.

### 13.1 Governed Contract Types

The following are governed backend contracts:
- Tables and views.
- RPCs and stored procedures.
- Edge Functions.
- Generated TypeScript types.
- Realtime payload shapes.
- Approved transformation layers that adapt backend output for frontend consumption.

### 13.2 Ownership

- Every governed contract must have an accountable owner or owning team.
- Ownership must be inferable from repository structure, docs, or linked work items.
- Unowned contracts may not be expanded casually by frontend implementation.

### 13.3 Versioning Expectations

- Contract changes that alter shape, semantics, required fields, or authorization assumptions must be versioned or documented with equivalent rigor.
- The frontend must reference the intended contract version, migration file, or release tag when implementing against a changing backend surface.

### 13.4 Backward Compatibility

- Breaking changes to views, RPCs, Edge Functions, or realtime payloads must be explicitly declared.
- If multiple frontends or staged releases depend on the same contract, backward compatibility or a controlled migration window is required.
- Silent contract breakage is prohibited.

### 13.5 Deprecation Rules

- Deprecated contracts must be marked in documentation and linked implementation records.
- A replacement contract, sunset expectation, and frontend impact note must be documented before removal.
- Frontend references to deprecated contracts must be scheduled for cleanup and tracked.

### 13.6 Frontend Impact Review

Before merging a contract change that can affect the UI, review must cover:
- Generated type impact.
- Affected routes, modules, or hooks.
- Tenant-scope or authorization impact.
- QA and smoke-flow impact.
- Realtime subscription impact where applicable.

### 13.7 Migration Expectations

- Contract evolution must ship with the required migration, deployment, and rollout sequencing notes.
- The frontend may not merge against a future contract that is not yet available in the intended environment unless a staged rollout exception is documented.

### 13.8 Transformation Layer Governance

- Transformation layers must be documented, minimal, and reviewable.
- They may clarify backend output for UI consumption but may not invent business entities or authorization assumptions.
- Transformation layers must live in reviewed shared/frontend logic, not ad hoc inside leaf components.

---

## 14. Trusted Tenant Context & Authorization Boundaries

This section defines the trust model for all multi-tenant frontend behavior.

### 14.1 Trusted Tenant Context Source

- Tenant context must never originate solely from frontend-controlled values.
- Route params, query params, local state, localStorage, sessionStorage, cookies writable by frontend code, and URL fragments are not authoritative by themselves.
- Authoritative tenant context must come from trusted auth/session state, validated membership context, or backend-approved tenant resolution flows.

### 14.2 Authorization Boundaries

- Frontend role checks, hidden actions, disabled buttons, and route guards do not authorize anything by themselves.
- RLS remains the final data trust boundary for database access.
- Edge Functions must validate membership, role, and tenant authorization independently of the caller UI.
- RPCs, views, and privileged backend contracts must preserve the same trust boundary assumptions as direct table access.

### 14.3 Tenant Resolution Rules

- If the UI allows selecting or switching organizations, the resulting tenant context must be validated against the authenticated user's allowed memberships.
- Client-provided tenant identifiers may assist navigation but may not override backend membership truth.
- Cross-tenant routes must use explicit privileged roles and backend authorization checks.

### 14.4 Org-Switch Isolation

- Tenant switching must invalidate memory cache, persisted cache, optimistic state, and relevant background queries tied to the previous tenant.
- Pending mutations from the previous tenant context must be cancelled, retried safely under validated new context, or blocked from leaking across tenants.
- The active screen must not continue to render old-tenant data after the switch completes.

### 14.5 Multi-Tab and Restored Session Expectations

- Restored sessions must re-resolve tenant context before protected data renders.
- Where the app supports multi-tab usage, tenant context synchronization must not cause hidden data bleed between tabs.
- Persisted cache hydration must verify that cached data belongs to the active validated tenant context.

### 14.6 Subscription Isolation

- Background subscriptions, realtime channels, and polling jobs must be scoped to the active validated tenant context.
- Subscriptions must be torn down and re-established on tenant change when required by the product flow.
- Reconnect logic must not resubscribe to outdated tenant channels.

### 14.7 Failure Expectations

- Unauthorized tenant resolution must fail closed.
- The UI must not infer access merely because route structure suggests a tenant.
- Backend authorization failures must resolve to reviewed UX states without exposing privileged dataset hints.

---

## 15. Release & Governance Rules

### 15.1 Frontend Phases Must Be Versioned

Every frontend phase or milestone receives a semantic version bump:
- `x.y.z` where `x` is product-major, `y` is feature-phase, `z` is patch/hotfix.
- Version must be recorded in `docs/versions/` and `package.json` where applicable.

### 15.2 Codex Audit Required Before Milestone Transitions

- No phase may advance from `development` -> `staging` or `staging` -> `production` without Codex audit.
- Audit covers: compliance with this standard, security, minimal diff, required evidence, and QA gate passage.
- Codex may block, request changes, or approve with conditions.

### 15.3 Gemini Versioning Mandatory

- Gemini creates version tags, release notes, and changelog entries.
- Changelog format: Keep a Changelog (Unreleased / Added / Changed / Fixed / Removed).
- Release notes must reference sprint IDs, schema migration versions, and QA checklists.

### 15.4 Release Notes Required

Release notes must include:
- Summary of features.
- Schema changes (migration filenames).
- UI changes (routes, components).
- Breaking changes.
- Known issues.
- Rollback instructions.

### 15.5 Changelog Updates Required

- `CHANGELOG.md` at repository root must be updated before tag creation.
- Unreleased section accumulates changes during the sprint.
- Gemini moves items to versioned sections on release.

### 15.6 Governance Checkpoints Required

Each phase ends with a governance checkpoint:
1. **Schema Checkpoint:** Migrations reviewed, RLS active, types generated.
2. **UI Checkpoint:** Readdy output integrated, acceptance review passed, build passes, visual QA signed off.
3. **Integration Checkpoint:** Supabase queries wired, tenant isolation verified, authenticated smoke flows passed.
4. **Audit Checkpoint:** Codex review passed with evidence captured.
5. **Release Checkpoint:** Gemini versioned, changelog updated, notes published.

---

## 16. Governance Precedence & Exception Handling

This section prevents ambiguity when multiple governance sources apply.

### 16.1 Precedence Order

When multiple governance documents apply, precedence is:
1. Approved emergency exception for the specific change window.
2. Repository root `AGENTS.md`.
3. Ecosystem-critical standards such as this document.
4. Project-specific frontend or architecture guidance.
5. Task-level implementation notes, sprint briefs, or prompt instructions.

No lower-precedence artifact may silently override a higher-precedence one.

### 16.2 Exception Approval Authority

- Routine exceptions require explicit approval from the repository authority defined by `AGENTS.md` plus Codex review when the exception affects this standard.
- Multi-tenant, authorization, shell, schema-contract, or release-gate exceptions require Codex visibility before merge.
- Governance-document exceptions that alter ecosystem behavior require Gemini documentation on approval.

### 16.3 Exception Documentation

Every exception must record:
- Scope.
- Reason.
- Approver.
- Affected routes/modules/contracts.
- Start date.
- Expiration or review date.
- Required revalidation condition.

### 16.4 Emergency Hotfix Rules

- Emergency hotfixes may compress sequence but may not waive trust boundaries.
- Build integrity, tenant isolation, and authorization safety remain mandatory.
- Post-hotfix governance revalidation must occur before the next milestone transition.

### 16.5 Temporary Exception Expiration

- Temporary exceptions must carry an explicit expiration or next-review date.
- Expired exceptions are invalid and must not remain as implicit precedent.

### 16.6 Revalidation Requirement

- Any exception touching tenant isolation, auth, shell, contract evolution, or release governance must be revalidated when the affected area changes again.
- Revalidation evidence must be linked from the new change record.

---

## 17. Governance Change Management

This standard itself is governed and must evolve in a controlled manner.

### 17.1 Change Triggers

Updates to this standard may be triggered by:
- Repeated audit findings.
- New ecosystem architecture patterns.
- Multi-tenant safety lessons.
- Backend contract evolution needs.
- Changes in AI-assisted development workflow.

### 17.2 Approval Model

- Proposed governance changes must be reviewed by Codex and versioned by Gemini.
- Changes that alter ecosystem-wide workflow, release gates, or trust boundaries require explicit approver visibility in the change record.

### 17.3 Versioning Expectations

- This document follows semantic versioning.
- Patch changes clarify wording without changing enforcement meaning.
- Minor changes add new governance requirements or sections without redefining the core philosophy.
- Major changes alter governance philosophy, lifecycle, or ecosystem obligations.

### 17.4 Audit Requirement for Governance Updates

- Governance changes must include rationale, impacted sections, migration expectation for repositories, and effective date.
- A governance update without an audit trail is incomplete.

### 17.5 Deprecation of Old Rules

- Deprecated governance rules must be marked, versioned, and given a replacement path.
- Legacy rules may coexist temporarily only when the expiration and migration path are explicit.

### 17.6 Governance Release Process

Each governance update must produce:
- Document version update.
- Appendix changelog entry.
- Effective date.
- Next review date.
- Communication artifact or reference for affected repositories.

---

## 18. Recommended Repository Structure

All Connect ecosystem repositories should organize documentation and code as follows:

```txt
docs/
  frontend/
    CONNECT-READDY-STANDARD.md   # This document
    [product]-ui-guide.md        # Product-specific UI guidance
  architecture/
    OVERVIEW.md
    [domain]-architecture.md
  database/
    schema-guide.md
    migration-policy.md
  versions/
    v1.0.0.md
    v1.1.0.md

packages/
  ui/              # Design system primitives (Button, Card, Table, Drawer, etc.)
  core/            # Business logic hooks, Supabase clients, utilities
  config/          # Shared Tailwind, ESLint, TypeScript configs

apps/
  web/             # Main web application
  admin/           # Admin dashboard (if separate shell)
  landing/         # Marketing / guest-facing site

supabase/
  migrations/      # Forward-only migrations
  functions/       # Edge Functions
  seed.sql         # Development seed data
```

### 18.1 Documentation Placement Rules

- Ecosystem standards live in `docs/frontend/` and `docs/architecture/`.
- Product-specific guides live alongside standards but must not override them.
- Database documentation lives in `docs/database/` and references migrations by filename.
- Version records live in `docs/versions/`.

---

## 19. Future Ecosystem Reuse

### 19.1 Future SaaS Projects

New products (e.g., future Connect marketplace modules, vertical SaaS tools) inherit this standard on day one. Onboarding a new repository means:
1. Copy this standard into `docs/frontend/`.
2. Configure `packages/ui/` and `packages/core/` from existing ecosystem packages.
3. Apply the AI orchestration model immediately.

### 19.2 Operational Reuse

- Operators trained on one Connect product understand all Connect products.
- Support documentation, help center articles, and onboarding flows reuse common patterns.
- Reduces training cost and support ticket volume.

### 19.3 Frontend Acceleration

- Readdy prompt templates are reusable across projects.
- Common pages (user list, settings, invites, billing) have pre-validated prompt recipes.
- Kimi integration patterns (hooks, auth, tenant injection) are reusable.

### 19.4 AI-Assisted Development Consistency

Because every agent operates from the same governance document:
- GPT scopes sprints consistently.
- Readdy generates UI predictably.
- Kimi wires code uniformly.
- Codex audits against a single standard.
- Gemini versions and documents systematically.

### 19.5 Ecosystem Scaling

As the Connect ecosystem grows from three products to ten, this standard ensures:
- No quality degradation.
- No architectural drift.
- No retraining of AI agents per project.
- No duplicate governance effort.

The standard itself is versioned and evolves via Gemini governance, ensuring continuous improvement without chaos.

---

## Appendix A: Document Control

| Field | Value |
|-------|-------|
| Document ID | CONNECT-READDY-STANDARD |
| Version | 1.1.0 |
| Author | Connect Frontend Governance |
| Reviewer | Codex |
| Approver | GPT + Gemini |
| Effective Date | 2026-05-17 |
| Next Review | 2026-08-17 |

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2026-05-17 | Codex | Governance hardening pass: audit artifacts, precedence, contract evolution, tenant trust boundaries, Readdy output validation, authenticated smoke flows, governance change management, publication-quality cleanup |
| 1.0.0 | 2026-05-17 | Kimi | Initial publication |

---

*This document is the official frontend governance standard of the Connect ecosystem. All projects, contributors, and AI orchestration agents must comply. Violations must be escalated under repository governance authority, audited by Codex where required, and documented through the applicable evidence path in this standard.*
