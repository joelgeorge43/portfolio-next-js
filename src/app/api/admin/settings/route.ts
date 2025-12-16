import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as cookie from "cookie";

function isAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  return cookies.adminToken === "authenticated";
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { key, value } = body;

    // Only allow updating master_password for now
    if (key !== 'master_password') {
        return NextResponse.json({ message: "Invalid setting key" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("admin_settings")
      .upsert({ key, value })
      .select();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
}
