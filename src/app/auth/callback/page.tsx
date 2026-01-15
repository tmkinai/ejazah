'use client'

import { useEffect } from 'react'

export default function AuthCallbackPage() {
  useEffect(() => {
    // Simply redirect to dashboard - Supabase handles the session automatically
    window.location.href = '/dashboard'
  }, [])

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
