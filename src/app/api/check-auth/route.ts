import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as cookie from "cookie";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";

  // 1. Check if path corresponds to a project
  if (path.startsWith("/work/")) {
      const slug = path.split("/work/")[1];
      if (slug) {
          // Fetch project protection settings
          const { data: project } = await supabaseAdmin
              .from("projects")
              .select("is_protected, password_type")
              .eq("slug", slug)
              .single();

          if (project && project.is_protected) {
              // 2. Check Authentication
              if (project.password_type === 'master') {
                  // Check global auth
                  if (cookies.authToken === "authenticated") {
                      return NextResponse.json({ authenticated: true }, { status: 200 });
                  }
              } else {
                  // Check custom auth (cookie: auth_slug)
                  // sanitize slug for cookie name
                  const cookieName = `auth_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`;
                  if (cookies[cookieName] === "authenticated") {
                      return NextResponse.json({ authenticated: true }, { status: 200 });
                  }
              }
              // Not authenticated
              return NextResponse.json({ authenticated: false, requiresPassword: true }, { status: 401 });
          }
      }
  }

  // Default: Not protected
  return NextResponse.json({ authenticated: true }, { status: 200 });
}
