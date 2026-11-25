
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { validateRegister } from "@/lib/validation";

export async function POST(request) {
  try {
    const data = await request.json();

    const username = data.username?.trim();
    const display_name = data.display_name?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    const error = validateRegister({
      username,
      display_name,
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (username, display_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, display_name, email, role`,
      [username, display_name, email, password_hash]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil!",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau email sudah digunakan.",
        },
        { status: 409 }
      );
    }

    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
