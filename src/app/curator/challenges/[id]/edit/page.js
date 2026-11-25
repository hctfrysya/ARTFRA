
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditChallengePage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    rules: "",
    prize: "",
    banner_url: "",
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      try {
        const response = await fetch(`/api/challenges/${id}`);
        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          router.replace("/curator/dashboard");
          return;
        }

        const challenge = data.challenge;

        setForm({
          title: challenge.title || "",
          description: challenge.description || "",
          rules: challenge.rules || "",
          prize: challenge.prize || "",
          banner_url: challenge.banner_url || "",
          start_date: challenge.start_date
            ? new Date(challenge.start_date).toISOString().slice(0, 16)
            : "",
          end_date: challenge.end_date
            ? new Date(challenge.end_date).toISOString().slice(0, 16)
            : "",
        });
      } catch {
        alert("Gagal mengambil data challenge.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadChallenge();
  }, [id, router]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui challenge.");
        return;
      }

      alert("Challenge berhasil diperbarui.");
      router.push("/curator/dashboard");
      router.refresh();
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-10 text-center">Memuat challenge...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold">
          Edit Challenge
        </h1>

        <p className="mt-3 text-neutral-500">
          Perbarui informasi challenge milikmu.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border bg-white p-8"
        >
          {[
            { name: "title", label: "Judul Challenge", required: true },
            { name: "description", label: "Deskripsi", required: true, area: true },
            { name: "rules", label: "Aturan Challenge", required: true, area: true },
            { name: "prize", label: "Hadiah" },
            { name: "banner_url", label: "Banner URL" },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-semibold">
                {field.label}
              </label>

              {field.area ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  rows={4}
                  className="w-full rounded-xl border p-3"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.name === "banner_url" ? "url" : "text"}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full rounded-xl border p-3"
                />
              )}
            </div>
          ))}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tanggal Mulai
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tanggal Selesai
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border px-6 py-3"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-neutral-900 px-6 py-3 text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
