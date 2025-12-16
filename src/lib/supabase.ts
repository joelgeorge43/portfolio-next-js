import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public Client (Respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, slug, images, is_protected")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return data;
}

export async function getProject(slug: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching project ${slug}:`, error);
    return null;
  }
  return data;
}
