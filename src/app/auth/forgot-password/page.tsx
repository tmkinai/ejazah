'use client'

import { useState } from 'react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'حدث خطأ أثناء إرسال رابط إعادة التعيين.')
        return
      }

      setSent(true)
    } catch {
      setError('حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background pattern-overlay">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="justify-center mb-8" size="lg" />
          <h1 className="text-3xl font-bold text-primary-900 font-arabic">
            استعادة كلمة المرور
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <div className="auth-card">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-xl font-bold text-primary-900 font-arabic">تم الإرسال!</h2>
              <p className="text-muted-foreground">
                إذا كان البريد <strong>{email}</strong> مسجلاً لدينا، ستصل رسالة بتعليمات إعادة التعيين قريباً.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={loading}
                  dir="ltr"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال رابط إعادة التعيين'
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-primary-700 hover:text-primary-900 font-medium">
            ← العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
