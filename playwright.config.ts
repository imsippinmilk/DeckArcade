import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--use-fake-device-for-media-stream'],
    },
  },
  webServer: {
    command: 'pnpm exec vite dev --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
