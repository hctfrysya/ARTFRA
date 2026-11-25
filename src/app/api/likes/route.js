import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.tags,
        a.created_at,
        u.username,
        u.display_name,
        c.name AS category_name,
        l.created_at AS liked_at
       FROM artwork_likes l
       JOIN artworks a ON l.artwork_id = a.id
       JOIN users u ON a.user_id = u.id
       JOIN categories c ON a.category_id = c.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      likes: result.rows,
    });
  } catch (error) {
    console.error("Get likes error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar likes." },
      { status: 500 }
    );
  }
}