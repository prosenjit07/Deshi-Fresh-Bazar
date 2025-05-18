import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Add paths that should be protected
const protectedPaths = [
  '/api/users/profile',
  // Add more protected paths here as needed
];

export function middleware(request: NextRequest) {
  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Not authorized, no token' },
      { status: 401 }
    );
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
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
    '/api/users/profile/:path*',
    // Add more matchers here as needed
  ],
}; 