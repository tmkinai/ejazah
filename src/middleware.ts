import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next()

  // Clean old Supabase cookies if present
  const oldSupabaseCookie = request.cookies.get('sb-cvzauvdhvjfpcbzoelkg-auth-token')
  if (oldSupabaseCookie) {
    response.cookies.set('sb-cvzauvdhvjfpcbzoelkg-auth-token', '', { maxAge: 0, path: '/' })
    response.cookies.set('sb-cvzauvdhvjfpcbzoelkg-auth-token-code-verifier', '', { maxAge: 0, path: '/' })
  }

  // Decode the JWT from the session cookie (edge-compatible, no Prisma)
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET! })
  const isAuthenticated = !!token
  const requiresTwoFactor = !!(token as any)?.requiresTwoFactor

  const protectedPaths = ['/dashboard', '/admin', '/scholar', '/applications', '/profile', '/certificates', '/settings', '/become-scholar']
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))

  // Not authenticated → redirect to login
  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated with pending 2FA → force to 2FA page
  if (isAuthenticated && requiresTwoFactor) {
    if (!pathname.startsWith('/auth/2fa') && !pathname.startsWith('/api/auth')) {
      if (isProtectedPath || pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        return NextResponse.redirect(new URL('/auth/2fa', request.url))
      }
    }
    return response
  }

  // Authenticated (no pending 2FA) on auth pages → go to dashboard
  if (isAuthenticated && !requiresTwoFactor) {
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Already verified — don't allow /auth/2fa
    if (pathname.startsWith('/auth/2fa')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
