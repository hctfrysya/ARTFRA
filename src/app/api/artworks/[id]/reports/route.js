import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request, { params }) {
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
        {
          success: false,
          message: "Hanya member yang dapat melaporkan artwork.",
        },
        { status: 403 }
      );
    }
    const { id } = await params;
    const data = await request.json();

    const reason = data.reason?.trim();
    const details = data.details?.trim() || null;

    const allowedReasons = [
      "inappropriate",
      "copyright",
      "spam",
      "violence",
      "other",
    ];

    if (!allowedReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, message: "Alasan laporan tidak valid." },
        { status: 400 }
      );
    }

    const artwork = await pool.query(
      "SELECT user_id FROM artworks WHERE id = $1",
      [id]
    );

    if (artwork.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan." },
        { status: 404 }
      );
    }

    if (Number(artwork.rows[0].user_id) === Number(user.id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak dapat melaporkan artwork sendiri.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO artwork_reports
       (artwork_id, reporter_id, reason, details)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, user.id, reason, details]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Laporan berhasil dikirim.",
        report: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu sudah pernah melaporkan artwork ini.",
        },
        { status: 409 }
      );
    }

    console.error("Report artwork error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}