
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.join(process.cwd(), "public", "uploads");

const allowedTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Menampilkan semua artwork
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.tags,
        a.created_at,
        u.id AS user_id,
        u.username,
        u.display_name,
        c.name AS category_name
       FROM artworks a
       JOIN users u ON a.user_id = u.id
       JOIN categories c ON a.category_id = c.id
       WHERE a.is_hidden = FALSE
       ORDER BY a.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      artworks: result.rows,
    });
  } catch (error) {
    console.error("Get artworks error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil artwork." },
      { status: 500 }
    );
  }
}

// Mengunggah artwork
export async function POST(request) {
  let savedFile = null;

  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (
      user.role === "curator" &&
      user.curator_status !== "approved"
    ) {
      return NextResponse.json(
        { success: false, message: "Akun curator belum disetujui." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim();
    const categoryId = Number(formData.get("category_id"));
    const tagsInput = formData.get("tags")?.trim();
    const image = formData.get("image");

    if (
      !title ||
      !description ||
      !categoryId ||
      !tagsInput ||
      !image ||
      typeof image === "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak valid." },
        { status: 400 }
      );
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tags.length === 0) {
      return NextResponse.json(
        { success: false, message: "Minimal satu tag wajib diisi." },
        { status: 400 }
      );
    }

    if (image.size === 0 || image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar maksimal 5 MB." },
        { status: 400 }
      );
    }

    const extension = allowedTypes[image.type];

    if (!extension) {
      return NextResponse.json(
        { success: false, message: "Format gambar harus JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    const category = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (category.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await image.arrayBuffer());

    await writeFile(filePath, buffer);

    savedFile = filePath;

    const imageUrl = `/uploads/${filename}`;

    const result = await pool.query(
      `INSERT INTO artworks
       (user_id, category_id, title, description, image_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.id,
        categoryId,
        title,
        description,
        imageUrl,
        tags,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Artwork berhasil diunggah.",
        artwork: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (savedFile) {
      await unlink(savedFile).catch(() => {});
    }

    console.error("Create artwork error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengunggah artwork." },
      { status: 500 }
    );
  }
}
