
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

// Menampilkan semua pengguna (khusus admin)
export async function GET() {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT
        id,
        username,
        display_name,
        email,
        role,
        curator_status,
        is_active,
        created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar pengguna." },
      { status: 500 }
    );
  }
}
