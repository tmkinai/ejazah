'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  
  useEffect(() => {
    if (code) {
      // Exchange the code for a session
      const handleOAuthCode = async () => {
        const supabase = createClient()
        
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('OAuth exchange error:', error)
            router.push('/auth/login?error=Authentication+failed')
          } else {
            // Successfully authenticated
            router.push('/dashboard')
            router.refresh()
          }
        } catch (err) {
          console.error('OAuth error:', err)
          router.push('/auth/login?error=Unexpected+error')
        }
      }
      
      handleOAuthCode()
    }
  }, [code, router])
  
  // Show nothing - this is just for handling the OAuth code
  if (code) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تسجيل الدخول...</p>
        </div>
      </div>
    )
  }
  
  return null
}
