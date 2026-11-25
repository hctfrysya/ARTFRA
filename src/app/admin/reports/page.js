
"use client";

import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadReports() {
    try {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Gagal mengambil laporan.");
        return;
      }

      setReports(data.reports || []);
    } catch (error) {
      setMessage("Terjadi kesalahan saat mengambil laporan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleReport(id, status) {
    const action = status === "dismissed" ? "menolak laporan ini" : "menurunkan artwork ini";

    if (!confirm(`Yakin ingin ${action}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menangani laporan.");
        return;
      }

      alert(data.message);
      loadReports();
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Administration
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-neutral-900">
            Artwork Reports
          </h1>
          <p className="mt-3 text-neutral-500">
            Kelola laporan artwork yang dikirimkan oleh pengguna.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Total laporan</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {reports.length}
          </p>
        </div>

        {message && (
          <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-neutral-500">
            Memuat laporan...
          </p>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="text-neutral-500">Belum ada laporan artwork.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="h-48 w-full overflow-hidden rounded-xl bg-neutral-100 md:w-56">
                    <img
                      src={report.artwork_image}
                      alt={report.artwork_title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase">
                        {report.status}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(report.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <h2 className="font-heading text-xl font-bold text-neutral-900">
                      {report.artwork_title}
                    </h2>

                    <div className="mt-3 space-y-1 text-sm text-neutral-600">
                      <p>
                        Creator: @{report.creator_username}
                      </p>
                      <p>
                        Reporter: @{report.reporter_username}
                      </p>
                      <p>
                        Reason: {report.reason}
                      </p>
                    </div>

                    {report.details && (
                      <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">
                        {report.details}
                      </p>
                    )}

                    {report.status === "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleReport(report.id, "dismissed")}
                          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-100"
                        >
                          Dismiss Report
                        </button>

                        <button
                          onClick={() => handleReport(report.id, "taken_down")}
                          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
                        >
                          Take Down Artwork
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
