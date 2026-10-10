import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { verifyToken } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function checkAuth(request: NextRequest): string | null {
  const token = request.cookies.get("cameco_admin_token")?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  return verified ? verified.email : null;
}

export async function POST(request: NextRequest) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: "Administrative authentication required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file supplied." }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file format. Only JPEG, PNG, and WebP images are permitted." },
        { status: 400 }
      );
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File exceeds maximum size threshold of 2 megabytes." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = "photo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8) + "." + ext;

    // 1. Try Supabase Storage if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from("applicant-photos")
          .upload(filename, buffer, { contentType: file.type, upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("applicant-photos")
            .getPublicUrl(filename);
          return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
        }
      } catch (sbErr) {
        console.warn("[upload] Supabase storage upload failed, using fallback:", sbErr);
      }
    }

    // 2. Try writing to public/uploads (works in local dev / Node)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      return NextResponse.json({ success: true, url: "/uploads/" + filename });
    } catch {
      // 3. Fallback to Base64 Data URL (serverless read-only filesystem on Vercel)
      const base64Url = "data:" + file.type + ";base64," + buffer.toString("base64");
      return NextResponse.json({ success: true, url: base64Url });
    }
  } catch (err) {
    console.error("[upload] Processing error:", err);
    return NextResponse.json({ error: "Photo upload processing failed." }, { status: 500 });
  }
}
