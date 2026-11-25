
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

// Menampilkan detail pengguna (khusus admin)
export async function GET(request, { params }) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      `SELECT
        id,
        username,
        display_name,
        email,
        role,
        curator_status,
        avatar_url,
        bio,
        website_url,
        instagram_url,
        behance_url,
        is_active,
        created_at,
        updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get admin user detail error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail pengguna." },
      { status: 500 }
    );
  }
}


// Mengubah role pengguna (khusus admin)
export async function PATCH(request, { params }) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role, is_active } = body;

    if (!["member", "curator"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid." },
        { status: 400 }
      );
    }

    if (is_active !== undefined && typeof is_active !== "boolean") {
        return NextResponse.json(
            { success: false, message: "Status akun tidak valid." },
            { status: 400 }
        );
    }

    if (String(admin.id) === String(id)) {
      return NextResponse.json(
        { success: false, message: "Admin tidak dapat mengubah role sendiri." },
        { status: 403 }
      );
    }

    const result = await pool.query(
        `UPDATE users
         SET role = $1::varchar,
            curator_status = CASE
                WHEN $1::varchar = 'member'::varchar THEN NULL
                WHEN users.role <> 'curator' THEN 'pending'
                ELSE users.curator_status
            END,
            is_active = COALESCE($2, is_active),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, username, display_name, role, curator_status, is_active`,
        [role, is_active ?? null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Role pengguna berhasil diperbarui.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengubah role pengguna." },
      { status: 500 }
    );
  }
}


// Menghapus pengguna (khusus admin)
export async function DELETE(request, { params }) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (Number(id) === admin.id) {
      return NextResponse.json(
        { success: false, message: "Admin tidak dapat menonaktifkan akunnya sendiri." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET is_active = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, username, display_name, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dinonaktifkan.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}