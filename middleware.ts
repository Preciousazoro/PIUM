import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/user-dashboard'];
const authRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // Redirect to login if trying to access protected routes without authentication
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access auth routes while authenticated
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/user-dashboard/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/auth/login',
    '/auth/signup'
  ],
};
