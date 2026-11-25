
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Menampilkan detail artwork
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT
        a.*,
        u.username,
        u.display_name,
        u.avatar_url,
        c.name AS category_name
       FROM artworks a
       JOIN users u ON a.user_id = u.id
       JOIN categories c ON a.category_id = c.id
       WHERE a.id = $1
        AND a.is_hidden = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Artwork tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      artwork: result.rows[0],
    });
  } catch (error) {
    console.error("Get artwork detail error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail artwork." },
      { status: 500 }
    );
  }
}

// Mengedit artwork
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
    const data = await request.json();

    const title = data.title?.trim();
    const description = data.description?.trim();
    const categoryId = Number(data.category_id);
    const tagsInput = data.tags;

    if (!title || !description || !tagsInput) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    const tags = Array.isArray(tagsInput)
      ? tagsInput.map((tag) => String(tag).trim()).filter(Boolean)
      : String(tagsInput)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    if (tags.length === 0) {
      return NextResponse.json(
        { success: false, message: "Minimal satu tag wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak valid." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE artworks
       SET title = $1,
           description = $2,
           category_id = $3,
           tags = $4,
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description, categoryId, tags, id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Artwork tidak ditemukan atau bukan milik kamu.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Artwork berhasil diperbarui.",
      artwork: result.rows[0],
    });
  } catch (error) {
    console.error("Update artwork error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui artwork." },
      { status: 500 }
    );
  }
}

// Menghapus artwork
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
      `DELETE FROM artworks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Artwork tidak ditemukan atau bukan milik kamu.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Artwork berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete artwork error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus artwork." },
      { status: 500 }
    );
  }
}
