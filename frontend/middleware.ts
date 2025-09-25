import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const pathname = request.nextUrl.pathname;

  const isPublicPath =
    pathname === '/home' || pathname === '/sign-in' || pathname === '/sign-up';

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: [
    '/contact',
    '/calendrier',
    '/dashboard',
    '/home',
    '/sign-in',
    '/sign-up',
  ],
};
