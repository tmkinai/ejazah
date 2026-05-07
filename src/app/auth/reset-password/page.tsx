'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    if (!token) {
      setError('رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'فشل تحديث كلمة المرور. يرجى طلب رابط جديد.')
        return
      }

      setDone(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
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
            تعيين كلمة مرور جديدة
          </h1>
        </div>

        <div className="auth-card">
          {done ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-xl font-bold text-primary-900 font-arabic">تم التحديث!</h2>
              <p className="text-muted-foreground">
                تم تعيين كلمة المرور الجديدة بنجاح. سيتم توجيهك لتسجيل الدخول...
              </p>
            </div>
          ) : !token ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-destructive">رابط إعادة التعيين غير صالح أو منتهي الصلاحية.</p>
              <Link href="/auth/forgot-password" className="text-primary-700 hover:underline text-sm">
                طلب رابط جديد
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  disabled={loading}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
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
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ كلمة المرور'
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
