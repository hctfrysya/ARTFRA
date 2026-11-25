import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(request) {
  try {
    // Memeriksa apakah pengguna sudah login
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // Hanya member yang dapat mengajukan diri sebagai curator
    if (user.role !== "member") {
      return NextResponse.json(
        { success: false, message: "Hanya member yang dapat mengajukan permohonan curator." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason, portfolio_url } = body;

    // Validasi alasan pengajuan
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Alasan pengajuan minimal 10 karakter." },
        { status: 400 }
      );
    }

    // Validasi URL portofolio jika diisi
    if (
      portfolio_url &&
      !/^https?:\/\/.+/.test(portfolio_url)
    ) {
      return NextResponse.json(
        { success: false, message: "URL portofolio tidak valid." },
        { status: 400 }
      );
    }

    // Memeriksa pengajuan sebelumnya
    const existing = await pool.query(
      `SELECT id, status
       FROM curator_applications
       WHERE user_id = $1`,
      [user.id]
    );

    if (existing.rows.length > 0) {
      const application = existing.rows[0];

      // Pengajuan yang masih pending atau sudah approved tidak bisa diajukan ulang
      if (application.status !== "rejected") {
        return NextResponse.json(
          { success: false, message: "Anda sudah memiliki pengajuan curator." },
          { status: 409 }
        );
      }

      // Pengajuan yang ditolak dapat diajukan ulang
      const result = await pool.query(
        `UPDATE curator_applications
         SET reason = $1,
             portfolio_url = $2,
             status = 'pending',
             reviewed_by = NULL,
             reviewed_at = NULL,
             created_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING *`,
        [reason.trim(), portfolio_url || null, user.id]
      );

      return NextResponse.json({
        success: true,
        message: "Pengajuan curator berhasil dikirim ulang.",
        application: result.rows[0],
      });
    }

    // Membuat pengajuan baru
    const result = await pool.query(
      `INSERT INTO curator_applications
       (user_id, reason, portfolio_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user.id, reason.trim(), portfolio_url || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Pengajuan curator berhasil dikirim.",
        application: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CURATOR APPLICATION POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
