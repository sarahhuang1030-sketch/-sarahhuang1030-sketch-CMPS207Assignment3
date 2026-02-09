import { NextResponse } from "next/server";
import pool from "@/app/lib/database"; // adjust if your path differs

export async function POST(req) {
  try {
    const form = await req.formData();

    const first_name = form.get("first_name");
    const last_name = form.get("last_name");
    const phone = form.get("phone");
    const email = form.get("email");
    const street_address = form.get("street_address");
    const city = form.get("city");
    const province_state = form.get("province_state");
    const country = form.get("country");
    const postal_code = form.get("postal_code");
    const program = form.get("program");
    const year = form.get("year");

    const required = {
      first_name, last_name, phone, email,
      street_address, city, province_state,
      country, postal_code, program, year,
    };

    for (const [k, v] of Object.entries(required)) {
      if (!v || String(v).trim() === "") {
        return NextResponse.json({ ok: false, error: `Missing required field: ${k}` }, { status: 400 });
      }
    }

    // Optional: prevent duplicate email (recommended)
    const [existing] = await pool.query(
      "SELECT id FROM students WHERE email = ? LIMIT 1",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: "Student with this email already exists" }, { status: 409 });
    }

    await pool.query(
      `INSERT INTO students
        (first_name, last_name, phone, email, street_address, city, province_state, country, postal_code, program, year)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        phone,
        email,
        street_address,
        city,
        province_state,
        country,
        postal_code,
        program,
        year,
      ]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/students failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
