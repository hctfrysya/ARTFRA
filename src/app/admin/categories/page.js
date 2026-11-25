
"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setMessage(data.message || "Gagal mengambil kategori.");
      }
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const url = editingId
      ? `/api/categories/${editingId}`
      : "/api/categories";

    const method = editingId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Gagal menyimpan kategori.");
        return;
      }

      setMessage(data.message);
      setName("");
      setDescription("");
      setEditingId(null);
      loadCategories();
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;

    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      loadCategories();
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-6 py-16 md:px-12">
      <a href="/admin" className="text-sm text-[#777] hover:text-black">
        ← Back to Admin Dashboard
      </a>

      <h1 className="mt-6 font-heading text-4xl font-extrabold">
        Manage Categories
      </h1>

      <p className="mt-3 text-sm text-[#777]">
        Tambah, edit, dan hapus kategori artwork ARTFRA.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-2xl border border-[#e5e5e1] bg-white p-6"
      >
        <h2 className="font-heading text-xl font-bold">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <label className="mt-6 block text-sm font-semibold">
          Nama Kategori
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Contoh: Digital Illustration"
          className="mt-2 w-full rounded-xl border border-[#ddd] px-4 py-3 text-sm outline-none focus:border-black"
        />

        <label className="mt-5 block text-sm font-semibold">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi kategori..."
          rows={3}
          className="mt-2 w-full rounded-xl border border-[#ddd] px-4 py-3 text-sm outline-none focus:border-black"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-[#333]"
          >
            {editingId ? "Save Changes" : "Add Category"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-[#ddd] px-6 py-3 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && (
        <p className="mt-5 rounded-xl bg-[#f0f0ed] p-4 text-sm">
          {message}
        </p>
      )}

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold">
          All Categories ({categories.length})
        </h2>

        {loading ? (
          <p className="mt-6 text-sm text-[#777]">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="mt-6 text-sm text-[#777]">Belum ada kategori.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e5e5e1] bg-white p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-[#888]">
                    {category.description || "Tidak ada deskripsi"}
                  </p>
                  <p className="mt-1 text-xs text-[#aaa]">
                    Slug: {category.slug}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="rounded-full border border-[#ddd] px-4 py-2 text-xs font-semibold hover:bg-[#f5f5f3]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
