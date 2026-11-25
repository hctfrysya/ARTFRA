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
    const { submission_id, rank } = body;

    if (!submission_id || ![1, 2, 3].includes(Number(rank))) {
      return NextResponse.json(
        { success: false, message: "Submission ID dan rank 1-3 wajib diisi." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const challenge = await client.query(
        `SELECT id, curator_id, title, end_date
         FROM challenges
         WHERE id = $1
         FOR UPDATE`,
        [id]
      );

      if (challenge.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, message: "Challenge tidak ditemukan." },
          { status: 404 }
        );
      }

      const data = challenge.rows[0];

      if (
        user.role !== "admin" &&
        (
          user.role !== "curator" ||
          user.curator_status !== "approved" ||
          String(data.curator_id) !== String(user.id)
        )
      ) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, message: "Kamu tidak memiliki akses." },
          { status: 403 }
        );
      }

      if (new Date(data.end_date) > new Date()) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, message: "Challenge belum berakhir." },
          { status: 400 }
        );
      }

      const submission = await client.query(
        `SELECT id, member_id
         FROM challenge_submissions
         WHERE id = $1
         AND challenge_id = $2
         AND withdrawn_at IS NULL`,
        [submission_id, id]
      );

      if (submission.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            success: false,
            message: "Submission tidak ditemukan atau sudah ditarik.",
          },
          { status: 404 }
        );
      }

      const result = await client.query(
        `INSERT INTO challenge_winners
         (challenge_id, submission_id, rank)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, submission_id, Number(rank)]
      );

      // Membuat notifikasi untuk pemenang
      await client.query(
        `INSERT INTO notifications (user_id, type, message, link)
         VALUES ($1, $2, $3, $4)`,
        [
          submission.rows[0].member_id,
          "challenge_winner",
          `Selamat! Kamu terpilih sebagai pemenang peringkat ${rank} dalam challenge "${data.title}".`,
          `/challenges/${id}`,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Pemenang challenge berhasil ditentukan.",
          winner: result.rows[0],
        },
        { status: 201 }
      );

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Select challenge winner error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Rank sudah digunakan atau submission sudah menjadi pemenang.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal menentukan pemenang." },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT
        cw.id,
        cw.challenge_id,
        cw.submission_id,
        cw.rank,
        cw.selected_at,
        u.username AS member_username,
        u.display_name AS member_name,
        a.id AS artwork_id,
        a.title AS artwork_title,
        a.image_url AS artwork_image
       FROM challenge_winners cw
       JOIN challenge_submissions cs
         ON cw.submission_id = cs.id
       JOIN users u ON cs.member_id = u.id
       JOIN artworks a ON cs.artwork_id = a.id
       WHERE cw.challenge_id = $1
       ORDER BY cw.rank ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      winners: result.rows,
    });

  } catch (error) {
    console.error("Get challenge winners error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar pemenang.",
      },
      { status: 500 }
    );
  }
}
