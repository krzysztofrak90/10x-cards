import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { front, back } = await request.json();

    // Walidacja
    if (!front || !back) {
      return new Response(
        JSON.stringify({ error: 'Przód i tył fiszki są wymagane' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (front.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Przód fiszki może mieć maksymalnie 200 znaków' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (back.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Tył fiszki może mieć maksymalnie 500 znaków' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Utwórz fiszkę
    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .insert({
        front,
        back,
        source: 'manual',
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Błąd tworzenia fiszki' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ flashcard }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Wystąpił błąd serwera' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
