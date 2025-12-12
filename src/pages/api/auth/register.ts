import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Hasło musi mieć minimum 8 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Sprawdź czy email już istnieje
      if (error.message.includes("already registered")) {
        return new Response(JSON.stringify({ error: "Ten email jest już zarejestrowany" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: error.message || "Błąd rejestracji" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ustaw ciasteczko z sesją
    if (data.session) {
      cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      });

      cookies.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      });
    }

    return new Response(JSON.stringify({ success: true, user: data.user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
