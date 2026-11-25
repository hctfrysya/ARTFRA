import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

// Menampilkan seluruh pengajuan curator (khusus admin)
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
        ca.id,
        ca.user_id,
        ca.reason,
        ca.portfolio_url,
        ca.status,
        ca.reviewed_by,
        ca.reviewed_at,
        ca.created_at,
        u.username,
        u.display_name,
        u.email
       FROM curator_applications ca
       JOIN users u ON ca.user_id = u.id
       ORDER BY
         CASE WHEN ca.status = 'pending' THEN 0 ELSE 1 END,
         ca.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      applications: result.rows,
    });

  } catch (error) {
    console.error("Get curator applications error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengajuan curator." },
      { status: 500 }
    );
  }
}
