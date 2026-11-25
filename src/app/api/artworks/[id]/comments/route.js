
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET semua komentar pada artwork
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT
        c.id,
        c.content,
        c.created_at,
        u.id AS user_id,
        u.username,
        u.display_name,
        u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.artwork_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil komentar." },
      { status: 500 }
    );
  }
}

// POST menambahkan komentar
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
    const data = await request.json();
    const content = data.content?.trim();

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Komentar tidak boleh kosong." },
        { status: 400 }
      );
    }

    const artwork = await pool.query(
      `SELECT id, user_id, title
       FROM artworks
       WHERE id = $1 AND is_hidden = FALSE`,
      [id]
    );

    if (artwork.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan." },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, artwork_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user.id, id, content]
    );

    if (String(artwork.rows[0].user_id) !== String(user.id)) {
      await createNotification({
        userId: artwork.rows[0].user_id,
        type: "comment",
        message: `${user.display_name} mengomentari artwork "${artwork.rows[0].title}".`,
        link: `/artworks/${id}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Komentar berhasil ditambahkan.",
        comment: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add comment error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
