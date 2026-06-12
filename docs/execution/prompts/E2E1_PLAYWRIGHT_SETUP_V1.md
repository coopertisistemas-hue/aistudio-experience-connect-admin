# E2E1 — Playwright Setup + Smoke Tests

**Exec Agent:** Kimi  
**Orchestrator:** GPT-5.4 (DeepSeek)  
**Date:** 2026-06-12  
**Type:** Testing infrastructure

---

## Objective

Set up Playwright E2E testing and write smoke tests that validate all critical admin pages render correctly with live data.

---

## Scope

### 1. Install Playwright

```bash
pnpm add -D @playwright/test --filter @connect/web
pnpm exec playwright install chromium
```

Create `apps/web/playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Create Smoke Test Suite

Create `apps/web/e2e/smoke.spec.ts` with these tests:

#### 2.1 Login Page
- Navigate to `/login`
- Expect: heading "Login" or "Entrar" present
- Expect: email input field present
- Expect: OTP button present
- Expect: page title contains "Experience Connect" or "Dom Pietro"

#### 2.2 Admin — Dashboard
- Navigate to `/admin/dashboard`
- Expect: dashboard heading present
- Expect: KPI cards rendered (Reservas Hoje, Receita, etc.)
- Expect: no console errors

#### 2.3 Admin — Bookings
- Navigate to `/admin/bookings`
- Expect: page heading present
- Expect: filter bar rendered
- Expect: bookings table/grid renders rows (or empty state message)
- Expect: no console errors

#### 2.4 Admin — Payments
- Navigate to `/admin/payments`
- Expect: page heading present
- Expect: summary strip with KPI cards
- Expect: payments list renders (or empty state)
- Expect: no console errors

#### 2.5 Admin — Routes
- Navigate to `/admin/routes`
- Expect: page heading present
- Expect: routes grid renders
- Expect: no console errors

#### 2.6 Admin — Vehicles
- Navigate to `/admin/vehicles`
- Expect: page heading present
- Expect: vehicles grid renders
- Expect: no console errors

#### 2.7 Admin — Drivers
- Navigate to `/admin/drivers`
- Expect: page heading present
- Expect: drivers grid renders
- Expect: no console errors

#### 2.8 Admin — Agenda
- Navigate to `/admin/agenda`
- Expect: page heading present
- Expect: calendar/agenda view renders
- Expect: no console errors

#### 2.9 Admin — Navigation Sidebar
- Navigate to `/admin/dashboard`
- Expect: sidebar navigation present
- Expect: all main nav links visible (Dashboard, Bookings, Payments, Routes, Vehicles, Drivers, Agenda)

#### 2.10 404 Page
- Navigate to `/nonexistent-page`
- Expect: 404 or "Page not found" message

### 3. Helper — Auth Bypass Strategy

Since tests require authentication, create `apps/web/e2e/helpers/auth.ts`:

```typescript
import { Page } from '@playwright/test';

/**
 * Bypasses login for E2E tests.
 * Strategy: visit /login, insert test OTP code, submit.
 * Or use a test user's session cookie.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  // Use test credentials configured in .env or Playwright env
  await page.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL || 'admin@dompietro.test');
  // Click OTP button
  await page.click('button:has-text("Enviar código")');
  // Wait for OTP input
  await page.waitForSelector('input[data-testid="otp-input"]');
  // Insert test OTP (configured in Supabase seed)
  await page.fill('input[data-testid="otp-input"]', '123456');
  await page.click('button:has-text("Confirmar")');
  // Wait for redirect to admin
  await page.waitForURL('**/admin/**');
}
```

### 4. Add test script to root package.json

```json
"test:e2e": "playwright test --config=apps/web/playwright.config.ts"
```

And to `apps/web/package.json`:
```json
"test:e2e": "playwright test"
```

### 5. Create .env.example for E2E

Create `apps/web/.env.e2e.example`:
```
E2E_ADMIN_EMAIL=admin@dompietro.test
E2E_OTP_CODE=123456
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

---

## Out of Scope

- Full booking flow E2E (requires payment integration)
- Visual regression tests (screenshots)
- Cross-browser testing (chromium only for now)
- CI integration (will be added in a future sprint)

---

## Constraints

- Tests must work with `pnpm dev` running locally
- Tests should pass even with empty DB (handle empty states)
- No hardcoded test data that depends on seed
- Use `data-testid` attributes where selectors are complex (prefer text/role selectors first)
- All tests wrapped in test.describe blocks for clean reporting

---

## Verification

```bash
pnpm exec playwright test --config=apps/web/playwright.config.ts
```

All 10 smoke tests must pass.

---

## Delivery

Report back with:
1. Files created (config, tests, helpers)
2. Test run results (which passed/failed)
3. Any blockers (auth flow, missing testids, etc.)
4. Recommendation for CI integration
