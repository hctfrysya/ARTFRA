
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

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
    const body = await request.json();
    const { artwork_id } = body;

    if (!artwork_id) {
      return NextResponse.json(
        { success: false, message: "Pilih karya terlebih dahulu." },
        { status: 400 }
      );
    }

    const challenge = await pool.query(
      `SELECT id FROM challenges
       WHERE id = $1
       AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date`,
      [id]
    );

    if (challenge.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak tersedia atau sudah berakhir." },
        { status: 400 }
      );
    }

    const artwork = await pool.query(
      `SELECT id FROM artworks
       WHERE id = $1 AND user_id = $2`,
      [artwork_id, user.id]
    );

    if (artwork.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Karya tidak ditemukan atau bukan milikmu." },
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

    return NextResponse.json({
      success: true,
      message: "Karya berhasil dikirim ke challenge.",
      submission: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error("Submit challenge error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Kamu sudah mengirim karya ke challenge ini atau karya sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal mengirim karya." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      `UPDATE challenge_submissions
       SET withdrawn_at = CURRENT_TIMESTAMP
       WHERE challenge_id = $1
       AND member_id = $2
       AND withdrawn_at IS NULL
       AND EXISTS (
         SELECT 1 FROM challenges
         WHERE challenges.id = $1
         AND challenges.end_date > CURRENT_TIMESTAMP
       )
       RETURNING *`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission tidak ditemukan atau challenge sudah berakhir.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission berhasil ditarik.",
      submission: result.rows[0],
    });

  } catch (error) {
    console.error("Withdraw submission error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menarik submission." },
      { status: 500 }
    );
  }
}