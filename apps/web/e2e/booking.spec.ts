import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Booking Flow (Landing)', () => {
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
      'supabase',
      'Failed to fetch',
      'NetworkError',
      'ERR_NAME_NOT_RESOLVED',
      'ERR_CONNECTION_REFUSED',
      'placeholder.supabase',
      'WebSocket',
      'Unexpected server response',
      'load routes',
      'load route',
      '429',
      'get-booking',
      'invokeEdgeFunction',
      'Edge Function',
      'getBooking',
    ];
    return expected.some((kw) => msg.toLowerCase().includes(kw.toLowerCase()));
  }

  test.describe('Booking Page — Route Detail → Reservar', () => {
    test('should display not-found for non-existent route (no backend)', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/roteiro/test-slug/reservar', { waitUntil: 'networkidle' });

      // Without a real Supabase backend, the route API call fails, showing 404
      const notFound = page.getByText('Roteiro não encontrado');
      await expect(notFound).toBeVisible({ timeout: 15000 });

      // Back link to home
      const backLink = page.getByRole('link', { name: /Voltar ao Início/i });
      await expect(backLink).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('Booking Status Page', () => {
    test('should render booking status page (found or not-found state)', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/reserva/test-booking-id', { waitUntil: 'networkidle' });

      // Breadcrumb
      await expect(page.getByText('Status da Reserva')).toBeVisible({ timeout: 15000 });

      // Either the status heading is visible (data loaded) or not-found is shown
      const statusHeading = page.getByRole('heading', { name: /Status da Reserva/i });
      const notFound = page.getByText('Reserva não encontrada');
      await expect(statusHeading.or(notFound)).toBeVisible({ timeout: 15000 });

      expect(errors).toEqual([]);
    });

    test('should display not-found for non-existent booking', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/reserva/invalid-id', { waitUntil: 'networkidle' });

      const notFound = page.getByText('Reserva não encontrada');
      await expect(notFound).toBeVisible({ timeout: 15000 });

      // Both the heading and the link with "Voltar ao Início" are present
      await expect(page.locator('text=Voltar ao Início').first()).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('Booking Confirm Page', () => {
    test('should render booking confirm page (found or not-found state)', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/reserva/test-booking-id/confirmacao', { waitUntil: 'networkidle' });

      // Breadcrumb
      await expect(page.getByText('Confirmação')).toBeVisible({ timeout: 15000 });

      // Either the details section or not-found state
      const notFound = page.getByText('Reserva não encontrada');
      const details = page.getByText('Detalhes da Reserva');
      await expect(notFound.or(details)).toBeVisible({ timeout: 15000 });

      expect(errors).toEqual([]);
    });

    test('should display not-found for non-existent booking', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/reserva/invalid-id/confirmacao', { waitUntil: 'networkidle' });

      const notFound = page.getByText('Reserva não encontrada');
      await expect(notFound).toBeVisible({ timeout: 15000 });

      await expect(page.locator('text=Voltar ao Início').first()).toBeVisible();

      expect(errors).toEqual([]);
    });
  });
});
