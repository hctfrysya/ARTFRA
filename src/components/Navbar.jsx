
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Discover", href: "/" },
  { label: "Explore Art", href: "/artworks" },
  { label: "Challenges", href: "/challenges" },
  { label: "Creators", href: "/creators" },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (response.ok) {
          setUser(data.user || data);
        }
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setMenuOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="relative z-50 border-b border-[#e5e5e1] bg-[#f8f8f6]">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 md:px-12 md:py-5">
        <Link
          href="/"
          onClick={closeMenu}
          className="shrink-0 font-heading text-2xl font-extrabold tracking-[-1.5px]"
        >
          ARTFRA.
        </Link>

        {/* Navigasi Desktop */}
        <div className="hidden items-center gap-6 text-sm text-[#555] lg:flex xl:gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Tombol Desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link href="/notifications" className="text-sm hover:text-black">
                Notifications
              </Link>

              {user.role === "admin" && (
                <Link href="/admin" className="text-sm">
                  Admin
                </Link>
              )}

              {user.role === "curator" && (
                <Link href="/curator/dashboard" className="text-sm">
                  Curator
                </Link>
              )}

              <Link href="/dashboard" className="text-sm">
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ddd] px-5 py-2.5 text-sm transition hover:border-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm">
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#202020] px-5 py-2.5 text-sm text-white transition hover:bg-[#444]"
              >
                Join Us
              </Link>
            </>
          )}
        </div>

        {/* Tombol Menu Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] text-xl lg:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-[#e5e5e1] bg-[#f8f8f6] px-5 py-6 shadow-lg lg:hidden sm:px-8">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-sm text-[#555] hover:text-black"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-[#e5e5e1] pt-5">
              {user ? (
                <div className="flex flex-col gap-5">
                  <Link href="/notifications" onClick={closeMenu} className="text-sm">
                    Notifications
                  </Link>

                  {user.role === "admin" && (
                    <Link href="/admin" onClick={closeMenu} className="text-sm">
                      Admin Dashboard
                    </Link>
                  )}

                  {user.role === "curator" && (
                    <Link href="/curator/dashboard" onClick={closeMenu} className="text-sm">
                      Curator Dashboard
                    </Link>
                  )}

                  <Link href="/dashboard" onClick={closeMenu} className="text-sm">
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full border border-[#ddd] px-5 py-3 text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-full border border-[#ddd] px-5 py-3 text-center text-sm"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="rounded-full bg-[#202020] px-5 py-3 text-center text-sm text-white"
                  >
                    Join Us
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
