
"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data pengguna.");
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      alert("Terjadi kesalahan saat mengambil data pengguna.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateUser(user) {
    const newRole = prompt(
      "Masukkan role baru (member/curator):",
      user.role
    );

    if (newRole === null) return;

    if (newRole !== "member" && newRole !== "curator") {
      alert("Role harus member atau curator.");
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: newRole,
        is_active: user.is_active,
      }),
    });

    const data = await response.json();

    alert(data.message || (response.ok ? "Pengguna diperbarui." : "Gagal memperbarui pengguna."));

    if (response.ok) loadUsers();
  }

  async function toggleUser(user) {
    const action = user.is_active ? "menonaktifkan" : "mengaktifkan";

    if (!confirm(`Yakin ingin ${action} akun ${user.username}?`)) {
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: user.role === "admin" ? "member" : user.role,
        is_active: !user.is_active,
      }),
    });

    const data = await response.json();

    alert(data.message || (response.ok ? "Status akun diperbarui." : "Gagal memperbarui akun."));

    if (response.ok) loadUsers();
  }

  if (loading) {
    return <main className="min-h-screen p-10">Memuat pengguna...</main>;
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-gray-500 hover:text-black">
          ← Kembali ke Admin
        </a>

        <h1 className="mt-6 font-heading text-3xl font-bold">
          Manajemen Pengguna
        </h1>
        <p className="mt-2 text-gray-500">
          Kelola akun dan role pengguna ARTFRA.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    {user.is_active ? "Aktif" : "Nonaktif"}
                  </td>
                  <td className="space-x-2 p-4">
                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() => updateUser(user)}
                          className="rounded-full border px-3 py-1 hover:bg-gray-100"
                        >
                          Ubah Role
                        </button>
                        <button
                          onClick={() => toggleUser(user)}
                          className="rounded-full bg-black px-3 py-1 text-white hover:bg-gray-700"
                        >
                          {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="p-8 text-center text-gray-500">
              Belum ada data pengguna.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
