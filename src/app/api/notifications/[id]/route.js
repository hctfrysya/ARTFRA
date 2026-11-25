
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function PATCH(request, { params }) {
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
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, type, message, link, is_read, created_at`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Notifikasi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil ditandai sudah dibaca.",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui notifikasi." },
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
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Notifikasi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus notifikasi." },
      { status: 500 }
    );
  }
}
