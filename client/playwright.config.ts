import { defineConfig, devices } from '@playwright/test';

// Port configuration for mock API and Astro dev server
const mockApiPort = 5199;
const astroDevPort = 4321;

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${astroDevPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npx tsx e2e-tests/mock-api.ts',
      url: `http://localhost:${mockApiPort}/api/dogs`,
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
    },
    {
      command: `API_SERVER_URL=http://localhost:${mockApiPort} npm run dev -- --no-clearScreen`,
      url: `http://localhost:${astroDevPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
