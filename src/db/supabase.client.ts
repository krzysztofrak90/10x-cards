import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase configuration. SUPABASE_URL: ${supabaseUrl ? "set" : "missing"}, SUPABASE_KEY: ${supabaseAnonKey ? "set" : "missing"}`
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
