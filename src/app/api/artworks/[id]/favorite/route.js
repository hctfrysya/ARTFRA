import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const artwork = await pool.query(
      "SELECT id FROM artworks WHERE id = $1",
      [id]
    );

    if (artwork.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan." },
        { status: 404 }
      );
    }

    const existingFavorite = await pool.query(
      `SELECT user_id FROM artwork_favorites
       WHERE user_id = $1 AND artwork_id = $2`,
      [user.id, id]
    );

    if (existingFavorite.rows.length > 0) {
      await pool.query(
        `DELETE FROM artwork_favorites
         WHERE user_id = $1 AND artwork_id = $2`,
        [user.id, id]
      );

      return NextResponse.json({
        success: true,
        favorited: false,
        message: "Artwork dihapus dari favorit.",
      });
    }

    await pool.query(
      `INSERT INTO artwork_favorites (user_id, artwork_id)
       VALUES ($1, $2)`,
      [user.id, id]
    );

    return NextResponse.json({
      success: true,
      favorited: true,
      message: "Artwork berhasil ditambahkan ke favorit.",
    });
  } catch (error) {
    console.error("Favorite error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}