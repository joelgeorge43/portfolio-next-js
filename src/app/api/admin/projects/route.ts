import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as cookie from "cookie";

// Helper to check admin auth
function isAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  return cookies.adminToken === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, slug, description, content, images, is_protected, password_type, custom_password } = body;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert([
        { title, slug, description, content, images, is_protected, password_type, custom_password }
      ])
      .select();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json(data[0]);
  } catch (e) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
    if (!isAdmin(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
    try {
      const body = await request.json();
      const { id, title, slug, description, content, images, is_protected, password_type, custom_password } = body;
  
      const { data, error } = await supabaseAdmin
        .from("projects")
        .update({ title, slug, description, content, images, is_protected, password_type, custom_password, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
  
      if (error) return NextResponse.json({ message: error.message }, { status: 500 });
      return NextResponse.json(data[0]);
    } catch (e) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAdmin(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("projects")
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
