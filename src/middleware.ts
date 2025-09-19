import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/admin'
  ];
  
  // Check if the current path is a protected one
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Public paths that should redirect to dashboard if already authenticated
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  );
  
  // Redirect to login if trying to access protected route without token
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to dashboard if trying to access login/register while already authenticated
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    // Match all routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
