
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportArtwork({ artworkId }) {
  const router = useRouter();

  const [reason, setReason] = useState("inappropriate");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/artworks/${artworkId}/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, details }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      setMessage(data.message);
      
      if (response.ok) {
        setDetails("");
      }
    } catch {
      setMessage("Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 border-t border-[#e5e5e1] pt-8">
      <h2 className="font-heading text-xl font-bold">
        Report Artwork
      </h2>

      <p className="mt-2 text-sm text-[#777]">
        Laporkan karya jika menurutmu melanggar aturan platform.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-[#ddd] bg-white p-3 text-sm"
        >
          <option value="inappropriate">Inappropriate Content</option>
          <option value="copyright">Copyright Violation</option>
          <option value="spam">Spam</option>
          <option value="violence">Violence</option>
          <option value="other">Other</option>
        </select>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Jelaskan alasan laporan (opsional)..."
          className="w-full rounded-xl border border-[#ddd] p-3 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Submit Report"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-[#777]">{message}</p>
      )}
    </section>
  );
}
