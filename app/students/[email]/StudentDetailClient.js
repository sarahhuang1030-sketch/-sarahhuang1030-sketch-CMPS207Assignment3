"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function StudentDetailClient({ student }) {
  const router = useRouter();
  const fileRef = useRef(null);

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [form, setForm] = useState({ ...student });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);

  // Uploads file to /api/upload and returns { url }
  async function uploadPhoto(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    if (!data?.url) throw new Error("Upload did not return a file URL");

    return data.url;
  }

  async function handleReplacePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      setUploadingPhoto(true);

      // 1) Upload file locally
      const newUrl = await uploadPhoto(file);

      // 2) Persist url to DB (PUT student by email)
      const res = await fetch(
        `/api/students/${encodeURIComponent(student.email)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_picture_url: newUrl }),
        }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Photo update failed");

      // 3) Update UI immediately
      setForm((prev) => ({ ...prev, profile_picture_url: newUrl }));
      router.refresh();
    } catch (err) {
      setError(err?.message || "Photo update failed");
    } finally {
      setUploadingPhoto(false);
      // allow uploading the same file again
      if (e?.target) e.target.value = "";
    }
  }

  async function handleSave() {
    setError(null);
    try {
      setSaving(true);

      // Don’t allow changing email via edit mode unless you support it server-side
      const { email, ...payload } = form;

      const res = await fetch(
        `/api/students/${encodeURIComponent(student.email)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Update failed");

      setMode("view");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    const ok = confirm(`Delete ${student.email}?`);
    if (!ok) return;

    const res = await fetch(
      `/api/students/${encodeURIComponent(student.email)}`,
      { method: "DELETE" }
    );

    const text = await res.text();
    if (!res.ok) {
      setError(text || "Delete failed");
      return;
    }

    router.push("/");
    router.refresh();
  }

 // const photoSrc = form.profile_picture_url || "/1.jpg";


const raw = form.profile_picture_url;

const photoSrc =
  !raw ? "/1.jpg" :
  raw.startsWith("http") || raw.startsWith("/") ? raw :
  `/uploads/${raw}`;


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-10">
      {error && (
        <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
            <img
              src={photoSrc}
              alt="Student Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {form.first_name} {form.last_name}
            </h1>
            <p className="text-gray-600">{student.email}</p>
          </div>
        </div>

        {/* buttons */}
        <div className="flex gap-2">
          {mode === "view" ? (
            <>
              <button
                onClick={() => setMode("edit")}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setForm({ ...student });
                  setMode("view");
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* change avatar */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Replace Photo
        </label>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {uploadingPhoto ? "Uploading..." : "Choose Photo"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleReplacePhoto}
            className="hidden"
            disabled={uploadingPhoto}
          />
        </div>
      </div>

      {/* details */}
      <div className="mt-6 space-y-3 text-gray-700">
        {mode === "view" ? (
          <>
            <p>
              <strong>Phone:</strong> {student.phone}
            </p>
            <p>
              <strong>Address:</strong> {student.street_address}, {student.city},{" "}
              {student.province_state}, {student.country} {student.postal_code}
            </p>
            <p>
              <strong>Program:</strong> {student.program}
            </p>
            <p>
              <strong>Year:</strong> {student.year}
            </p>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["first_name", "First name"],
              ["last_name", "Last name"],
              ["phone", "Phone"],
              ["street_address", "Street address"],
              ["city", "City"],
              ["province_state", "Province/State"],
              ["country", "Country"],
              ["postal_code", "Postal code"],
              ["program", "Program"],
              ["year", "Year"],
            ].map(([key, label]) => (
              <input
                key={key}
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                value={form[key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={label}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
