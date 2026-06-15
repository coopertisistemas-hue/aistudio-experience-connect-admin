import { test, expect } from '@playwright/test';

test.describe('Driver App — Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/login');
  });

  test('should render login page with OTP form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dom Pietro Driver');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Receber codigo de acesso');
  });

  test('should show loading spinner while checking auth', async ({ page }) => {
    await page.goto('http://localhost:3003/');
    await expect(page.locator('.animate-spin').first()).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('http://localhost:3003/');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should redirect from non-existent route to 404', async ({ page }) => {
    await page.goto('http://localhost:3003/rota-inexistente');
    await expect(page.locator('text=404')).toBeVisible({ timeout: 10000 });
  });

  test('should render login page with all structural elements', async ({ page }) => {
    await expect(page.locator('text=Dom Pietro Driver')).toBeVisible();
    await expect(page.locator('text=Acesse com seu email')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
