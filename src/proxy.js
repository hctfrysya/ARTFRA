
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function proxy(request) {
  const token = request.cookies.get("artfra_session")?.value;
  const pathname = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    // Proteksi halaman admin
    if (pathname.startsWith("/admin")) {
      if (payload.role !== "admin") {
        return NextResponse.redirect(
          new URL("/", request.url)
        );
      }
    }

    // Proteksi dashboard curator
    if (pathname.startsWith("/curator/dashboard")) {
      if (
        payload.role !== "curator" &&
        payload.role !== "admin"
      ) {
        return NextResponse.redirect(
          new URL("/", request.url)
        );
      }

      if (
        payload.role === "curator" &&
        payload.curator_status !== "approved"
      ) {
        return NextResponse.redirect(
          new URL("/curator/pending", request.url)
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/curator/dashboard/:path*",
  ],
};
