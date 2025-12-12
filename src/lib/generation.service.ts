import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";
import type { FlashcardProposalDTO, CreateGenerationResponse } from "../types";

/**
 * Typ reprezentujący klienta Supabase z właściwym typowaniem bazy danych
 */
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Stała określająca model AI używany do generowania
 */
const AI_MODEL = "meta-llama/llama-3.2-3b-instruct:free";

/**
 * Klucz API dla OpenRouter
 */
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

/**
 * GenerationService - Serwis odpowiedzialny za generowanie propozycji fiszek przez AI
 */
export class GenerationService {
  constructor(private supabase: TypedSupabaseClient) {}

  /**
   * Generuje propozycje fiszek na podstawie dostarczonego tekstu
   *
   * @param sourceText - Tekst źródłowy do generowania fiszek
   * @param userId - ID użytkownika inicjującego generowanie
   * @returns Odpowiedź zawierająca generation_id, propozycje fiszek i liczbę wygenerowanych
   * @throws Error w przypadku błędu podczas generowania lub zapisu do bazy
   */
  async generateFlashcards(sourceText: string, userId: string): Promise<CreateGenerationResponse> {
    const startTime = Date.now();

    try {
      // Generowanie fiszek przez AI (na razie mock)
      const flashcardsProposals = await this.callAiService(sourceText);

      // Obliczanie metadanych
      const sourceTextLength = sourceText.length;
      const sourceTextHash = await this.calculateHash(sourceText);
      const generationDuration = Date.now() - startTime;
      const generatedCount = flashcardsProposals.length;

      // Zapis do tabeli generations
      const { data: generation, error: generationError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          model: AI_MODEL,
          generated_count: generatedCount,
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          generation_duration: generationDuration,
        })
        .select()
        .single();

      if (generationError || !generation) {
        throw new Error(`Błąd zapisu generacji do bazy: ${generationError?.message}`);
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: flashcardsProposals,
        generated_count: generatedCount,
      };
    } catch (error) {
      // Logowanie błędu do tabeli generation_error_logs
      await this.logGenerationError(error, sourceText, userId);
      throw error;
    }
  }

  /**
   * Wywołuje serwis AI (OpenRouter) do generowania fiszek na podstawie tekstu źródłowego
   *
   * @param sourceText - Tekst źródłowy
   * @returns Tablica propozycji fiszek
   * @throws Error jeśli wywołanie API się nie powiedzie
   */
  private async callAiService(sourceText: string): Promise<FlashcardProposalDTO[]> {
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set");
      throw new Error("OPENROUTER_API_KEY nie jest skonfigurowany w zmiennych środowiskowych");
    }

    console.log("Calling AI service with model:", AI_MODEL);
    console.log("Source text length:", sourceText.length);

    const prompt = `You are a flashcard generator for language learning.

CRITICAL RULES - LANGUAGE DETECTION:
1. Detect the language of the input text
2. If text is in POLISH → generate both front and back in POLISH
3. If text is in ENGLISH or any other foreign language:
   - front: MUST be in the ORIGINAL language (English)
   - back: MUST be in POLISH (translation/explanation)

EXAMPLES for English text:

✅ CORRECT:
[
  {"front": "Artificial Intelligence", "back": "Sztuczna inteligencja - technologia umożliwiająca maszynom wykonywanie zadań wymagających inteligencji"},
  {"front": "Machine learning", "back": "Uczenie maszynowe - poddziedzina AI koncentrująca się na algorytmach uczących się z danych"},
  {"front": "What is deep learning?", "back": "Głębokie uczenie - technika ML wykorzystująca sieci neuronowe z wieloma warstwami"}
]

❌ WRONG - DO NOT DO THIS:
[
  {"front": "Sztuczna inteligencja", "back": "Technologia umożliwiająca..."},
  {"front": "Co to jest uczenie maszynowe?", "back": "Poddziedzina AI..."}
]

Generate 5-8 flashcards. For foreign language texts, prioritize:
- Key vocabulary and phrases (in original language)
- Important concepts with context
- Idioms and expressions
- Difficult terms worth memorizing

Return ONLY valid JSON array, no comments:
[
  {
    "front": "term/phrase in original language",
    "back": "Polish translation/explanation"
  }
]

TEXT TO ANALYZE:
${sourceText}

JSON response:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://flashlearn-ai.com",
        "X-Title": "FlashLearn AI",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("Brak odpowiedzi z API AI. Data:", JSON.stringify(data));
      throw new Error("Brak odpowiedzi z API AI");
    }

    console.log("AI Response:", aiResponse);

    // Parsowanie JSON z odpowiedzi AI
    // Model może zwrócić albo jedną tablicę [ {...}, {...} ]
    // albo wiele osobnych tablic [ {...} ] [ {...} ]

    // Znajdź wszystkie tablice JSON w odpowiedzi
    const jsonArrayMatches = aiResponse.match(/\[[^\[\]]*\{[^\}]*\}[^\[\]]*\]/g);

    if (!jsonArrayMatches || jsonArrayMatches.length === 0) {
      console.error("Nie znaleziono JSON w odpowiedzi AI. Response:", aiResponse);
      throw new Error("Nie znaleziono JSON w odpowiedzi AI");
    }

    // Sparsuj wszystkie znalezione tablice i połącz je w jedną
    let flashcardsData: { front: string; back: string }[] = [];

    for (const jsonMatch of jsonArrayMatches) {
      try {
        const parsed = JSON.parse(jsonMatch);
        // Jeśli to tablica, dodaj wszystkie elementy
        if (Array.isArray(parsed)) {
          flashcardsData = flashcardsData.concat(parsed);
        }
      } catch (error) {
        console.error("Błąd parsowania JSON fragment:", jsonMatch, error);
        // Kontynuuj z innymi fragmentami
      }
    }

    // Konwersja do naszego formatu DTO
    const proposals: FlashcardProposalDTO[] = flashcardsData.map((card) => ({
      front: card.front.trim(),
      back: card.back.trim(),
      source: "ai-full",
    }));

    // Walidacja - sprawdź czy mamy przynajmniej jedną fiszkę
    if (proposals.length === 0) {
      throw new Error("AI nie wygenerowało żadnych fiszek");
    }

    return proposals;
  }

  /**
   * Oblicza hash SHA-256 z tekstu źródłowego
   *
   * @param text - Tekst do hashowania
   * @returns Hash w formacie hex
   */
  private async calculateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * Rejestruje błąd generowania w tabeli generation_error_logs
   *
   * @param error - Obiekt błędu
   * @param sourceText - Tekst źródłowy który spowodował błąd
   * @param userId - ID użytkownika
   */
  private async logGenerationError(error: unknown, sourceText: string, userId: string): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      const errorCode = error instanceof Error && "code" in error ? String(error.code) : "UNKNOWN";

      const sourceTextHash = await this.calculateHash(sourceText);
      const sourceTextLength = sourceText.length;

      await this.supabase.from("generation_error_logs").insert({
        user_id: userId,
        model: AI_MODEL,
        error_code: errorCode,
        error_message: errorMessage,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
      });
    } catch {
      // Jeśli nie udało się zapisać błędu, ignorujemy
    }
  }
}
