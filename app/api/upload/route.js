import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    // file is a Blob in Next.js
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = String(file.name || "upload.png").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    // This URL will be publicly accessible
    const url = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
