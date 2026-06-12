import { Page } from '@playwright/test';

/**
 * Bypasses login for E2E tests.
 * Strategy: visit /login, insert test OTP code, submit.
 * Or use a test user's session cookie.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL || 'admin@dompietro.test');
  await page.click('button:has-text("Enviar código")');
  await page.waitForSelector('#otp-token');
  await page.fill('#otp-token', '123456');
  await page.click('button:has-text("Confirmar")');
  await page.waitForURL('**/admin/**');
}
