import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000/lingo-cube/',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/lingo-cube/',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
