"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        console.log("DATA PROFILE:", data);
        
        if (!response.ok) {
          router.push("/login");
          return;
        }

        setUser(data.profile || data.user || data);
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  if (loading) {
    return <main className="px-6 py-24 text-center">Loading profile...</main>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Creator Profile
      </p>

      <div className="mt-8 rounded-2xl border border-[#e5e5e1] bg-white p-8 md:p-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#202020] font-heading text-3xl font-bold text-white">
          {(user.display_name || user.username || "U").charAt(0).toUpperCase()}
        </div>

        <h1 className="mt-6 font-heading text-3xl font-extrabold">
          {user.display_name || user.username}
        </h1>

        <p className="mt-2 text-sm text-[#777]">
          @{user.username}
        </p>

        
        <div className="my-8 border-t border-[#e5e5e1]" />

        <div className="grid gap-6 sm:grid-cols-2">
            <div>
                <p className="text-xs uppercase tracking-widest text-[#999]">
                Email Address
                </p>
                <p className="mt-2 text-sm font-medium">{user.email}</p>
            </div>

            <div>
                <p className="text-xs uppercase tracking-widest text-[#999]">
                Account Role
                </p>
                <p className="mt-2 text-sm font-medium">{user.role}</p>
            </div>
        </div>

        <div className="mt-8 border-t border-[#e5e5e1] pt-8">
            <h2 className="font-heading text-lg font-bold">About Me</h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#777]">
                {user.bio || "This creator hasn't added a bio yet."}
            </p>
        </div>

        <div className="mt-8">
            <h2 className="font-heading text-lg font-bold">Social Links</h2>

        <div className="mt-4 flex flex-wrap gap-3">
            {user.website_url && (
                <a href={user.website_url} target="_blank" rel="noopener noreferrer"
                    className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:border-black">
                    Website ↗
                </a>
            )}

            {user.instagram_url && (
            <a href={user.instagram_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:border-black">
                Instagram ↗
            </a>
            )}

            {user.behance_url && (
            <a href={user.behance_url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:border-black">
                Behance ↗
            </a>
            )}
        </div>
        </div>


        <div className="mt-10 flex flex-wrap gap-3">
            <Link
                href="/profile/edit"
                className="rounded-full bg-[#202020] px-6 py-3 text-sm !text-white"
            >
                Edit Profile
            </Link>

            <Link
                href="/dashboard"
                className="rounded-full border border-[#ddd] px-6 py-3 text-sm"
            >
                Back to Dashboard
            </Link>
        </div>
      </div>
    </main>
  );
}
