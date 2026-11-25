
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.rules,
        c.prize,
        c.banner_url,
        c.start_date,
        c.end_date,
        c.created_at,
        u.username AS curator_username,
        u.display_name AS curator_name,
        COUNT(cs.id) AS total_submissions
       FROM challenges c
       JOIN users u ON c.curator_id = u.id
       LEFT JOIN challenge_submissions cs
         ON c.id = cs.challenge_id
         AND cs.withdrawn_at IS NULL
       WHERE c.id = $1
       GROUP BY c.id, u.username, u.display_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      challenge: result.rows[0],
    });
  } catch (error) {
    console.error("Get challenge detail error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail challenge." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user || (user.role !== "admin" &&
        (user.role !== "curator" || user.curator_status !== "approved"))) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      rules,
      prize,
      banner_url,
      start_date,
      end_date,
    } = body;

    const existing = await pool.query(
      "SELECT * FROM challenges WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak ditemukan." },
        { status: 404 }
      );
    }

    const challenge = existing.rows[0];

    if (user.role !== "admin" &&
        String(challenge.curator_id) !== String(user.id)) {
      return NextResponse.json(
        { success: false, message: "Kamu bukan pemilik challenge ini." },
        { status: 403 }
      );
    }

    const newTitle = title ?? challenge.title;
    const newDescription = description ?? challenge.description;
    const newRules = rules ?? challenge.rules;
    const newPrize = prize === undefined ? challenge.prize : prize;
    const newBanner = banner_url === undefined ? challenge.banner_url : banner_url;
    const newStart = start_date ?? challenge.start_date;
    const newEnd = end_date ?? challenge.end_date;

    if (!newTitle.trim() || !newDescription.trim() || !newRules.trim()) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, dan aturan wajib diisi." },
        { status: 400 }
      );
    }

    if (new Date(newEnd) <= new Date(newStart)) {
      return NextResponse.json(
        { success: false, message: "Tanggal berakhir harus setelah tanggal mulai." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE challenges
       SET title = $1,
           description = $2,
           rules = $3,
           prize = $4,
           banner_url = $5,
           start_date = $6,
           end_date = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        newTitle,
        newDescription,
        newRules,
        newPrize,
        newBanner,
        newStart,
        newEnd,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Challenge berhasil diperbarui.",
      challenge: result.rows[0],
    });
  } catch (error) {
    console.error("Update challenge error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui challenge." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth();

    if (!user || (user.role !== "admin" &&
        (user.role !== "curator" || user.curator_status !== "approved"))) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await pool.query(
      "SELECT curator_id FROM challenges WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Challenge tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.role !== "admin" &&
        String(existing.rows[0].curator_id) !== String(user.id)) {
      return NextResponse.json(
        { success: false, message: "Kamu bukan pemilik challenge ini." },
        { status: 403 }
      );
    }

    const submissions = await pool.query(
      "SELECT id FROM challenge_submissions WHERE challenge_id = $1 LIMIT 1",
      [id]
    );

    if (submissions.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Challenge tidak dapat dihapus karena sudah memiliki submission.",
        },
        { status: 409 }
      );
    }

    await pool.query("DELETE FROM challenges WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Challenge berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete challenge error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus challenge." },
      { status: 500 }
    );
  }
}
