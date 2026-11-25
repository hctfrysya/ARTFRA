"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CuratorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authResponse = await fetch("/api/auth/me");
        const authData = await authResponse.json();

        if (!authResponse.ok || authData.user?.role !== "curator") {
            router.replace("/login");
            return;
        }

        if (authData.user.curator_status !== "approved") {
            router.replace("/curator/pending");
            return;
        }

        setUser(authData.user);

        const response = await fetch("/api/challenges");
        const data = await response.json();

        if (response.ok) {
          const ownChallenges = (data.challenges || []).filter(
            (challenge) =>
              String(challenge.curator_id) === String(authData.user.id)
          );

          setChallenges(ownChallenges);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleDelete(id) {
    const confirmed = confirm(
      "Yakin ingin menghapus challenge ini? Challenge yang sudah memiliki submission tidak dapat dihapus."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus challenge.");
        return;
      }

      alert("Challenge berhasil dihapus.");

      setChallenges((previous) =>
        previous.filter((challenge) => challenge.id !== id)
      );
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus challenge.");
    }
  }

  if (loading) {
    return <main className="p-10 text-center">Memuat dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Artfra Creator Panel
        </p>

        <h1 className="mt-3 font-heading text-4xl font-bold">
          Curator Dashboard
        </h1>

        <p className="mt-3 text-neutral-500">
          Selamat datang, {user?.display_name}.
          Kelola challenge dan pantau partisipasi peserta di sini.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-neutral-500">Total Challenge</p>
            <p className="mt-2 text-3xl font-bold">{challenges.length}</p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-neutral-500">Challenge Aktif</p>
            <p className="mt-2 text-3xl font-bold">
              {challenges.filter((item) => item.status === "Ongoing").length}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">
            My Challenges
          </h2>

          <Link
            href="/curator/challenges/create"
            className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            + Create Challenge
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-neutral-500">
            Kamu belum memiliki challenge.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-2xl border bg-white p-6"
              >
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  {challenge.status}
                </span>

                <h3 className="mt-3 font-heading text-xl font-bold">
                  {challenge.title}
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  {challenge.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="rounded-full border px-4 py-2 text-sm"
                  >
                    View Challenge
                  </Link>

                  <Link
                    href={`/curator/challenges/${challenge.id}/submissions`}
                    className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white"
                  >
                    View Submissions
                  </Link>

                  <Link
                    href={`/curator/challenges/${challenge.id}/edit`}
                    className="rounded-full border border-blue-600 px-4 py-2 text-sm text-blue-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(challenge.id)}
                    className="rounded-full border border-red-500 px-4 py-2 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
