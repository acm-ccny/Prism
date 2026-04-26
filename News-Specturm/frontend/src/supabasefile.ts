import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL="https://yqtngaioeblciiytcttq.supabase.co/";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_FhwcAh2XsC5M21ca66BTwg_Dmrtb5gw";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend env."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);