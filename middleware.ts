import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware is now "transparent." 
 * It allows all users to access any route without checking for tokens.
 */
export async function middleware(request: NextRequest) {
  // Simply continue to the requested page
  return NextResponse.next();
}

// Keep the matcher so you don't process unnecessary files (like images/favicon)
export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/auth/login',
    '/auth/signup'
  ],
};