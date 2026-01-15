'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()
      
      // Check for error in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const urlParams = new URLSearchParams(window.location.search)
      
      const errorParam = hashParams.get('error') || urlParams.get('error')
      const errorDescription = hashParams.get('error_description') || urlParams.get('error_description')
      
      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription)
        setError(errorDescription || 'فشل في المصادقة')
        return
      }
      
      // With implicit flow, Supabase automatically detects the token in the hash
      // and sets the session. We just need to wait and check.
      
      // Wait a moment for Supabase to process the hash
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('فشل في الحصول على الجلسة')
        return
      }
      
      if (session) {
        // Success! Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Try listening for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            window.location.href = '/dashboard'
          }
        })
        
        // Wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession) {
          window.location.href = '/dashboard'
        } else {
          setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.')
        }
      }
    }
    
    handleAuth()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="text-destructive text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2">فشل تسجيل الدخول</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a 
            href="/auth/login" 
            className="inline-block px-6 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            العودة لصفحة الدخول
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-900 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-primary-900 mb-2">جاري تسجيل الدخول</h1>
        <p className="text-muted-foreground">يرجى الانتظار...</p>
      </div>
    </div>
  )
}
