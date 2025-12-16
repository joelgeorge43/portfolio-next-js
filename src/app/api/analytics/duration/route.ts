import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { visitorId, pagePath, duration } = body;

        if (!visitorId || !pagePath) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find the most recent page view for this visitor and path
        const { data: pageViews } = await supabaseAdmin
            .from("page_views")
            .select("*")
            .eq("visitor_id", visitorId)
            .eq("page_path", pagePath)
            .order("created_at", { ascending: false })
            .limit(1);

        if (pageViews && pageViews.length > 0) {
            // Update the duration
            await supabaseAdmin
                .from("page_views")
                .update({ duration })
                .eq("id", pageViews[0].id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Duration tracking error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
