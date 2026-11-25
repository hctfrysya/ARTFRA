
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

// Menyetujui atau menolak pengajuan curator
export async function PATCH(request, { params }) {
  let client;
  let transactionStarted = false;

  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status pengajuan tidak valid." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const applicationResult = await client.query(
      `SELECT id, user_id, status
       FROM curator_applications
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (applicationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan." },
        { status: 404 }
      );
    }

    const application = applicationResult.rows[0];

    if (application.status !== "pending") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Pengajuan sudah pernah ditinjau." },
        { status: 409 }
      );
    }

    const userResult = await client.query(
      `SELECT id, is_active
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [application.user_id]
    );

    if (
      userResult.rows.length === 0 ||
      !userResult.rows[0].is_active
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Akun pemohon tidak aktif atau tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    await client.query(
      `UPDATE curator_applications
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, admin.id, id]
    );

    await client.query(
      `UPDATE users
       SET role = $1,
           curator_status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        status === "approved" ? "curator" : "member",
        status,
        application.user_id,
      ]
    );

    const message =
      status === "approved"
        ? "Selamat! Pengajuan curator kamu telah disetujui. Sekarang kamu dapat membuat challenge."
        : "Maaf, pengajuan curator kamu belum disetujui. Kamu dapat memperbaiki pengajuan dan mencoba kembali.";

    await client.query(
      `INSERT INTO notifications (user_id, type, message, link)
       VALUES ($1, $2, $3, $4)`,
      [
        application.user_id,
        "curator_application",
        message,
        "/profile",
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "Pengajuan curator berhasil disetujui."
          : "Pengajuan curator berhasil ditolak.",
      application: {
        id: application.id,
        user_id: application.user_id,
        status,
      },
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Review curator application error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses pengajuan curator.",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
