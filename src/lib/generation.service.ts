import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';
import type { FlashcardProposalDTO, CreateGenerationResponse } from '../types';

/**
 * Typ reprezentujący klienta Supabase z właściwym typowaniem bazy danych
 */
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Stała określająca model AI używany do generowania (mock na potrzeby developmentu)
 */
const AI_MODEL = 'mock-gpt-4';

/**
 * Timeout dla operacji generowania przez AI (w milisekundach)
 */
const GENERATION_TIMEOUT_MS = 60000;

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
  async generateFlashcards(
    sourceText: string,
    userId: string
  ): Promise<CreateGenerationResponse> {
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
        .from('generations')
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
   * Mock funkcji wywołującej serwis AI do generowania fiszek
   * W przyszłości zostanie zastąpiony prawdziwą integracją z API AI
   *
   * @param sourceText - Tekst źródłowy
   * @returns Tablica propozycji fiszek
   */
  private async callAiService(sourceText: string): Promise<FlashcardProposalDTO[]> {
    // Symulacja opóźnienia API (200-500ms)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 200));

    // Mockowane propozycje fiszek
    // W rzeczywistości tutaj byłoby wywołanie API AI
    const mockProposals: FlashcardProposalDTO[] = [
      {
        front: 'Pytanie 1 wygenerowane przez AI',
        back: 'Odpowiedź 1 na podstawie tekstu źródłowego',
        source: 'ai-full',
      },
      {
        front: 'Pytanie 2 wygenerowane przez AI',
        back: 'Odpowiedź 2 na podstawie tekstu źródłowego',
        source: 'ai-full',
      },
      {
        front: 'Pytanie 3 wygenerowane przez AI',
        back: 'Odpowiedź 3 na podstawie tekstu źródłowego',
        source: 'ai-full',
      },
      {
        front: 'Pytanie 4 wygenerowane przez AI',
        back: 'Odpowiedź 4 na podstawie tekstu źródłowego',
        source: 'ai-full',
      },
      {
        front: 'Pytanie 5 wygenerowane przez AI',
        back: 'Odpowiedź 5 na podstawie tekstu źródłowego',
        source: 'ai-full',
      },
    ];

    return mockProposals;
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
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Rejestruje błąd generowania w tabeli generation_error_logs
   *
   * @param error - Obiekt błędu
   * @param sourceText - Tekst źródłowy który spowodował błąd
   * @param userId - ID użytkownika
   */
  private async logGenerationError(
    error: unknown,
    sourceText: string,
    userId: string
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      const errorCode = error instanceof Error && 'code' in error ? String(error.code) : 'UNKNOWN';

      const sourceTextHash = await this.calculateHash(sourceText);
      const sourceTextLength = sourceText.length;

      await this.supabase.from('generation_error_logs').insert({
        user_id: userId,
        model: AI_MODEL,
        error_code: errorCode,
        error_message: errorMessage,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
      });
    } catch (logError) {
      // Jeśli nie udało się zapisać błędu, logujemy do konsoli
      console.error('Nie udało się zapisać błędu do generation_error_logs:', logError);
    }
  }
}
