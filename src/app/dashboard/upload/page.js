"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadArtworkPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    tags: "",
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Mengambil kategori dari database
  useEffect(() => {
    async function getCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories || []);
        } else {
          setMessage(data.message || "Gagal mengambil kategori.");
        }
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        setMessage("Tidak dapat mengambil data kategori.");
      } finally {
        setLoadingCategories(false);
      }
    }

    getCategories();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleImageChange(event) {
    const selectedImage = event.target.files[0];

    if (!selectedImage) return;

    if (!selectedImage.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setMessage("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(selectedImage);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!image) {
      setMessage("Pilih gambar artwork terlebih dahulu.");
      return;
    }

    if (!form.category_id) {
      setMessage("Pilih kategori artwork terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category_id", form.category_id);
    formData.append("tags", form.tags);
    formData.append("image", image);

    try {
      const response = await fetch("/api/artworks", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Gagal mengunggah artwork.");
        return;
      }

      router.push("/artworks");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Terjadi kesalahan saat mengunggah artwork.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Share Your Creativity
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold">
        Upload Artwork.
      </h1>

      <p className="mt-3 text-sm text-[#777]">
        Share your creative work with the ARTFRA community.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Artwork Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Enter artwork title"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Tell us about your artwork..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Category
          </label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            disabled={loadingCategories}
            className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
          >
            <option value="">
              {loadingCategories ? "Loading categories..." : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 && (
            <p className="mt-2 text-xs text-red-600">
              Belum ada kategori tersedia.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Tags
          </label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="digital art, illustration, creative"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Artwork Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full rounded-xl border border-[#ddd] bg-white p-4 text-sm"
          />
          <p className="mt-2 text-xs text-[#999]">
            Format gambar, maksimal 5 MB.
          </p>
          {image && (
            <p className="mt-2 text-sm text-[#777]">
              Selected: {image.name}
            </p>
          )}
        </div>

        {message && (
          <p className="text-sm text-red-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading || loadingCategories || categories.length === 0}
          className="w-full rounded-full bg-[#202020] py-4 text-sm font-semibold text-white transition hover:bg-[#444] disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Publish Artwork"}
        </button>
      </form>
    </main>
  );
}