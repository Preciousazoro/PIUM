import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * 🚨 ABSOLUTE BYPASS
   * Never intercept API routes, NextAuth, or static assets
   */
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  /**
   * 🔒 Protect dashboard pages
   */
  if (
    pathname.startsWith("/user-dashboard") ||
    pathname.startsWith("/admin-dashboard")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
    }

    // 🔐 Additional admin role check for admin dashboard
    if (pathname.startsWith("/admin-dashboard") && token.role !== "admin") {
      return NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
};
