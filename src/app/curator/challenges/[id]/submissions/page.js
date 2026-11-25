
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function SubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [submissions, setSubmissions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [selectedRanks, setSelectedRanks] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    async function loadData() {
      try {
        const [submissionResponse, winnerResponse] = await Promise.all([
          fetch(`/api/challenges/${id}/submissions`),
          fetch(`/api/challenges/${id}/winners`),
        ]);

        const submissionData = await submissionResponse.json();
        const winnerData = await winnerResponse.json();

        if (
          submissionResponse.status === 401 ||
          winnerResponse.status === 401
        ) {
          router.replace("/login");
          return;
        }

        if (
          submissionResponse.status === 403 ||
          winnerResponse.status === 403
        ) {
          setMessage("Kamu tidak memiliki akses ke halaman ini.");
          return;
        }

        if (!submissionResponse.ok) {
          setMessage(
            submissionData.message ||
              "Tidak dapat mengambil submissions."
          );
          return;
        }

        setSubmissions(submissionData.submissions || []);

        if (winnerResponse.ok) {
          const currentWinners = winnerData.winners || [];
          setWinners(currentWinners);

          const ranks = {};

          currentWinners.forEach((winner) => {
            ranks[winner.rank] = String(winner.submission_id);
          });

          setSelectedRanks(ranks);
        }
      } catch (error) {
        setMessage("Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);


  function handleRankChange(rank, submissionId) {
    setSelectedRanks((previous) => {
      const updated = { ...previous };

      if (submissionId) {
        updated[rank] = submissionId;
      } else {
        delete updated[rank];
      }

      return updated;
    });
  }

  async function handleSelectWinner(rank) {
    const submissionId = selectedRanks[rank];

    if (!submissionId) {
      alert("Pilih peserta terlebih dahulu.");
      return;
    }

    const alreadyWinner = winners.some(
      (winner) => String(winner.submission_id) === String(submissionId)
    );

    if (alreadyWinner) {
      alert("Submission ini sudah menjadi pemenang.");
      return;
    }

    const confirmed = confirm(
      `Tetapkan submission ini sebagai pemenang peringkat ${rank}?`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/challenges/${id}/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
          rank: Number(rank),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menentukan pemenang.");
        return;
      }

      alert(data.message || "Pemenang berhasil ditentukan.");

      const winnerResponse = await fetch(`/api/challenges/${id}/winners`);
      const winnerData = await winnerResponse.json();

      if (winnerResponse.ok) {
        setWinners(winnerData.winners || []);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menentukan pemenang.");
    } finally {
      setSaving(false);
    }
  }

  const isAlreadyWinner = (submissionId) =>
    winners.some(
      (winner) => String(winner.submission_id) === String(submissionId)
    );

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-6 py-16 md:px-12">
      <Link
        href={`/challenges/${id}`}
        className="text-sm text-[#777] hover:text-black"
      >
        ← Kembali ke Challenge
      </Link>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
          Curator Dashboard
        </p>

        <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
          Challenge Submissions
        </h1>

        <p className="mt-3 text-sm text-[#777]">
          Total submission: {submissions.length}
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-[#e5e5e1] bg-white p-6">
        <h2 className="font-heading text-xl font-bold">
          Challenge Winners
        </h2>

        <p className="mt-2 text-sm text-[#777]">
          Pilih peserta untuk setiap peringkat. Challenge harus sudah berakhir
          sebelum pemenang dapat ditentukan.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((rank) => {
            const existingWinner = winners.find(
              (winner) => Number(winner.rank) === rank
            );

            return (
              <div
                key={rank}
                className="rounded-xl border border-[#e5e5e1] p-4"
              >
                <p className="font-semibold">
                  Peringkat {rank}
                </p>

                {existingWinner ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium">
                      {existingWinner.member_name ||
                        existingWinner.member_username}
                    </p>
                    <p className="mt-1 text-xs text-[#888]">
                      {existingWinner.artwork_title}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-green-700">
                      Pemenang ditetapkan
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedRanks[rank] || ""}
                      onChange={(e) =>
                        handleRankChange(rank, e.target.value)
                      }
                      className="mt-3 w-full rounded-xl border border-[#e5e5e1] p-3 text-sm"
                    >
                      <option value="">Pilih peserta</option>

                      {submissions.map((submission) => (
                        <option
                          key={submission.id}
                          value={String(submission.id)}
                          disabled={isAlreadyWinner(submission.id)}
                        >
                          {submission.title} -{" "}
                          {submission.display_name || submission.username}
                          {isAlreadyWinner(submission.id)
                            ? " (Sudah menang)"
                            : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleSelectWinner(rank)}
                      disabled={saving || !selectedRanks[rank]}
                      className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {saving ? "Menyimpan..." : "Tetapkan Pemenang"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {loading ? (
        <p className="mt-10 text-sm text-[#777]">
          Memuat submissions...
        </p>
      ) : message ? (
        <p className="mt-10 text-sm text-red-600">{message}</p>
      ) : submissions.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#e5e5e1] bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-bold">
            Belum Ada Submission
          </h2>
          <p className="mt-2 text-sm text-[#888]">
            Submission peserta akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => {
            const winner = winners.find(
              (item) =>
                String(item.submission_id) === String(submission.id)
            );

            return (
              <article
                key={submission.id}
                className="overflow-hidden rounded-2xl border border-[#e5e5e1] bg-white"
              >
                <img
                  src={submission.image_url}
                  alt={submission.title}
                  className="aspect-[4/5] w-full object-cover"
                />

                <div className="p-5">
                  {winner && (
                    <p className="mb-3 text-xs font-bold uppercase text-green-700">
                      Pemenang Peringkat {winner.rank}
                    </p>
                  )}

                  <h2 className="font-heading text-lg font-bold">
                    {submission.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#777]">
                    By {submission.display_name || submission.username}
                  </p>

                  <p className="mt-2 text-xs text-[#999]">
                    Submitted:{" "}
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>

                  {submission.description && (
                    <p className="mt-4 text-sm leading-6 text-[#777]">
                      {submission.description}
                    </p>
                  )}

                  <Link
                    href={`/artworks/${submission.artwork_id}`}
                    className="mt-5 inline-block text-sm font-semibold underline"
                  >
                    View Artwork
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
