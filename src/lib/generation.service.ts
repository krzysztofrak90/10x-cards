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
const AI_MODEL = "google/gemini-2.0-flash-exp:free";

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
      throw new Error("OPENROUTER_API_KEY nie jest skonfigurowany w zmiennych środowiskowych");
    }

    const prompt = `Przeanalizuj poniższy tekst i wygeneruj 5-8 fiszek edukacyjnych. Każda fiszka powinna zawierać:
- front: pytanie lub termin do zapamiętania (krótkie, jasne)
- back: odpowiedź lub definicję (szczegółową, ale zwięzłą)

Fiszki powinny:
1. Koncentrować się na najważniejszych koncepcjach z tekstu
2. Być konkretne i jednoznaczne
3. Zawierać pełne odpowiedzi bez odsyłania do tekstu źródłowego
4. Być zróżnicowane (różne typy pytań: definicje, przykłady, porównania, zastosowania)

Zwróć wynik w formacie JSON jako tablicę obiektów:
[
  {
    "front": "pytanie lub termin",
    "back": "odpowiedź lub definicja"
  }
]

TEKST DO ANALIZY:
${sourceText}

Odpowiedź (tylko JSON, bez dodatkowych komentarzy):`;

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
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Brak odpowiedzi z API AI");
    }

    // Parsowanie JSON z odpowiedzi AI
    // Czasami AI może dodać markdown code block, więc musimy to wyczyścić
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Nie znaleziono JSON w odpowiedzi AI");
    }

    const flashcardsData = JSON.parse(jsonMatch[0]) as {
      front: string;
      back: string;
    }[];

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
