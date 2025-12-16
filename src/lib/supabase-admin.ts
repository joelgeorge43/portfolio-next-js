import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Supabase environment variables are missing! Admin features will not work.");
}

// Admin Client (Bypasses RLS)
// ONLY use this in server-side API routes, never expose to client!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getAdminSettings(key: string) {
    const { data, error } = await supabaseAdmin
        .from("admin_settings")
        .select("value")
        .eq("key", key)
        .single();
    
    if (error || !data) return null;
    return data.value;
}
