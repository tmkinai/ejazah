'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription)
        setError(errorDescription || 'فشل في المصادقة')
        setIsProcessing(false)
        return
      }

      if (!code) {
        setError('لم يتم العثور على رمز المصادقة')
        setIsProcessing(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Exchange error:', exchangeError)
          
          // If PKCE error, try to get session anyway (might already be set)
          if (exchangeError.message?.includes('PKCE')) {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              window.location.href = '/dashboard'
              return
            }
          }
          
          setError('فشل في إتمام تسجيل الدخول')
          setIsProcessing(false)
          return
        }

        if (data.session) {
          // Successfully authenticated
          window.location.href = '/dashboard'
        } else {
          setError('لم يتم الحصول على جلسة صالحة')
          setIsProcessing(false)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('حدث خطأ غير متوقع')
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams])

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-900 mx-auto mb-6"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
