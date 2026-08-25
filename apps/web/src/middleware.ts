import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for token in cookies
  const token = request.cookies.get('token') || request.cookies.get('agriassist-auth');

  if (!token) {
    // Redirect to login if token is missing
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/farmer/:path*',
    '/buyer/:path*',
    '/transport/:path*',
    '/industry/:path*',
    '/admin/:path*',
  ],
};
