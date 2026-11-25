"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Email atau password salah.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
          Welcome Back
        </p>

        <h1 className="mt-4 text-center font-heading text-4xl font-extrabold">
          Login.
        </h1>

        <p className="mt-3 text-center text-sm text-[#777]">
          Welcome back to the ARTFRA community.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#202020] py-4 text-sm font-semibold text-white hover:bg-[#444] disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#777]">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-black underline">
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}
