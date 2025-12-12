import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID fiszki jest wymagane' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Usuń fiszkę (tylko jeśli należy do użytkownika)
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Błąd usuwania fiszki' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
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
