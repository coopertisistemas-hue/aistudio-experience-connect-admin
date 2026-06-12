import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        VITE_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
      },
    },
    {
      command: 'pnpm --filter @connect/landing dev',
      port: 3002,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key',
        VITE_PUBLIC_TENANT_ID: 'default',
      },
    },
  ],
  projects: [
    {
      name: 'admin',
      use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000' },
      testMatch: 'smoke.spec.ts',
    },
    {
      name: 'landing',
      use: { baseURL: process.env.LANDING_BASE_URL || 'http://localhost:3002' },
      testMatch: ['landing.spec.ts', 'booking.spec.ts'],
    },
  ],
});
