import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieName, verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = ['/login', '/setup', '/setup/admin', '/admin/login'];
const ADMIN_PATHS = ['/settings', '/manage-store', '/manage-users', '/sales-report', '/stock-alerts'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const legacyUser = request.cookies.get('username')?.value;

  if (!token && !legacyUser) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const payload = await verifyToken(token);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(getSessionCookieName(), '', { maxAge: 0, path: '/' });
      return response;
    }

    if (isAdminPath(pathname) && payload.role.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/billing', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
