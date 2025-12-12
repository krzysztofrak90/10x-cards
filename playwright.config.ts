import { defineConfig, devices } from "@playwright/test";

// In CI, require environment variables from secrets
const isCI = !!process.env.CI;
const supabaseUrl = process.env.SUPABASE_URL || (isCI ? "" : "http://127.0.0.1:54331");
const supabaseKey =
  process.env.SUPABASE_KEY ||
  (isCI
    ? ""
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

// Validate that required environment variables are set in CI
if (isCI && (!supabaseUrl || !supabaseKey)) {
  throw new Error(
    `Missing required environment variables in CI:\n` +
      `SUPABASE_URL: ${supabaseUrl ? "✓" : "✗ MISSING"}\n` +
      `SUPABASE_KEY: ${supabaseKey ? "✓" : "✗ MISSING"}\n` +
      `Please configure these secrets in your GitHub repository settings.`
  );
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 180 * 1000,
    env: {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_KEY: supabaseKey,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
    },
  },
});
