
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
      `SELECT id, type, message, link, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      total: result.rows.length,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil notifikasi." },
      { status: 500 }
    );
  }
}
