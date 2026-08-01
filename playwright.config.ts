import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  workers: process.env.STAGING_E2E === 'true' ? 1 : undefined,
  use: {
    baseURL: process.env.STAGING_BASE_URL || 'https://staging.localhost:8443',
    ignoreHTTPSErrors: true,
    headless: true,
    launchOptions: { chromiumSandbox: false },
  },
})
