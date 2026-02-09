import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function DELETE(req, { params }) {
  try {
    const email = decodeURIComponent(params.email);

    const [result] = await pool.query("DELETE FROM students WHERE email = ?", [
      email,
    ]);

    if (result.affectedRows === 0) {
      return new NextResponse("Student not found", { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/students/:email failed:", err);
    return new NextResponse(err?.message ? String(err.message) : "Delete failed", {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const email = decodeURIComponent(params.email);
    const incoming = await req.json();

    // 1) Load existing (for PATCH behavior)
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE email = ? LIMIT 1",
      [email]
    );

    const existing = rows[0];
    if (!existing) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // 2) Merge (only overwrite provided fields)
    const merged = {
      first_name: incoming.first_name ?? existing.first_name,
      last_name: incoming.last_name ?? existing.last_name,
      phone: incoming.phone ?? existing.phone,
      street_address: incoming.street_address ?? existing.street_address,
      city: incoming.city ?? existing.city,
      province_state: incoming.province_state ?? existing.province_state,
      country: incoming.country ?? existing.country,
      postal_code: incoming.postal_code ?? existing.postal_code,
      program: incoming.program ?? existing.program,
      year: incoming.year ?? existing.year,
      // only change photo if provided (can set null intentionally)
      profile_picture_url:
        incoming.profile_picture_url !== undefined
          ? incoming.profile_picture_url
          : existing.profile_picture_url,
    };

    // 3) Update
    const [result] = await pool.query(
      `
      UPDATE students
      SET first_name = ?,
          last_name = ?,
          phone = ?,
          street_address = ?,
          city = ?,
          province_state = ?,
          country = ?,
          postal_code = ?,
          program = ?,
          year = ?,
          profile_picture_url = ?
      WHERE email = ?
      `,
      [
        merged.first_name,
        merged.last_name,
        merged.phone,
        merged.street_address,
        merged.city,
        merged.province_state,
        merged.country,
        merged.postal_code,
        merged.program,
        merged.year,
        merged.profile_picture_url ?? null,
        email,
      ]
    );

    if (result.affectedRows === 0) {
      return new NextResponse("Student not found", { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/students/:email failed:", err);

    // MySQL duplicate key error (if you ever add unique constraints)
    if (err?.code === "ER_DUP_ENTRY") {
      return new NextResponse("Duplicate value violates a unique constraint.", {
        status: 409,
      });
    }

    return new NextResponse(err?.message ? String(err.message) : "Update failed", {
      status: 500,
    });
  }
}
