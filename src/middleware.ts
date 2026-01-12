import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are not set, just continue without auth check
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/admin', '/scholar', '/applications', '/profile', '/certificates', '/settings', '/become-scholar']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    if (!user && isProtectedPath) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based route protection
    if (user) {
      // Fetch user profile to get roles
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

      const userRoles = profile?.roles || ['student']

      // Admin routes - require admin role
      if (pathname.startsWith('/admin')) {
        if (!userRoles.includes('admin')) {
          // Redirect non-admins to dashboard with error message
          const dashboardUrl = new URL('/dashboard', request.url)
          dashboardUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(dashboardUrl)
        }
      }

      // Scholar routes - require scholar or admin role
      if (pathname.startsWith('/scholar')) {
        if (!userRoles.includes('scholar') && !userRoles.includes('admin')) {
          // Redirect non-scholars to dashboard with error message
          const dashboardUrl = new URL('/dashboard', request.url)
          dashboardUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(dashboardUrl)
        }
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } catch (error) {
    // If auth fails, just continue without redirecting
    console.error('Middleware auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
