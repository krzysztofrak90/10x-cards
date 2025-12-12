import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobierz wszystkie fiszki użytkownika
    const { data: flashcards, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: "Błąd pobierania fiszek" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ flashcards }), {
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
