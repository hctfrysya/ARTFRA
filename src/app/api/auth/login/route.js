
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(request) {
  try {
    const data = await request.json();

    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Cari akun berdasarkan email
    const result = await pool.query(
      `SELECT id, username, display_name, email, password_hash, role, curator_status
       FROM users
       WHERE email = $1 AND is_active = TRUE`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Periksa password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    // Buat session token
    const token = await createSession(user);

    // Simpan token dalam cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        role: user.role,
        curator_status: user.curator_status,
      },
    });

    response.cookies.set("artfra_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
