import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase configuration. SUPABASE_URL: ${supabaseUrl ? "set" : "missing"}, SUPABASE_KEY: ${supabaseAnonKey ? "set" : "missing"}`
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Utwórz klienta Supabase
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  context.locals.supabase = supabase;

  // Pobierz tokeny z ciasteczek
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  // Jeśli są tokeny, ustaw sesję
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // Pobierz użytkownika
  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;

  // Chronione ścieżki - wymagają logowania
  const protectedPaths = ["/generate", "/flashcards", "/study"];
  const isProtectedPath = protectedPaths.some((path) => context.url.pathname.startsWith(path));

  // Jeśli to chroniona ścieżka i użytkownik nie jest zalogowany, przekieruj do logowania
  if (isProtectedPath && !user) {
    return context.redirect("/login");
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do login/register, przekieruj do generate
  if (user && (context.url.pathname === "/login" || context.url.pathname === "/register")) {
    return context.redirect("/generate");
  }

  return next();
});
