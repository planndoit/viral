import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  workers: 2,
  timeout: 20000,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3100/viral/', launchOptions: { executablePath }, trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 }, browserName: 'chromium' } },
  ],
  webServer: { command: 'node scripts/serve.js', env: { PORT: '3100' }, url: 'http://127.0.0.1:3100/viral/', reuseExistingServer: false, timeout: 10000 },
});
