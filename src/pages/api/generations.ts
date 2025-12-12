import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateGenerationCommand } from "../../types";
import { GenerationService } from "../../lib/generation.service";

export const prerender = false;

/**
 * Schemat walidacji dla żądania utworzenia generacji
 * Sprawdza czy source_text ma odpowiednią długość (1000-10000 znaków)
 */
const CreateGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Tekst musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst nie może być dłuższy niż 10000 znaków"),
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
  try {
    // Krok 1: Uwierzytelnianie użytkownika
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Nieautoryzowany dostęp. Musisz być zalogowany.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Krok 2: Parsowanie body żądania
    let body: unknown;
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Krok 3: Walidacja danych wejściowych
    const validationResult = CreateGenerationSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Błędne dane wejściowe",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = validationResult.data;

    // Krok 4: Wywołanie serwisu generowania
    const generationService = new GenerationService(context.locals.supabase);

    const result = await generationService.generateFlashcards(validatedData.source_text, user.id);

    // Krok 5: Zwrócenie odpowiedzi sukcesu
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Wewnętrzny błąd serwera podczas generowania fiszek",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
