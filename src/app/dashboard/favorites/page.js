"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArtworkGrid from "@/components/ArtworkGrid";

export default function FavoritesPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFavorites() {
      try {
        const response = await fetch("/api/favorites");
        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.ok) {
          setArtworks(data.favorites || []);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    getFavorites();
  }, [router]);

  if (loading) {
    return <main className="px-6 py-24 text-center">Loading favorites...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Your Collection
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold">
        My Favorites<span className="text-[#999]">.</span>
      </h1>

      <p className="mt-3 mb-10 text-sm text-[#777]">
        Artwork yang kamu simpan sebagai favorit.
      </p>

      <ArtworkGrid artworks={artworks} />
    </main>
  );
}