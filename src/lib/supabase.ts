import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam as variáveis PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY no .env"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);