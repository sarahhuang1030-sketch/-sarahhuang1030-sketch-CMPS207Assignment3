import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function POST(req) {
  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return NextResponse.json({ ok: false, error: "Missing email or url" }, { status: 400 });
    }

    await pool.query(
      "UPDATE students SET profile_picture_url = ? WHERE email = ?",
      [url, email]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update photo failed:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
