import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Add paths that should be protected
const protectedPaths = [
  '/api/users/profile',
  // Add more protected paths here as needed
];

export async function middleware(req: NextRequest) {
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { message: 'Not authorized, no token' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // '/admin/:path*',
    // '/api/admin/:path*',
    '/api/users/profile/:path*',
    // Add more matchers here as needed
  ],
}; 