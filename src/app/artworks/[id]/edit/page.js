
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditArtworkPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [artworkResponse, categoryResponse, userResponse] =
          await Promise.all([
            fetch(`/api/artworks/${id}`),
            fetch("/api/categories"),
            fetch("/api/auth/me"),
          ]);

        const artworkData = await artworkResponse.json();
        const categoryData = await categoryResponse.json();
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          router.push("/login");
          return;
        }

        if (!artworkResponse.ok) {
          setMessage("Artwork tidak ditemukan.");
          return;
        }

        const artwork = artworkData.artwork;

        if (String(artwork.user_id) !== String(userData.user.id)) {
          setMessage("Kamu tidak memiliki akses untuk mengedit artwork ini.");
          return;
        }

        setTitle(artwork.title);
        setDescription(artwork.description || "");
        setCategoryId(String(artwork.category_id));
        setTags((artwork.tags || []).join(", "));
        setCategories(categoryData.categories || []);
      } catch (error) {
        setMessage("Gagal mengambil data artwork.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      router.push(`/artworks/${id}`);
      router.refresh();
    } catch {
      setMessage("Gagal memperbarui artwork.");
    }
  }

  if (loading) {
    return <main className="p-16 text-center">Loading...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <h1 className="font-heading text-4xl font-extrabold">
        Edit Artwork
      </h1>

      {message && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-sm font-semibold">Judul</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-[#ddd] p-3"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="mt-2 w-full rounded-xl border border-[#ddd] p-3"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Kategori</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-[#ddd] p-3"
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">
            Tags (pisahkan dengan koma)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
            placeholder="digital art, illustration"
            className="mt-2 w-full rounded-xl border border-[#ddd] p-3"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-black px-7 py-3 text-sm font-semibold text-white"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
