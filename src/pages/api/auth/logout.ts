import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    const supabase = locals.supabase;

    await supabase.auth.signOut();

    // Usuń ciasteczka
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Wystąpił błąd podczas wylogowania' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
