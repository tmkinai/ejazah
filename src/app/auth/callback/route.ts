import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
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
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        const errorMessage = encodeURIComponent('Failed to complete authentication')
        return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
      }

      // Successfully authenticated - redirect to dashboard or next URL
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Unexpected error during auth callback:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=Unexpected+error`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
