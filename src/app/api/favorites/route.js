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
        f.created_at AS favorited_at
       FROM artwork_favorites f
       JOIN artworks a ON f.artwork_id = a.id
       JOIN users u ON a.user_id = u.id
       JOIN categories c ON a.category_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      favorites: result.rows,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar favorit." },
      { status: 500 }
    );
  }
}