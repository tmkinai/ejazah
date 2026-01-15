'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthCodeHandler() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    // Check for OAuth data in URL
    const hash = window.location.hash
    const hasToken = hash.includes('access_token')
    const code = searchParams.get('code')
    
    if ((hasToken || code) && !isProcessing) {
      setIsProcessing(true)
      
      // Redirect to callback page to handle auth
      if (code) {
        window.location.href = `/auth/callback?code=${code}`
      } else if (hasToken) {
        // For implicit flow, check if session is set
        const supabase = createClient()
        
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/auth/callback' + window.location.hash
          }
        }, 500)
      }
    }
  }, [searchParams, isProcessing])
  
  if (isProcessing) {
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
