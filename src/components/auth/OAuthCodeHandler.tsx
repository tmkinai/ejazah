'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function OAuthCodeHandler() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasOAuthData, setHasOAuthData] = useState(false)
  
  useEffect(() => {
    // Check for OAuth data in URL on client side only
    const hash = window.location.hash
    const hasHash = hash.includes('access_token') || hash.includes('error')
    const hasCode = code !== null
    
    if (hasHash || hasCode) {
      setHasOAuthData(true)
      
      if (!isProcessing) {
        setIsProcessing(true)
        
        // If there's a code, redirect to the callback route
        if (hasCode) {
          window.location.href = `/auth/callback?code=${code}`
          return
        }
        
        // For hash-based auth (implicit flow), Supabase should handle it automatically
        // Just wait and check if we're authenticated
        const checkAuth = async () => {
          // Import dynamically to avoid SSR issues
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          
          // Wait for Supabase to process the hash
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.error('Session error:', sessionError)
              setError('حدث خطأ أثناء تسجيل الدخول')
              return
            }
            
            if (session) {
              // Clear the URL hash and redirect to dashboard
              window.history.replaceState({}, document.title, window.location.pathname)
              window.location.href = '/dashboard'
            } else {
              // Check one more time
              await new Promise(resolve => setTimeout(resolve, 1500))
              const { data: { session: retrySession } } = await supabase.auth.getSession()
              
              if (retrySession) {
                window.history.replaceState({}, document.title, window.location.pathname)
                window.location.href = '/dashboard'
              } else {
                setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.')
              }
            }
          } catch (err) {
            console.error('Auth check error:', err)
            setError('حدث خطأ غير متوقع')
          }
        }
        
        checkAuth()
      }
    }
  }, [code, isProcessing])
  
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
