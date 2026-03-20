import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value
  const path = request.nextUrl.pathname

  // Protected paths mapping to strictly required roles
  const protectedRoutes: Record<string, string[]> = {
    '/dashboard/student': ['student'],
    '/dashboard/school': ['school'],
    '/dashboard/company': ['company'],
  }

  const isProtectedRoute = Object.keys(protectedRoutes).some(route => path.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      // If no token exists, silently rewrite them to the interactive unauthorized UI
      return NextResponse.rewrite(new URL('/unauthorized', request.url))
    }

    try {
      // Decode JWT payload (Signature verified heavily by backend, Frontend only needs payload data)
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
      const payload = JSON.parse(decodedJson);
      
      const userRole = payload.role;
      
      // Check if user role is allowed for this restricted URI path
      const allowedRolesEntry = Object.entries(protectedRoutes).find(([route]) => path.startsWith(route));
      if (allowedRolesEntry) {
        const allowedRoles = allowedRolesEntry[1];
        if (!allowedRoles.includes(userRole)) {
          // If a student tries to access /schoolpage, banish them to 404
          return NextResponse.rewrite(new URL('/unauthorized', request.url))
        }
      }
    } catch (e) {
      return NextResponse.rewrite(new URL('/unauthorized', request.url))
    }
  }

  // Automatically safely redirect actively logged-in users away from /login
  if (path === '/login' && token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      if (payload.role === 'student') return NextResponse.redirect(new URL('/dashboard/student', request.url));
      if (payload.role === 'school') return NextResponse.redirect(new URL('/dashboard/school', request.url));
      if (payload.role === 'company') return NextResponse.redirect(new URL('/dashboard/company/dashboard', request.url));
    } catch (e) {
      // ignore
    }
  }

  return NextResponse.next()
}

// Ensure middleware only fires on specific target portals to save Edge CPU latency
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
