import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Add paths that should be protected
const protectedPaths = [
  '/api/users/profile',
  // Add more protected paths here as needed
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if user has admin role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return res;
  }

  // Get token from cookies
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Not authorized, no token' },
      { status: 401 }
    );
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET!);
    return res;
  } catch (error) {
    return NextResponse.json(
      { message: 'Not authorized, token failed' },
      { status: 401 }
    );
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/users/profile/:path*',
    // Add more matchers here as needed
  ],
}; 