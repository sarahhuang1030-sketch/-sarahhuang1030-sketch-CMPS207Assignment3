export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

function getExtFromName(name = "") {
  const m = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : "";
}

function guessContentType(filename = "") {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER;

    if (!accountName || !accountKey || !containerName) {
      return NextResponse.json(
        { ok: false, error: "Missing Azure storage environment variables" },
        { status: 500 }
      );
    }

    // Convert to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = String(file.name || "upload").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const ext = getExtFromName(safeBase);
    const blobName = `${Date.now()}_${safeBase || "upload"}${ext && safeBase.endsWith(ext) ? "" : ""}`;

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Optional: ensure container exists (safe to keep; may require permissions)
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlockBlobClient(blobName);

    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: guessContentType(safeBase),
        blobCacheControl: "public, max-age=31536000, immutable",
      },
    });

    // This is the public URL to the blob
    const url = blobClient.url;

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
