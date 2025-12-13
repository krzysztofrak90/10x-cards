import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GenerationService } from "../../../src/lib/generation.service";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Supabase client
const createMockSupabaseClient = () => {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: "test-generation-id",
              user_id: "test-user-id",
              model: "meta-llama/llama-3.2-3b-instruct:free",
              generated_count: 5,
              source_text_hash: "test-hash",
              source_text_length: 1500,
              generation_duration: 1000,
            },
            error: null,
          })),
        })),
      })),
    })),
  } as unknown as SupabaseClient;
};

describe("GenerationService", () => {
  let service: GenerationService;
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new GenerationService(mockSupabase);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateFlashcards", () => {
    const validSourceText = "A".repeat(1500); // 1500 characters
    const testUserId = "test-user-id";

    test("should generate flashcards successfully with single JSON array", async () => {
      // Mock successful OpenRouter API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  { front: "Test Question 1", back: "Test Answer 1" },
                  { front: "Test Question 2", back: "Test Answer 2" },
                ]),
              },
            },
          ],
        }),
      });

      const result = await service.generateFlashcards(validSourceText, testUserId);

      expect(result).toHaveProperty("generation_id");
      expect(result).toHaveProperty("flashcards_proposals");
      expect(result).toHaveProperty("generated_count");
      expect(result.flashcards_proposals).toHaveLength(2);
      expect(result.flashcards_proposals[0]).toEqual({
        front: "Test Question 1",
        back: "Test Answer 1",
        source: "ai-full",
      });
    });

    test("should handle multiple JSON arrays (Llama format)", async () => {
      // Mock Llama-style response with multiple arrays
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `
                [ { "front": "Question 1", "back": "Answer 1" } ]
                [ { "front": "Question 2", "back": "Answer 2" } ]
                [ { "front": "Question 3", "back": "Answer 3" } ]
                `,
              },
            },
          ],
        }),
      });

      const result = await service.generateFlashcards(validSourceText, testUserId);

      expect(result.flashcards_proposals).toHaveLength(3);
      expect(result.generated_count).toBe(3);
    });

    test("should handle JSON wrapped in markdown code blocks", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `\`\`\`json
                [
                  { "front": "Test", "back": "Answer" }
                ]
                \`\`\``,
              },
            },
          ],
        }),
      });

      const result = await service.generateFlashcards(validSourceText, testUserId);

      expect(result.flashcards_proposals).toHaveLength(1);
    });

    test("should throw error for 401 Unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: { message: "Invalid API key" },
        }),
      });

      await expect(service.generateFlashcards(validSourceText, testUserId)).rejects.toThrow(
        "OpenRouter API error: 401 Unauthorized"
      );
    });

    test("should throw error for 429 Rate Limit", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: { message: "Rate limit exceeded" },
        }),
      });

      await expect(service.generateFlashcards(validSourceText, testUserId)).rejects.toThrow(
        "OpenRouter API error: 429 Too Many Requests"
      );
    });

    test("should throw error when AI returns no choices", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      });

      await expect(service.generateFlashcards(validSourceText, testUserId)).rejects.toThrow("Brak odpowiedzi z API AI");
    });

    test("should throw error when no JSON found in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "This is just plain text without any JSON",
              },
            },
          ],
        }),
      });

      await expect(service.generateFlashcards(validSourceText, testUserId)).rejects.toThrow(
        "Nie znaleziono JSON w odpowiedzi AI"
      );
    });

    test("should trim whitespace from flashcard content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify([{ front: "  Test Question  ", back: "  Test Answer  " }]),
              },
            },
          ],
        }),
      });

      const result = await service.generateFlashcards(validSourceText, testUserId);

      expect(result.flashcards_proposals[0].front).toBe("Test Question");
      expect(result.flashcards_proposals[0].back).toBe("Test Answer");
    });

    test("should mark all flashcards as ai-full source", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  { front: "Q1", back: "A1" },
                  { front: "Q2", back: "A2" },
                ]),
              },
            },
          ],
        }),
      });

      const result = await service.generateFlashcards(validSourceText, testUserId);

      result.flashcards_proposals.forEach((flashcard) => {
        expect(flashcard.source).toBe("ai-full");
      });
    });
  });

  describe("API request validation", () => {
    test("should send correct model in API request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify([{ front: "Q", back: "A" }]),
              },
            },
          ],
        }),
      });

      await service.generateFlashcards("A".repeat(1500), "user-id");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: expect.stringContaining("Bearer"),
          }),
          body: expect.stringContaining("meta-llama/llama-3.2-3b-instruct:free"),
        })
      );
    });
  });
});
