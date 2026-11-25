
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChallengeSubmission({ challengeId }) {
  const router = useRouter();

  const [artworks, setArtworks] = useState([]);
  const [artworkId, setArtworkId] = useState("");
  const [submission, setSubmission] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [userResponse, artworkResponse, submissionResponse] =
          await Promise.all([
            fetch("/api/auth/me"),
            fetch("/api/artworks"),
            fetch(`/api/challenges/${challengeId}/my-submission`),
          ]);

        const userData = await userResponse.json();
        const artworkData = await artworkResponse.json();
        const submissionData = await submissionResponse.json();

        if (userResponse.status === 401) {
          setMessage("Silakan login sebagai member untuk mengikuti challenge.");
          return;
        }

        if (userData.user?.role !== "member") {
          setMessage("Hanya member yang dapat mengikuti challenge.");
          return;
        }

        if (submissionData.success) {
          setSubmission(submissionData.submission);
        }

        if (artworkResponse.ok) {
          const userId = String(userData.user.id);

          setArtworks(
            (artworkData.artworks || []).filter(
              (artwork) => String(artwork.user_id) === userId
            )
          );
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        setMessage("Gagal memuat data challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [challengeId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!artworkId) {
      setMessage("Pilih artwork terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/challenges/${challengeId}/submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artwork_id: artworkId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setSubmission({
        ...data.submission,
        artwork_title:
          artworks.find((artwork) => String(artwork.id) === artworkId)?.title,
      });

      setMessage("Artwork berhasil dikirim!");
      setArtworkId("");
      router.refresh();
    } catch (error) {
      setMessage("Terjadi kesalahan saat mengirim artwork.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="mt-8 text-sm text-[#777]">Memuat submission...</p>;
  }

  return (
    <div className="mt-10 border-t border-[#eee] pt-8">
      <h2 className="font-heading text-xl font-bold">
        Challenge Submission
      </h2>

      {submission ? (
        <div className="mt-5 rounded-xl border border-[#ddd] bg-[#f5f4f1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#777]">
            Already Submitted
          </p>

          <h3 className="mt-3 font-heading text-xl font-bold">
            {submission.artwork_title}
          </h3>

          <p className="mt-2 text-sm text-[#777]">
            Submission berhasil tercatat.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#777]">
            Pilih salah satu artwork milikmu untuk mengikuti challenge ini.
          </p>

          <form onSubmit={handleSubmit} className="mt-5">
            <select
              value={artworkId}
              onChange={(event) => setArtworkId(event.target.value)}
              className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">Pilih artwork</option>

              {artworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={submitting || artworks.length === 0}
              className="mt-4 rounded-full bg-[#171717] px-7 py-3 text-sm font-semibold text-white hover:bg-[#444] disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Submit Artwork"}
            </button>
          </form>

          {artworks.length === 0 && (
            <p className="mt-4 text-sm text-[#888]">
              Belum ada artwork. Upload artwork terlebih dahulu.
            </p>
          )}
        </>
      )}

      {message && (
        <p className="mt-4 text-sm text-[#777]">{message}</p>
      )}
    </div>
  );
}
