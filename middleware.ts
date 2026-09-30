import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected path prefixes
const PROTECTED_PATHS = [
  '/',
  '/tracking',
  '/shipments',
  '/batches',
  '/inventory',
  '/orders',
  '/quality',
  '/analytics',
  '/audit',
  '/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip Next.js internal files, static assets, and auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') || // static files like favicon.ico, images
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('agri_access_token')?.value;
  const refreshToken = request.cookies.get('agri_refresh_token')?.value;
  const hasToken = Boolean(accessToken || refreshToken);

  // 2. If user is visiting /login and already has a token, redirect to dashboard
  if (pathname === '/login') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 3. For protected routes, if no token, redirect to /login
  const isProtected = PROTECTED_PATHS.some((path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );

  if (isProtected && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
