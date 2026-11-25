import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";


// GET profil user
export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT id, username, display_name, email, role,
              curator_status, avatar_url, bio,
              website_url, instagram_url, behance_url
       FROM users
       WHERE id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Profil tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil profil." },
      { status: 500 }
    );
  }
}

// PATCH memperbarui profil
export async function PATCH(request) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const data = await request.json();

    const display_name = data.display_name?.trim();
    const bio = data.bio?.trim() || null;
    const website_url = data.website_url?.trim() || null;
    const instagram_url = data.instagram_url?.trim() || null;
    const behance_url = data.behance_url?.trim() || null;

    if (!display_name || display_name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Nama tampilan minimal 2 karakter." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET display_name = $1,
           bio = $2,
           website_url = $3,
           instagram_url = $4,
           behance_url = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, username, display_name, email, role,
                 curator_status, avatar_url, bio,
                 website_url, instagram_url, behance_url`,
      [
        display_name,
        bio,
        website_url,
        instagram_url,
        behance_url,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}