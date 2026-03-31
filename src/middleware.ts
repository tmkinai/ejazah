import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next()

  // Clean old Supabase cookies if present
  const oldSupabaseCookie = request.cookies.get('sb-cvzauvdhvjfpcbzoelkg-auth-token')
  if (oldSupabaseCookie) {
    response.cookies.set('sb-cvzauvdhvjfpcbzoelkg-auth-token', '', { maxAge: 0, path: '/' })
    response.cookies.set('sb-cvzauvdhvjfpcbzoelkg-auth-token-code-verifier', '', { maxAge: 0, path: '/' })
  }

  // Get the session token from cookies (Auth.js stores it here)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  const isAuthenticated = !!sessionToken

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/admin', '/scholar', '/applications', '/profile', '/certificates', '/settings', '/become-scholar']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
