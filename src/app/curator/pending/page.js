
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CuratorPendingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || data.user?.role !== "curator") {
          router.replace("/login");
          return;
        }

        if (data.user.curator_status === "approved") {
          router.replace("/curator/dashboard");
          return;
        }

        if (data.user.curator_status === "rejected") {
          setUser(data.user);
          return;
        }

        setUser(data.user);
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, [router]);

  async function handleDeleteAccount() {
    const confirmed = confirm(
      "Yakin ingin menghapus akun curator ini secara permanen?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/curator/application", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus akun.");
        return;
      }

      alert("Akun berhasil dihapus.");
      router.replace("/register");
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus akun.");
    }
  }

  if (loading || !user) {
    return (
      <main className="p-10 text-center">
        Memuat informasi akun...
      </main>
    );
  }

  const rejected = user.curator_status === "rejected";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-[#e5e5e1] bg-white p-8 text-center md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[3px] text-neutral-500">
          Artfra Curator Application
        </p>

        <h1 className="mt-5 font-heading text-3xl font-bold">
          {rejected ? "Application Rejected" : "Application Pending"}
        </h1>

        <p className="mt-5 text-sm leading-7 text-neutral-500">
          {rejected
            ? "Mohon maaf, pengajuan curator kamu belum dapat disetujui. Kamu dapat menghapus akun ini secara permanen."
            : "Pengajuan curator kamu sedang menunggu pemeriksaan administrator. Silakan kembali lagi setelah proses peninjauan selesai."}
        </p>

        <p className="mt-6 text-sm text-neutral-500">
          Username: <strong>{user.username}</strong>
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          Status:{" "}
          <strong className="capitalize">
            {user.curator_status || "pending"}
          </strong>
        </p>

        {rejected ? (
          <button
            onClick={handleDeleteAccount}
            className="mt-8 rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white"
          >
            Delete Account
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white"
          >
            Back to Home
          </button>
        )}
      </div>
    </main>
  );
}
