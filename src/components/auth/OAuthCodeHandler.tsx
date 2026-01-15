'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthCodeHandler() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Check for OAuth tokens in URL (hash fragment for implicit flow or code for PKCE)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const hasCode = code !== null
    
    if ((accessToken || hasCode) && !isProcessing) {
      setIsProcessing(true)
      
      const supabase = createClient()
      
      // For implicit flow, Supabase should detect the hash and set the session
      // For PKCE flow, we need to handle the code
      // Just check if we have a session after a short delay
      const checkSession = async () => {
        // Give Supabase time to process the auth callback
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('حدث خطأ أثناء تسجيل الدخول')
          return
        }
        
        if (session) {
          // Clear the URL hash/params and redirect to dashboard
          window.history.replaceState({}, document.title, window.location.pathname)
          window.location.href = '/dashboard'
        } else {
          // Try one more time after a longer delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (retrySession) {
            window.history.replaceState({}, document.title, window.location.pathname)
            window.location.href = '/dashboard'
          } else {
            setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.')
          }
        }
      }
      
      checkSession()
    }
  }, [code, isProcessing])
  
  // Check if we have OAuth data in URL
  const hasOAuthData = code !== null || (typeof window !== 'undefined' && window.location.hash.includes('access_token'))
  
  // Show loading while processing
  if (hasOAuthData || isProcessing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <>
              <p className="text-destructive mb-4">{error}</p>
              <a 
                href="/auth/login" 
                className="text-primary-600 hover:underline"
              >
                العودة لصفحة الدخول
              </a>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تسجيل الدخول...</p>
            </>
          )}
        </div>
      </div>
    )
  }
  
  return null
}
