
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const challenge = await pool.query(
      `SELECT id, curator_id
       FROM challenges
       WHERE id = $1`,
      [id]
    );

    if (challenge.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak ditemukan." },
        { status: 404 }
      );
    }

    if (
      user.role !== "admin" &&
      challenge.rows[0].curator_id !== user.id
    ) {
      return NextResponse.json(
        { success: false, message: "Kamu tidak memiliki akses." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT
        cs.id,
        cs.challenge_id,
        cs.member_id,
        cs.artwork_id,
        cs.submitted_at,
        u.username AS member_username,
        u.display_name AS member_name,
        a.title AS artwork_title,
        a.image_url AS artwork_image,
        a.description AS artwork_description
       FROM challenge_submissions cs
       JOIN users u ON cs.member_id = u.id
       JOIN artworks a ON cs.artwork_id = a.id
       WHERE cs.challenge_id = $1
       AND cs.withdrawn_at IS NULL
       ORDER BY cs.submitted_at DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      submissions: result.rows,
    });

  } catch (error) {
    console.error("Get submissions error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar submission." },
      { status: 500 }
    );
  }
}
