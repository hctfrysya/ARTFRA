
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

    if (
      pathname.startsWith("/admin") &&
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      pathname.startsWith("/curator/dashboard") &&
      payload.role !== "curator" &&
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
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
