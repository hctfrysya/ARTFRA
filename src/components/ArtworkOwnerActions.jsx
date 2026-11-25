
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtworkOwnerActions({ artworkId, ownerId }) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function checkOwner() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (
          response.ok &&
          String(data.user?.id) === String(ownerId)
        ) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Gagal memeriksa pemilik artwork:", error);
      }
    }

    checkOwner();
  }, [ownerId]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus artwork ini?"
    );

    if (!confirmed) return;

    const response = await fetch(`/api/artworks/${artworkId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (!isOwner) return null;

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={() => router.push(`/artworks/${artworkId}/edit`)}
        className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
      >
        Edit Artwork
      </button>

      <button
        onClick={handleDelete}
        className="rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-600"
      >
        Delete Artwork
      </button>
    </div>
  );
}
