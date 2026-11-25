"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArtworkGrid from "@/components/ArtworkGrid";

export default function LikesPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getLikes() {
      try {
        const response = await fetch("/api/likes");
        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.ok) {
          setArtworks(data.likes || []);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar likes:", error);
      } finally {
        setLoading(false);
      }
    }

    getLikes();
  }, [router]);

  if (loading) {
    return <main className="px-6 py-24 text-center">Loading likes...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Your Collection
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold">
        My Likes<span className="text-[#999]">.</span>
      </h1>

      <p className="mt-3 mb-10 text-sm text-[#777]">
        Artwork yang pernah kamu sukai.
      </p>

      <ArtworkGrid artworks={artworks} />
    </main>
  );
}