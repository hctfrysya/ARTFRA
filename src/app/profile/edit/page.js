
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    website_url: "",
    instagram_url: "",
    behance_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const profile = data.profile;

        setForm({
          display_name: profile.display_name || "",
          bio: profile.bio || "",
          website_url: profile.website_url || "",
          instagram_url: profile.instagram_url || "",
          behance_url: profile.behance_url || "",
        });
      } catch (error) {
        setMessage("Gagal mengambil data profil.");
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [router]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Gagal memperbarui profil.");
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch (error) {
      setMessage("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="px-6 py-24 text-center text-sm text-[#777]">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Account Settings
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold">
        Edit Profile.
      </h1>

      <p className="mt-3 text-sm text-[#777]">
        Update your information and tell others about yourself.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {[
          { name: "display_name", label: "Display Name", required: true },
          { name: "website_url", label: "Website URL" },
          { name: "instagram_url", label: "Instagram URL" },
          { name: "behance_url", label: "Behance URL" },
        ].map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-semibold">
              {field.label}
            </label>

            <input
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required}
              className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Bio
          </label>

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Tell us about yourself..."
          />
        </div>

        {message && (
          <p className="text-sm text-red-600">{message}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#202020] px-7 py-3 text-sm font-semibold text-white hover:bg-[#444] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="rounded-full border border-[#ddd] px-7 py-3 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
