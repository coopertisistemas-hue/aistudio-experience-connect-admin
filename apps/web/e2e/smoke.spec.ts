import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Experience Connect Admin', () => {
  /**
   * Helper: collect console.error messages during a test.
   * Filters out expected Supabase/auth connectivity errors
   * which are inevitable without a local backend.
   */
  function collectErrors(page: import('@playwright/test').Page): string[] {
    const errors: string[] = [];
    page.on('pageerror', (err) => {
      if (!isExpectedError(err.message)) errors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isExpectedError(msg.text())) {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  function isExpectedError(msg: string): boolean {
    const expected = [
      '[AuthProvider]',
      'supabase',
      'Failed to fetch',
      'NetworkError',
      'ERR_NAME_NOT_RESOLVED',
      'ERR_CONNECTION_REFUSED',
      'placeholder.supabase',
      'WebSocket',
      'Unexpected server response',
    ];
    return expected.some((kw) => msg.toLowerCase().includes(kw.toLowerCase()));
  }

  /* ── 1. Login Page ── */
  test.describe('Login Page', () => {
    test('should render login form with heading, email input, and OTP tab', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/login', { waitUntil: 'networkidle' });

      await expect(page).toHaveTitle(/Experience Connect/);

      const heading = page.getByRole('heading', { name: /Acesse seu Painel Administrativo/i });
      await expect(heading).toBeVisible({ timeout: 15000 });

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      const otpTab = page.getByRole('button', { name: /Código Mágico/i });
      await expect(otpTab).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  /* ── 2. Auth Guard ── */
  test.describe('Auth Guard', () => {
    test('should redirect unauthenticated users from /admin/dashboard to /login', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/admin/dashboard', { waitUntil: 'networkidle' });
      await page.waitForURL('**/login', { timeout: 30000 });

      expect(errors).toEqual([]);
    });
  });

  /* ── 3-6. Admin Routes (parametrized) ── */
  const adminRoutes = [
    { path: '/admin/bookings', label: 'Bookings' },
    { path: '/admin/payments', label: 'Payments' },
    { path: '/admin/routes', label: 'Routes' },
    { path: '/admin/vehicles', label: 'Vehicles' },
    { path: '/admin/drivers', label: 'Drivers' },
  ];

  test.describe('Admin — Auth Guard', () => {
    adminRoutes.forEach(({ path, label }) => {
      test(`should redirect unauthenticated users from ${path} to /login (${label})`, async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForURL('**/login', { timeout: 30000 });

        expect(errors).toEqual([]);
      });
    });
  });

  /* ── 7. 404 Page ── */
  test.describe('404 Page', () => {
    test('should display 404 message for non-existent routes', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/nonexistent-page', { waitUntil: 'networkidle' });

      // Text is English because NotFound.tsx uses "This page has not been generated"
      // Keeping as-is to match the actual component output
      const heading = page.getByRole('heading', { name: 'This page has not been generated' });
      await expect(heading).toBeVisible({ timeout: 15000 });

      expect(errors).toEqual([]);
    });
  });

  /* ── 8. Navigation — Login page structure ── */
  test.describe('Navigation — Login Page Structure', () => {
    test('should display login page with all structural elements', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/login', { waitUntil: 'networkidle' });

      await expect(page).toHaveTitle(/Experience Connect/);
      const heading = page.getByRole('heading', { name: /Acesse seu Painel Administrativo/i });
      await expect(heading).toBeVisible({ timeout: 15000 });

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      const passwordTab = page.getByRole('button', { name: /E-mail e Senha/i });
      await expect(passwordTab).toBeVisible();

      const otpTab = page.getByRole('button', { name: /Código Mágico/i });
      await expect(otpTab).toBeVisible();

      const backButton = page.getByRole('button', { name: /Voltar ao início/i });
      await expect(backButton).toBeVisible();

      expect(errors).toEqual([]);
    });
  });
});
