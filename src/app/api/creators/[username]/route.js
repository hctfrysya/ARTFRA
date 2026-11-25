import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    const creatorResult = await pool.query(
      `SELECT
        id,
        username,
        display_name,
        avatar_url,
        bio,
        website_url,
        instagram_url,
        behance_url,
        created_at
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (creatorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Creator tidak ditemukan." },
        { status: 404 }
      );
    }

    const creator = creatorResult.rows[0];

    const artworkResult = await pool.query(
      `SELECT
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.tags,
        a.created_at,
        c.name AS category_name
       FROM artworks a
       JOIN categories c ON a.category_id = c.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [creator.id]
    );

    return NextResponse.json({
      success: true,
      creator,
      artworks: artworkResult.rows,
    });
  } catch (error) {
    console.error("Creator profile error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil profil creator." },
      { status: 500 }
    );
  }
}