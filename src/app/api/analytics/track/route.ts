import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, pagePath, pageTitle, deviceType, browser, os, referrer } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "Visitor ID required" }, { status: 400 });
    }

    // Get geolocation from request headers (Vercel provides this)
    const country = request.geo?.country || "Unknown";
    const city = request.geo?.city || "Unknown";

    // Upsert visitor record
    const { data: existingVisitor } = await supabaseAdmin
      .from("visitors")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    if (existingVisitor) {
      // Update existing visitor
      await supabaseAdmin
        .from("visitors")
        .update({
          last_visit: new Date().toISOString(),
          total_visits: existingVisitor.total_visits + 1,
        })
        .eq("visitor_id", visitorId);
    } else {
      // Insert new visitor
      await supabaseAdmin
        .from("visitors")
        .insert({
          visitor_id: visitorId,
          country,
          city,
          device_type: deviceType,
          browser,
          os,
          referrer,
        });
    }

    // Insert page view
    await supabaseAdmin
      .from("page_views")
      .insert({
        visitor_id: visitorId,
        page_path: pagePath,
        page_title: pageTitle,
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
