
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Edit kategori
export async function PATCH(request, { params }) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
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
      `UPDATE categories
       SET name = $1,
           slug = $2,
           description = $3
       WHERE id = $4
       RETURNING id, name, slug, description`,
      [name, slug, description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui.",
      category: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Nama atau slug kategori sudah digunakan." },
        { status: 409 }
      );
    }

    console.error("Update category error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui kategori." },
      { status: 500 }
    );
  }
}

// Hapus kategori
export async function DELETE(request, { params }) {
  try {
    const admin = await requireRole("admin");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus.",
    });
  } catch (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak dapat dihapus karena masih digunakan oleh artwork.",
        },
        { status: 409 }
      );
    }

    console.error("Delete category error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori." },
      { status: 500 }
    );
  }
}
