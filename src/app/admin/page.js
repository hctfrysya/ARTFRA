
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        if (data.user?.role !== "admin") {
          router.push("/");
          return;
        }

        setUser(data.user);

        const statsResponse = await fetch("/api/admin/statistics");
        const statsData = await statsResponse.json();

        if (statsResponse.ok) {
          setStatistics(statsData.statistics);
        }
      } catch (error) {
        console.error("Gagal memuat dashboard admin:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <main className="px-6 py-24 text-center text-sm text-[#777]">
        Loading admin dashboard...
      </main>
    );
  }

  if (!user) return null;

  const menus = [
    {
      title: "Manage Users",
      description: "Melihat dan mengelola akun pengguna ARTFRA.",
      href: "/admin/users",
    },
    {
      title: "Artwork Reports",
      description: "Memeriksa laporan terhadap artwork.",
      href: "/admin/reports",
    },
    {
      title: "Curator Applications",
      description: "Meninjau pengajuan menjadi curator.",
      href: "/admin/curator-applications",
    },
    {
      title: "Manage Categories",
      description: "Mengelola kategori untuk pengelompokan artwork.",
      href: "/admin/categories",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-6 py-16 md:px-12">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        ARTFRA Administration
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
        Admin Dashboard
      </h1>

      <p className="mt-4 text-sm text-[#777]">
        Welcome, {user.display_name || user.username}. Kelola aktivitas
        platform ARTFRA melalui dashboard ini.
      </p>

      {statistics && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            ["Total Users", statistics.total_users],
            ["Total Artworks", statistics.total_artworks],
            ["Categories", statistics.total_categories],
            ["Challenges", statistics.total_challenges],
            ["Pending Curator", statistics.pending_applications],
            ["Pending Reports", statistics.pending_reports],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#e5e5e1] bg-white p-6"
            >
              <p className="text-sm text-[#888]">{label}</p>
              <p className="mt-3 font-heading text-3xl font-bold">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="rounded-2xl border border-[#e5e5e1] bg-white p-7 transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="font-heading text-xl font-bold">
              {menu.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#777]">
              {menu.description}
            </p>

            <p className="mt-6 text-sm font-semibold">
              Open Management →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
