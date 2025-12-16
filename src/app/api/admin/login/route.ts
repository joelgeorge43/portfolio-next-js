import { NextRequest, NextResponse } from "next/server";
import * as cookie from "cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    if (username === adminUser && password === adminPass) {
      const response = NextResponse.json({ success: true }, { status: 200 });

      response.headers.set(
        "Set-Cookie",
        cookie.serialize("adminToken", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: "strict",
          path: "/",
        }),
      );

      return response;
    } else {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
