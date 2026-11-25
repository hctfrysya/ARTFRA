
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getNotifications() {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setMessage(data.message || "Gagal mengambil notifikasi.");
          return;
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        setMessage("Terjadi kesalahan saat mengambil notifikasi.");
      } finally {
        setLoading(false);
      }
    }

    getNotifications();
  }, [router]);

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-6 py-16 md:px-12">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
        Your Activity
      </p>

      <h1 className="mt-3 font-heading text-4xl font-extrabold">
        Notifications
      </h1>

      <p className="mt-3 text-sm text-[#777]">
        Lihat aktivitas terbaru yang berkaitan dengan akunmu.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-[#777]">Memuat notifikasi...</p>
      ) : message ? (
        <p className="mt-10 text-sm text-red-600">{message}</p>
      ) : notifications.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#e5e5e1] bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-bold">
            No Notifications Yet
          </h2>
          <p className="mt-2 text-sm text-[#888]">
            Notifikasi aktivitasmu akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-xl border border-[#e5e5e1] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm leading-6">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-[#999]">
                    {new Date(notification.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                {!notification.is_read && (
                  <span className="shrink-0 rounded-full bg-[#171717] px-3 py-1 text-xs text-white">
                    New
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/dashboard"
        className="mt-10 inline-block text-sm font-semibold underline"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
