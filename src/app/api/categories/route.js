
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Menampilkan semua kategori
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, created_at
       FROM categories
       ORDER BY name ASC`
    );

    return NextResponse.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil kategori." },
      { status: 500 }
    );
  }
}

// Menambahkan kategori (khusus Admin)
export async function POST(request) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const data = await request.json();

    const name = data.name?.trim();
    const description = data.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, description`,
      [name, slug, description]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil ditambahkan.",
        category: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Kategori sudah tersedia." },
        { status: 409 }
      );
    }

    console.error("Create category error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menambahkan kategori." },
      { status: 500 }
    );
  }
}
