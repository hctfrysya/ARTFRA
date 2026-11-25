"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtworkActions({ artworkId }) {
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // Mengecek status like dan favorite
  useEffect(() => {
    async function getStatus() {
      try {
        const [likeResponse, favoriteResponse] = await Promise.all([
          fetch("/api/likes"),
          fetch("/api/favorites"),
        ]);

        if (likeResponse.status === 401 || favoriteResponse.status === 401) {
          return;
        }

        const likeData = await likeResponse.json();
        const favoriteData = await favoriteResponse.json();

        if (likeResponse.ok) {
          setLiked(
            (likeData.likes || []).some(
              (item) => String(item.id) === String(artworkId)
            )
          );
        }

        if (favoriteResponse.ok) {
          setFavorited(
            (favoriteData.favorites || []).some(
              (item) => String(item.id) === String(artworkId)
            )
          );
        }
      } catch (error) {
        console.error("Gagal mengambil status artwork:", error);
      } finally {
        setLoading(false);
      }
    }

    getStatus();
  }, [artworkId]);

  // Proses Like atau Favorite
  async function handleAction(type) {
    if (processing) return;

    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/artworks/${artworkId}/${type}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Aksi gagal dilakukan.");
        return;
      }

      if (type === "like") {
        setLiked(data.liked);
      } else {
        setFavorited(data.favorited);
      }

      setMessage(data.message);
      router.refresh();
    } catch (error) {
      console.error("Gagal memproses aksi:", error);
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleAction("like")}
          disabled={loading || processing}
          className={`rounded-full border px-6 py-3 text-sm transition ${
            liked
              ? "border-[#202020] bg-[#202020] text-white"
              : "border-[#ddd] bg-white hover:border-black"
          } disabled:opacity-50`}
        >
          {liked ? "♥ Liked" : "♡ Like"}
        </button>

        <button
          onClick={() => handleAction("favorite")}
          disabled={loading || processing}
          className={`rounded-full border px-6 py-3 text-sm transition ${
            favorited
              ? "border-[#202020] bg-[#202020] text-white"
              : "border-[#ddd] bg-white hover:border-black"
          } disabled:opacity-50`}
        >
          {favorited ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-[#777]">{message}</p>
      )}
    </div>
  );
}