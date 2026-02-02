import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * 🚨 ABSOLUTE BYPASS - Never interfere with NextAuth
   */
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  /**
   * 🔒 PROTECT DASHBOARD ROUTES ONLY
   */
  if (
    pathname.startsWith("/user-dashboard") ||
    pathname.startsWith("/admin-dashboard")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

/**
 * ✅ MATCH ONLY PROTECTED ROUTES
 */
export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
};



// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   /**
//    * ✅ ABSOLUTE BYPASS
//    * Never run middleware logic for NextAuth
//    */
//   if (
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/favicon.ico")
//   ) {
//     return NextResponse.next();
//   }

//   // Public & protected routes
//   const publicRoutes = ["/auth/login", "/auth/signup"];
//   const protectedRoutes = ["/user-dashboard", "/admin-dashboard"];

//   const isPublicRoute = publicRoutes.some((route) =>
//     pathname.startsWith(route)
//   );
//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   /**
//    * ⚠️ Only fetch token AFTER exclusions
//    */
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // Redirect unauthenticated users from protected routes
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   // Redirect authenticated users away from auth pages
//   if (isPublicRoute && token) {
//     return NextResponse.redirect(
//       new URL("/user-dashboard/dashboard", request.url)
//     );
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };




// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Define public and protected routes
//   const publicRoutes = ['/auth/login', '/auth/signup'];
//   const protectedRoutes = ['/user-dashboard', '/admin-dashboard'];
  
//   // Get the token from the request
//   const token = await getToken({ 
//     req: request, 
//     secret: process.env.NEXTAUTH_SECRET 
//   });

//   // Check if the current path is a protected route
//   const isProtectedRoute = protectedRoutes.some(route => 
//     pathname.startsWith(route)
//   );
  
//   // Check if the current path is a public route
//   const isPublicRoute = publicRoutes.some(route => 
//     pathname.startsWith(route)
//   );

//   // If user is not authenticated and trying to access protected route
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   // If user is authenticated and trying to access auth routes
//   if (isPublicRoute && token) {
//     return NextResponse.redirect(new URL('/user-dashboard/dashboard', request.url));
//   }

//   // Allow the request to proceed
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
//   ],
// };
