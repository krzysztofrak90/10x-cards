import { vi } from "vitest";

// Mock environment variables
process.env.OPENROUTER_API_KEY = "test-api-key";
process.env.SUPABASE_URL = "http://127.0.0.1:54331";
process.env.SUPABASE_KEY = "test-supabase-key";

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
});

afterAll(() => {
  // Cleanup code that runs after all tests
});

afterEach(() => {
  // Reset all mocks after each test
  vi.restoreAllMocks();
});
