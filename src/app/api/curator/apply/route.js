
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  const client = await pool.connect();

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
        { success: false, message: "Akun tidak dapat mengajukan curator." },
        { status: 403 }
      );
    }

    const data = await request.json();

    const reason = data.reason?.trim();
    const portfolio_url = data.portfolio_url?.trim() || null;

    if (!reason) {
      return NextResponse.json(
        { success: false, message: "Alasan pengajuan wajib diisi." },
        { status: 400 }
      );
    }

    if (portfolio_url) {
      try {
        new URL(portfolio_url);
      } catch {
        return NextResponse.json(
          { success: false, message: "URL portfolio tidak valid." },
          { status: 400 }
        );
      }
    }

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO curator_applications
       (user_id, reason, portfolio_url, status)
       VALUES ($1, $2, $3, 'pending')`,
      [user.id, reason, portfolio_url]
    );

    await client.query(
      `UPDATE users
       SET role = 'curator',
           curator_status = 'pending'
       WHERE id = $1`,
      [user.id]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Pengajuan curator berhasil dikirim. Menunggu verifikasi admin.",
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu sudah pernah mengajukan curator.",
        },
        { status: 409 }
      );
    }

    console.error("Curator application error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
