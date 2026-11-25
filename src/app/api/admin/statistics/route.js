
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = true) AS total_users,
        (SELECT COUNT(*) FROM artworks WHERE is_hidden = false) AS total_artworks,
        (SELECT COUNT(*) FROM categories) AS total_categories,
        (SELECT COUNT(*) FROM challenges) AS total_challenges,
        (SELECT COUNT(*) FROM curator_applications WHERE status = 'pending') AS pending_applications,
        (SELECT COUNT(*) FROM artwork_reports WHERE status = 'pending') AS pending_reports
    `);

    return NextResponse.json({
      success: true,
      statistics: result.rows[0],
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik." },
      { status: 500 }
    );
  }
}
