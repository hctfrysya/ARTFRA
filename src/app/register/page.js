
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registrasi gagal.");
        return;
      }

      router.push("/login");
    } catch (error) {
      setMessage("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[3px] text-[#888]">
          Join The Community
        </p>

        <h1 className="mt-4 text-center font-heading text-4xl font-extrabold">
          Create Account.
        </h1>

        <p className="mt-3 text-center text-sm text-[#777]">
          Start sharing your creativity with ARTFRA.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {[
            { name: "username", label: "Username", type: "text" },
            { name: "display_name", label: "Display Name", type: "text" },
            { name: "email", label: "Email Address", type: "email" },
            { name: "password", label: "Password", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-semibold">
                {field.label}
              </label>

              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>
          ))}

          {message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#202020] py-4 text-sm font-semibold text-white hover:bg-[#444] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#777]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-black underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
