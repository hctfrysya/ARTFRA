import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT status, reason, portfolio_url, created_at
       FROM curator_applications
       WHERE user_id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: result.rows[0],
      curator_status: user.curator_status,
    });
  } catch (error) {
    console.error("Curator status error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
