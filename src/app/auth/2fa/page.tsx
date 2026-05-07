'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

export default function TwoFactorPage() {
  const router = useRouter()
  const { update } = useSession()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.replace(/\s/g, '')
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError('الرمز يجب أن يكون 6 أرقام')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // This triggers jwt callback with trigger='update', which verifies the code server-side
      const updated = await update({ totpCode: trimmed })

      if ((updated?.user as any)?.requiresTwoFactor) {
        setError('رمز التحقق غير صحيح أو منتهي الصلاحية')
        setCode('')
        inputRef.current?.focus()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background pattern-overlay">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="justify-center mb-8" size="lg" />
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900 font-arabic">
            التحقق الثنائي
          </h1>
          <p className="text-muted-foreground mt-2">
            أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest h-14"
                dir="ltr"
                autoComplete="one-time-code"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 text-center">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التحقق...
                </>
              ) : (
                'تحقق والمتابعة'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-primary-700 hover:text-primary-900 font-medium">
            ← تسجيل الدخول بحساب آخر
          </Link>
        </p>
      </div>
    </div>
  )
}
