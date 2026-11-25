"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtworkComments({ artworkId }) {
  const router = useRouter();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mengambil komentar dari database
  useEffect(() => {
    async function getComments() {
      try {
        const response = await fetch(
          `/api/artworks/${artworkId}/comments`
        );

        const data = await response.json();

        if (response.ok) {
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error("Gagal mengambil komentar:", error);
      } finally {
        setLoading(false);
      }
    }

    getComments();
  }, [artworkId]);

  // Mengirim komentar baru
  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Komentar tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/artworks/${artworkId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Gagal mengirim komentar.");
        return;
      }

      // Mengambil ulang komentar agar nama user ikut tampil
      const refreshResponse = await fetch(
        `/api/artworks/${artworkId}/comments`
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        setComments(refreshData.comments || []);
      }

      setContent("");
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim komentar.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-[#e5e5e1] pt-10">
      <h2 className="font-heading text-2xl font-extrabold">
        Comments <span className="text-[#999]">({comments.length})</span>
      </h2>

      {/* Form komentar */}
      <form onSubmit={handleSubmit} className="mt-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this artwork..."
          rows={4}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-[#e5e5e1] bg-white p-4 text-sm outline-none transition focus:border-[#202020]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#999]">
            {content.length}/1000 characters
          </p>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-full bg-[#202020] px-6 py-3 text-sm text-white transition hover:bg-[#444] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Sending..." : "Post Comment"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* Daftar komentar */}
      <div className="mt-10 space-y-6">
        {loading ? (
          <p className="text-sm text-[#888]">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#888]">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 border-b border-[#e5e5e1] pb-6"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#202020] text-sm font-bold text-white">
                {comment.avatar_url ? (
                  <img
                    src={comment.avatar_url}
                    alt={comment.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (comment.display_name || comment.username || "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              {/* Isi komentar */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-bold">
                    {comment.display_name || comment.username}
                  </p>

                  <p className="text-xs text-[#999]">
                    @{comment.username}
                  </p>

                  <p className="text-xs text-[#999]">
                    {new Date(comment.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#666]">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}