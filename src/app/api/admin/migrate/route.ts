import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as cookie from "cookie";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Helper to check admin auth
function isAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  return cookies.adminToken === "authenticated";
}

export async function GET(request: NextRequest) {
  console.log("Migration API hit");
  
  if (!isAdmin(request)) {
      console.log("Migration API: Unauthorized (cookie check failed)");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectsDir = path.join(process.cwd(), "src/app/work/projects");
    console.log("Migration API: checking dir", projectsDir);
    
    if (!fs.existsSync(projectsDir)) {
        console.log("Migration API: Directory not found");
        return NextResponse.json({ message: "Projects directory not found" }, { status: 404 });
    }

    const files = fs.readdirSync(projectsDir);
    console.log("Migration API: Found files", files.length);
    const results = [];

    for (const file of files) {
        if (!file.endsWith(".mdx")) {
            console.log("Skipping non-mdx file:", file);
            continue;
        }

        console.log("Processing file:", file);
        const filePath = path.join(projectsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        const slug = file.replace(".mdx", "");
        
        // Prepare images array
        // Expected frontmatter: images: [{src, alt, width, height}, ...]
        const images = data.images || [];

        // Insert into Supabase
        const { error } = await supabaseAdmin
            .from("projects")
            .upsert({
                slug: slug,
                title: data.title || slug,
                description: data.summary || "",
                content: content,
                images: images,
                is_protected: false, // Default to false
                password_type: 'master',
                created_at: data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' })
            .select();

        if (error) {
            console.error("Supabase Error for", slug, error);
            results.push({ slug, status: "failed", error: error.message });
        } else {
            console.log("Success for", slug);
            results.push({ slug, status: "success" });
        }
    }

    return NextResponse.json({ 
        message: "Migration completed",
        results 
    });

  } catch (error: any) {
    console.error("Migration API Critical Error:", error);
    return NextResponse.json({ message: "Migration failed", error: error.message }, { status: 500 });
  }
}
