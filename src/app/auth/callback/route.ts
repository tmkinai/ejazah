import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const origin = new URL(request.url).origin
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || 'Authentication failed')
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  if (code) {
    // Create response first so we can set cookies on it
    const response = NextResponse.redirect(`${origin}${next}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        const errorMessage = encodeURIComponent('Failed to complete authentication')
        return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
      }

      // Successfully authenticated - return response with cookies set
      return response
    } catch (err) {
      console.error('Unexpected error during auth callback:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=Unexpected+error`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
