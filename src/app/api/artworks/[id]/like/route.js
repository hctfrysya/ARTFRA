
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

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
      "SELECT id, user_id, title FROM artworks WHERE id = $1 AND is_hidden = FALSE",
      [id]
    );

    if (artwork.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan." },
        { status: 404 }
      );
    }

    const existingLike = await pool.query(
      `SELECT user_id FROM artwork_likes
       WHERE user_id = $1 AND artwork_id = $2`,
      [user.id, id]
    );

    if (existingLike.rows.length > 0) {
      await pool.query(
        `DELETE FROM artwork_likes
         WHERE user_id = $1 AND artwork_id = $2`,
        [user.id, id]
      );

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Like berhasil dibatalkan.",
      });
    }

    await pool.query(
      `INSERT INTO artwork_likes (user_id, artwork_id)
       VALUES ($1, $2)`,
      [user.id, id]
    );

    if (String(artwork.rows[0].user_id) !== String(user.id)) {
      await createNotification({
        userId: artwork.rows[0].user_id,
        type: "like",
        message: `${user.display_name} menyukai artwork "${artwork.rows[0].title}".`,
        link: `/artworks/${id}`,
      });
    }

    return NextResponse.json({
      success: true,
      liked: true,
      message: "Artwork berhasil disukai.",
    });
  } catch (error) {
    console.error("Like error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
