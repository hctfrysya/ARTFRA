
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function DELETE() {
  const client = await pool.connect();

  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (
      user.role !== "curator" ||
      user.curator_status !== "rejected"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya curator yang ditolak yang dapat menghapus akun.",
        },
        { status: 403 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM users
       WHERE id = $1
       AND role = 'curator'
       AND curator_status = 'rejected'
       RETURNING id`,
      [user.id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan atau tidak memenuhi syarat." },
        { status: 404 }
      );
    }

    await client.query("COMMIT");

    const response = NextResponse.json({
      success: true,
      message: "Akun curator berhasil dihapus.",
    });

    response.cookies.set("artfra_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete rejected curator error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus akun curator." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
