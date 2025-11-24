import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateGenerationCommand, CreateGenerationResponse } from '../../types';
import { GenerationService } from '../../lib/generation.service';

export const prerender = false;

/**
 * Schemat walidacji dla żądania utworzenia generacji
 * Sprawdza czy source_text ma odpowiednią długość (1000-10000 znaków)
 */
const CreateGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, 'Tekst musi zawierać co najmniej 1000 znaków')
    .max(10000, 'Tekst nie może być dłuższy niż 10000 znaków'),
}) satisfies z.ZodType<CreateGenerationCommand>;

/**
 * POST /api/generations
 *
 * Endpoint służy do inicjowania procesu generowania propozycji fiszek przez AI
 * na podstawie tekstu dostarczonego przez użytkownika.
 *
 * @param source_text - Tekst wejściowy o długości od 1000 do 10000 znaków
 * @returns 201 - Pomyślne utworzenie generacji z propozycjami fiszek
 * @returns 400 - Błędne dane wejściowe
 * @returns 401 - Brak autoryzacji
 * @returns 500 - Błąd serwera
 */
export const POST: APIRoute = async (context) => {
  const startTime = Date.now();

  try {
    // Krok 1: Uwierzytelnianie użytkownika
    console.log('[POST /api/generations] Rozpoczęcie procesu generowania');

    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      console.warn('[POST /api/generations] Nieautoryzowany dostęp', {
        error: authError?.message,
      });

      return new Response(
        JSON.stringify({
          error: 'Nieautoryzowany dostęp. Musisz być zalogowany.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[POST /api/generations] Użytkownik uwierzytelniony', {
      userId: user.id,
    });

    // Krok 2: Parsowanie body żądania
    let body: unknown;
    try {
      body = await context.request.json();
    } catch (error) {
      console.warn('[POST /api/generations] Nieprawidłowy format JSON', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id,
      });

      return new Response(
        JSON.stringify({
          error: 'Nieprawidłowy format JSON',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Krok 3: Walidacja danych wejściowych
    const validationResult = CreateGenerationSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      console.warn('[POST /api/generations] Błędne dane wejściowe', {
        errors,
        userId: user.id,
      });

      return new Response(
        JSON.stringify({
          error: 'Błędne dane wejściowe',
          details: errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const validatedData = validationResult.data;

    console.log('[POST /api/generations] Dane wejściowe zwalidowane', {
      userId: user.id,
      sourceTextLength: validatedData.source_text.length,
    });

    // Krok 4: Wywołanie serwisu generowania
    const generationService = new GenerationService(context.locals.supabase);

    console.log('[POST /api/generations] Wywołanie serwisu generowania fiszek');

    const result = await generationService.generateFlashcards(
      validatedData.source_text,
      user.id
    );

    const totalDuration = Date.now() - startTime;

    console.log('[POST /api/generations] Generowanie zakończone sukcesem', {
      generationId: result.generation_id,
      generatedCount: result.generated_count,
      totalDuration: `${totalDuration}ms`,
      userId: user.id,
    });

    // Krok 5: Zwrócenie odpowiedzi sukcesu
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    console.error('[POST /api/generations] Błąd podczas generowania', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      totalDuration: `${totalDuration}ms`,
    });

    return new Response(
      JSON.stringify({
        error: 'Wewnętrzny błąd serwera podczas generowania fiszek',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
