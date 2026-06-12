import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Landing (Public Site)', () => {
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
      'submit contact',
      '429',
    ];
    return expected.some((kw) => msg.toLowerCase().includes(kw.toLowerCase()));
  }

  test.describe('Home Page', () => {
    test('should load with hero section and catalog heading', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/', { waitUntil: 'networkidle' });

      await expect(page).toHaveTitle(/Dom Pietro Experience/);

      const heroHeading = page.getByRole('heading', { name: /Dom Pietro/ });
      await expect(heroHeading).toBeVisible({ timeout: 15000 });

      const catalogHeading = page.getByRole('heading', { name: /Nossas Experiências/ });
      await expect(catalogHeading).toBeVisible({ timeout: 15000 });

      expect(errors).toEqual([]);
    });

    test('should render header navigation links', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/', { waitUntil: 'networkidle' });

      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: 'Início' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Experiências' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Contato' })).toBeVisible();

      expect(errors).toEqual([]);
    });

    test('should render catalog section (loading or empty state OK)', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/', { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { name: /Nossas Experiências/ })).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('Footer', () => {
    test('should render with links and contact info', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/', { waitUntil: 'networkidle' });

      await expect(page.getByText(/Dom Pietro Experience/)).toBeVisible();
      await expect(page.getByText(/contato@dompietro.com/)).toBeVisible();
      await expect(page.getByText(/\+55 \(11\) 99999-9999/)).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('404 Page', () => {
    test('should display 404 error message for non-existent routes', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/pagina-inexistente', { waitUntil: 'networkidle' });

      const heading404 = page.getByRole('heading', { name: '404' });
      await expect(heading404).toBeVisible({ timeout: 15000 });

      const msg = page.getByText('Página não encontrada');
      await expect(msg).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('Contact Page', () => {
    test('should load with form fields', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/contato', { waitUntil: 'networkidle' });

      await expect(page).toHaveTitle(/Fale Conosco/);

      const heading = page.getByRole('heading', { name: /Fale Conosco/ });
      await expect(heading).toBeVisible({ timeout: 15000 });

      const nameInput = page.locator('input[placeholder="Seu nome"]');
      await expect(nameInput).toBeVisible();

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      const phoneInput = page.locator('input[type="tel"]');
      await expect(phoneInput).toBeVisible();

      const subjectInput = page.locator('input[placeholder="Ex: Orçamento, Dúvida..."]');
      await expect(subjectInput).toBeVisible();

      const messageTextarea = page.locator('textarea[placeholder="Escreva sua mensagem..."]');
      await expect(messageTextarea).toBeVisible();

      const submitButton = page.getByRole('button', { name: /Enviar Mensagem/ });
      await expect(submitButton).toBeVisible();

      expect(errors).toEqual([]);
    });
  });

  test.describe('Route Detail Page', () => {
    test('should load and handle API error gracefully (loading or error state)', async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto('/roteiro/test-slug', { waitUntil: 'networkidle' });

      const loadingOrError = page.getByText('Roteiro não encontrado')
        .or(page.getByText('Erro ao carregar roteiro'))
        .or(page.locator('.animate-pulse').first());

      await expect(loadingOrError).toBeVisible({ timeout: 15000 });

      expect(errors).toEqual([]);
    });
  });
});
