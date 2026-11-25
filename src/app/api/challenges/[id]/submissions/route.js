
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


export async function POST(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (user.role !== "member") {
      return NextResponse.json(
        { success: false, message: "Hanya member yang dapat mengikuti challenge." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { artwork_id } = await request.json();

    if (!artwork_id) {
      return NextResponse.json(
        { success: false, message: "Pilih artwork terlebih dahulu." },
        { status: 400 }
      );
    }

    const challengeResult = await pool.query(
      `SELECT id, start_date, end_date
       FROM challenges
       WHERE id = $1`,
      [id]
    );

    if (challengeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak ditemukan." },
        { status: 404 }
      );
    }

    const challenge = challengeResult.rows[0];
    const now = new Date();

    if (
      now < new Date(challenge.start_date) ||
      now > new Date(challenge.end_date)
    ) {
      return NextResponse.json(
        { success: false, message: "Challenge sedang tidak menerima submission." },
        { status: 400 }
      );
    }

    const artworkResult = await pool.query(
      `SELECT id
       FROM artworks
       WHERE id = $1
         AND user_id = $2
         AND is_hidden = false`,
      [artwork_id, user.id]
    );

    if (artworkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan atau bukan milikmu." },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO challenge_submissions
       (challenge_id, member_id, artwork_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, user.id, artwork_id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Artwork berhasil dikirim ke challenge.",
        submission: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create submission error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu sudah mengirim submission atau artwork ini sudah digunakan.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal mengirim submission." },
      { status: 500 }
    );
  }
}
