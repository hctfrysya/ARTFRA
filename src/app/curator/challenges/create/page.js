
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateChallengePage() {
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Gagal membuat challenge.");
        return;
      }

      alert("Challenge berhasil dibuat!");
      router.push("/curator/dashboard");
      router.refresh();
    } catch (error) {
      setMessage("Terjadi kesalahan saat membuat challenge.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-bold">
        Create Challenge
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Buat challenge baru untuk komunitas seni.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            placeholder="Challenge title"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            placeholder="Describe your challenge"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Rules</label>
          <textarea
            name="rules"
            value={form.rules}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            placeholder="Challenge rules"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Prize</label>
          <input
            name="prize"
            value={form.prize}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            placeholder="Prize (optional)"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Banner URL</label>
          <input
            name="banner_url"
            value={form.banner_url}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Start Date</label>
          <input
            type="datetime-local"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">End Date</label>
          <input
            type="datetime-local"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        {message && (
          <p className="text-sm text-red-600">{message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-gray-300 px-6 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Challenge"}
          </button>
        </div>
      </form>
    </main>
  );
}
