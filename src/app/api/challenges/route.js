import { NextResponse } from "next/server";
import { requireApprovedCurator } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET semua challenge
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        ch.*,
        u.username AS curator_username,
        u.display_name AS curator_name,
        (
          SELECT COUNT(*)
          FROM challenge_submissions cs
          WHERE cs.challenge_id = ch.id
            AND cs.withdrawn_at IS NULL
        ) AS total_submissions
       FROM challenges ch
       JOIN users u ON ch.curator_id = u.id
       ORDER BY ch.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      challenges: result.rows,
    });
  } catch (error) {
    console.error("Get challenges error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar challenge." },
      { status: 500 }
    );
  }
}

// POST membuat challenge
export async function POST(request) {
  try {
    const user = await requireApprovedCurator();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya curator yang sudah disetujui yang dapat membuat challenge.",
        },
        { status: 403 }
      );
    }

    const data = await request.json();

    const title = data.title?.trim();
    const description = data.description?.trim();
    const rules = data.rules?.trim();
    const prize = data.prize?.trim() || null;
    const banner_url = data.banner_url?.trim() || null;
    const start_date = data.start_date;
    const end_date = data.end_date;

    if (
      !title ||
      !description ||
      !rules ||
      !start_date ||
      !end_date
    ) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib harus diisi." },
        { status: 400 }
      );
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal selesai harus setelah tanggal mulai.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO challenges
       (curator_id, title, description, rules, prize,
        banner_url, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.id,
        title,
        description,
        rules,
        prize,
        banner_url,
        start,
        end,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Challenge berhasil dibuat.",
        challenge: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create challenge error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal membuat challenge." },
      { status: 500 }
    );
  }
}