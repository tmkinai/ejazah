'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, currentSession: any) => {
        console.log('Auth event:', event)
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setIsLoading(false)

        // Handle successful sign in
        if (event === 'SIGNED_IN' && currentSession) {
          // Check if we're on the homepage or auth pages
          if (pathname === '/' || pathname?.startsWith('/auth/')) {
            router.push('/dashboard')
            router.refresh()
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, pathname])

  // Handle OAuth code in URL (when redirected to homepage)
  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('OAuth error:', error)
      router.push(`/auth/login?error=${encodeURIComponent(error)}`)
      return
    }
    
    // If there's a code in the URL, Supabase should handle it automatically
    // via the onAuthStateChange listener above
    if (code && !session) {
      // The code will be processed by Supabase's internal handling
      // Just wait for the auth state change
      console.log('OAuth code detected, waiting for session...')
    }
  }, [searchParams, session, router])

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
