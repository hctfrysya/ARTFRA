
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

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
        ar.id,
        ar.artwork_id,
        ar.reporter_id,
        ar.reason,
        ar.details,
        ar.status,
        ar.created_at,
        u.username AS reporter_username,
        a.title AS artwork_title,
        a.image_url AS artwork_image,
        creator.username AS creator_username
       FROM artwork_reports ar
       JOIN users u ON ar.reporter_id = u.id
       JOIN artworks a ON ar.artwork_id = a.id
       JOIN users creator ON a.user_id = creator.id
       ORDER BY
         CASE WHEN ar.status = 'pending' THEN 0 ELSE 1 END,
         ar.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      reports: result.rows,
    });

  } catch (error) {
    console.error("Get reports error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil laporan." },
      { status: 500 }
    );
  }
}
