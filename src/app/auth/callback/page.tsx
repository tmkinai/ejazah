'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// With Auth.js, the OAuth callback is handled automatically by the
// [...nextauth] route. This page just shows a loading state and redirects.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

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
