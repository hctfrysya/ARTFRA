
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
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
      `SELECT
        cs.id,
        cs.challenge_id,
        cs.artwork_id,
        cs.submitted_at,
        a.title AS artwork_title
       FROM challenge_submissions cs
       JOIN artworks a ON a.id = cs.artwork_id
       WHERE cs.challenge_id = $1
       AND cs.member_id = $2
       AND cs.withdrawn_at IS NULL`,
      [id, user.id]
    );

    return NextResponse.json({
      success: true,
      submission: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Gagal mengambil submission:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data submission." },
      { status: 500 }
    );
  }
}
