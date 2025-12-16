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
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get total unique visitors
    const { count: totalVisitors } = await supabaseAdmin
      .from("visitors")
      .select("*", { count: "exact", head: true });

    // Get total page views
    const { count: totalPageViews } = await supabaseAdmin
      .from("page_views")
      .select("*", { count: "exact", head: true });

    // Get visitors by country
    const { data: countryData } = await supabaseAdmin
      .from("visitors")
      .select("country")
      .order("country");

    const countryStats = countryData?.reduce((acc: any, curr) => {
      acc[curr.country] = (acc[curr.country] || 0) + 1;
      return acc;
    }, {});

    // Get device type breakdown
    const { data: deviceData } = await supabaseAdmin
      .from("visitors")
      .select("device_type")
      .order("device_type");

    const deviceStats = deviceData?.reduce((acc: any, curr) => {
      acc[curr.device_type] = (acc[curr.device_type] || 0) + 1;
      return acc;
    }, {});

    // Get browser breakdown
    const { data: browserData } = await supabaseAdmin
      .from("visitors")
      .select("browser")
      .order("browser");

    const browserStats = browserData?.reduce((acc: any, curr) => {
      acc[curr.browser] = (acc[curr.browser] || 0) + 1;
      return acc;
    }, {});

    // Get popular pages
    const { data: pageData } = await supabaseAdmin
      .from("page_views")
      .select("page_path, page_title");

    const pageStats = pageData?.reduce((acc: any, curr) => {
      const key = curr.page_path;
      if (!acc[key]) {
        acc[key] = { path: curr.page_path, title: curr.page_title, views: 0 };
      }
      acc[key].views += 1;
      return acc;
    }, {});

    const popularPages = Object.values(pageStats || {})
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10);

    // Get time-series data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: timeSeriesData } = await supabaseAdmin
      .from("page_views")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at");

    // Group by date
    const dailyViews = timeSeriesData?.reduce((acc: any, curr) => {
      const date = new Date(curr.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesArray = Object.entries(dailyViews || {}).map(([date, views]) => ({
      date,
      views,
    }));

    return NextResponse.json({
      totalVisitors: totalVisitors || 0,
      totalPageViews: totalPageViews || 0,
      countryStats: Object.entries(countryStats || {}).map(([country, count]) => ({
        country,
        count,
      })),
      deviceStats: Object.entries(deviceStats || {}).map(([device, count]) => ({
        device,
        count,
      })),
      browserStats: Object.entries(browserStats || {}).map(([browser, count]) => ({
        browser,
        count,
      })),
      popularPages,
      timeSeries: timeSeriesArray,
    });
  } catch (error: any) {
    console.error("Analytics stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
