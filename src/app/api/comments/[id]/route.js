import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

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
      `DELETE FROM comments
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Komentar tidak ditemukan atau bukan milikmu.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Komentar berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}