import { NextResponse } from 'next/server'

// GET /api/auth/clear - clears all auth cookies and redirects to login
export async function GET() {
  const response = NextResponse.redirect(new URL('/auth/login', process.env.AUTH_URL || 'http://localhost:3000'))

  // Clear Auth.js cookies
  const cookieNames = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'authjs.callback-url',
    '__Secure-authjs.callback-url',
    'authjs.csrf-token',
    '__Secure-authjs.csrf-token',
    'authjs.pkce.code_verifier',
    '__Secure-authjs.pkce.code_verifier',
    // Old Supabase cookies
    'sb-cvzauvdhvjfpcbzoelkg-auth-token',
    'sb-cvzauvdhvjfpcbzoelkg-auth-token-code-verifier',
  ]

  for (const name of cookieNames) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' })
  }

  return response
}
