
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function PATCH(request, { params }) {
  const client = await pool.connect();

  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["dismissed", "taken_down"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const report = await client.query(
      `SELECT id, artwork_id, status
       FROM artwork_reports
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (report.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (report.rows[0].status !== "pending") {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Laporan sudah ditangani." },
        { status: 400 }
      );
    }

    const artworkId = report.rows[0].artwork_id;

    if (status === "taken_down") {
        await client.query(
            `UPDATE artworks
            SET is_hidden = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [artworkId]
        );
  }

    const result = await client.query(
      `UPDATE artwork_reports
       SET status = $1,
           handled_by = $2,
           handled_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, admin.id, id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: status === "dismissed"
        ? "Laporan berhasil ditolak."
        : "Laporan ditangani dan karya diturunkan.",
      report: result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Handle report error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menangani laporan." },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}
