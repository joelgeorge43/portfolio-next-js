import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAdminSettings } from "@/lib/supabase-admin";
import * as cookie from "cookie";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, path } = body;

  let isAuthenticated = false;
  let cookieName = "authToken"; // Default for master

  // Logic: Identify target context
  // If path is provided, check specific project settings
  if (path && path.startsWith("/work/")) {
      const slug = path.split("/work/")[1];
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("password_type, custom_password")
        .eq("slug", slug)
        .single();
      
      if (project) {
          if (project.password_type === 'custom') {
              // Check Custom Password
              if (password === project.custom_password) {
                  isAuthenticated = true;
                  cookieName = `auth_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`;
              }
          } else {
              // Check Master Password
              const masterPass = await getAdminSettings("master_password") || process.env.PAGE_ACCESS_PASSWORD;
              if (password === masterPass) {
                  isAuthenticated = true;
                  // cookieName remains authToken (Global)
              }
          }
      }
  } else {
      // Fallback/Global check (e.g. legacy)
      const masterPass = await getAdminSettings("master_password") || process.env.PAGE_ACCESS_PASSWORD;
      if (password === masterPass) {
          isAuthenticated = true;
      }
  }

  if (isAuthenticated) {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set(
      "Set-Cookie",
      cookie.serialize(cookieName, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        sameSite: "strict",
        path: "/",
      }),
    );
    return response;
  } else {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }
}
