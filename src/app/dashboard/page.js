"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setUser(data.user || data);
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  if (loading) {
    return (
      <main className="px-6 py-24 text-center text-sm text-[#777]">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Your Creative Space
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
        Welcome, {user?.display_name || user?.username || "Creator"}.
      </h1>

      <p className="mt-4 text-sm text-[#777]">
        Manage your artworks and explore creative opportunities.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/upload" className="rounded-2xl bg-[#202020] p-8 text-white transition hover:bg-[#383838]">
          <p className="text-xs uppercase tracking-widest text-[#aaa]">Create</p>
          <h2 className="mt-5 font-heading text-2xl font-bold">Upload Artwork</h2>
          <p className="mt-3 text-sm text-[#ccc]">Share your latest creative work.</p>
          <p className="mt-8 text-sm">Upload Now ↗</p>
        </Link>

        <Link href="/artworks" className="rounded-2xl border border-[#e5e5e1] bg-white p-8 transition hover:border-black">
          <p className="text-xs uppercase tracking-widest text-[#888]">Discover</p>
          <h2 className="mt-5 font-heading text-2xl font-bold">Explore Art</h2>
          <p className="mt-3 text-sm text-[#777]">Find inspiration from other artists.</p>
          <p className="mt-8 text-sm">Explore Now ↗</p>
        </Link>

        <Link href="/profile" className="rounded-2xl border border-[#e5e5e1] bg-white p-8 transition hover:border-black">
          <p className="text-xs uppercase tracking-widest text-[#888]">Account</p>
          <h2 className="mt-5 font-heading text-2xl font-bold">My Profile</h2>
          <p className="mt-3 text-sm text-[#777]">View and manage your creator profile.</p>
          <p className="mt-8 text-sm">View Profile ↗</p>
        </Link>

        <Link
            href="/dashboard/likes"
            className="rounded-xl border border-[#e5e5e1] bg-white p-6 transition hover:border-black"
        >
            <h2 className="font-heading text-lg font-bold">My Likes</h2>
            <p className="mt-2 text-sm text-[#777]">
                View artworks you have liked.
            </p>
        </Link>

        <Link
            href="/dashboard/favorites"
            className="rounded-xl border border-[#e5e5e1] bg-white p-6 transition hover:border-black"
        >
            <h2 className="font-heading text-lg font-bold">My Favorites</h2>
            <p className="mt-2 text-sm text-[#777]">
                View your saved artworks.
            </p>
        </Link>
      </div>
    </main>
  );
}
