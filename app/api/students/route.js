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

// ====== File field (must match your <input name="...">) ======
    const file = form.get("profile_picture"); // change to "profile_picture" etc. if your form uses a different name


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


    // ====== Upload to Azure Blob (if file provided) ======
    let profile_picture_url = null;

    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      const containerName = process.env.AZURE_STORAGE_CONTAINER; // e.g. "student-images"

      if (!account || !key || !containerName) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Missing Azure Storage env vars: AZURE_STORAGE_ACCOUNT_NAME / AZURE_STORAGE_ACCOUNT_KEY / AZURE_STORAGE_CONTAINER",
          },
          { status: 500 }
        );
      }

      const conn = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
      const blobService = BlobServiceClient.fromConnectionString(conn);
      const container = blobService.getContainerClient(containerName);

      const originalName = (file.name || "upload").replace(/\s+/g, "-");
      const blobName = `${Date.now()}_${crypto.randomUUID()}_${originalName}`;

      const bytes = Buffer.from(await file.arrayBuffer());
      const blob = container.getBlockBlobClient(blobName);

      await blob.uploadData(bytes, {
        blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
      });

      profile_picture_url = blob.url;
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

    return NextResponse.json(
      { ok: true, profile_picture_url },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/students failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
