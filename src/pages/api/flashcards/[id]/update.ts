import type { APIRoute } from "astro";

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;
    const { front, back } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID fiszki jest wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Walidacja
    if (!front || !back) {
      return new Response(JSON.stringify({ error: "Przód i tył fiszki są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (front.length > 200) {
      return new Response(JSON.stringify({ error: "Przód fiszki może mieć maksymalnie 200 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (back.length > 500) {
      return new Response(JSON.stringify({ error: "Tył fiszki może mieć maksymalnie 500 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdź czy fiszka należy do użytkownika
    const { data: existingFlashcard } = await supabase
      .from("flashcards")
      .select("source")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existingFlashcard) {
      return new Response(JSON.stringify({ error: "Fiszka nie znaleziona" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Jeśli fiszka była 'ai-full', zmień na 'ai-edited'
    let source = existingFlashcard.source;
    if (source === "ai-full") {
      source = "ai-edited";
    }

    // Zaktualizuj fiszkę
    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .update({
        front,
        back,
        source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Błąd aktualizacji fiszki" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ flashcard }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
