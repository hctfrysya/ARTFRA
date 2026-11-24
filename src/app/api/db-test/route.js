import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name"
    );

    return NextResponse.json({
      success: true,
      message: "Database berhasil terhubung!",
      database: result.rows[0].database_name,
    });

  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal.",
      },
      { status: 500 }
    );
  }
}
