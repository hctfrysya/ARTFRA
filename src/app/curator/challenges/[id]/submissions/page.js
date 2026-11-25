
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function SubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getSubmissions() {
      try {
        const response = await fetch(
          `/api/challenges/${id}/submissions`
        );

        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setMessage(data.message || "Tidak dapat mengambil submissions.");
          return;
        }

        setSubmissions(data.submissions || []);
      } catch (error) {
        setMessage("Terjadi kesalahan saat mengambil submissions.");
      } finally {
        setLoading(false);
      }
    }

    getSubmissions();
  }, [id, router]);

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

      {loading ? (
        <p className="mt-10 text-sm text-[#777]">Memuat submissions...</p>
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
          {submissions.map((submission) => (
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
                <h2 className="font-heading text-lg font-bold">
                  {submission.title}
                </h2>

                <p className="mt-2 text-sm text-[#777]">
                  By {submission.display_name || submission.username}
                </p>

                <p className="mt-2 text-xs text-[#999]">
                  Submitted:{" "}
                  {new Date(submission.submitted_at).toLocaleDateString("id-ID")}
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
          ))}
        </div>
      )}
    </main>
  );
}
