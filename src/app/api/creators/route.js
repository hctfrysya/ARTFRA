
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.bio,
        COUNT(a.id)::int AS total_artworks
       FROM users u
       LEFT JOIN artworks a
         ON a.user_id = u.id
         AND a.is_hidden = false
       WHERE u.is_active = true
       GROUP BY u.id
       ORDER BY total_artworks DESC, u.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      creators: result.rows,
    });
  } catch (error) {
    console.error("Get creators error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar creator.",
      },
      { status: 500 }
    );
  }
}
