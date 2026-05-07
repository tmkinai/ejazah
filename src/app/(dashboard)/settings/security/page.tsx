'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Shield, Lock, Key, Smartphone, AlertTriangle, CheckCircle, Eye, EyeOff, ArrowLeft, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'

type SetupStep = 'idle' | 'loading-qr' | 'show-qr' | 'verifying' | 'done'

export default function SecuritySettingsPage() {
  const { data: session } = useSession()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  // 2FA state
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpLoading, setTotpLoading] = useState(true)
  const [setupStep, setSetupStep] = useState<SetupStep>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [showDisable, setShowDisable] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    fetch('/api/auth/2fa/status')
      .then(r => r.json())
      .then(d => { setTotpEnabled(d.enabled ?? false); setTotpLoading(false) })
      .catch(() => setTotpLoading(false))
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'خطأ', description: 'كلمة المرور الجديدة وتأكيدها غير متطابقين', variant: 'destructive' })
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', variant: 'destructive' })
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'خطأ', description: data.error || 'فشل تغيير كلمة المرور', variant: 'destructive' })
      } else {
        toast({ title: 'تم التحديث', description: 'تم تغيير كلمة المرور بنجاح' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' })
    } finally {
      setPwLoading(false)
    }
  }

  const handleStartSetup = async () => {
    setSetupStep('loading-qr')
    try {
      const res = await fetch('/api/auth/2fa/setup')
      const data = await res.json()
      if (!res.ok) { toast({ title: 'خطأ', description: data.error, variant: 'destructive' }); setSetupStep('idle'); return }
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setVerifyCode('')
      setSetupStep('show-qr')
    } catch {
      toast({ title: 'خطأ', description: 'فشل تحميل رمز QR', variant: 'destructive' })
      setSetupStep('idle')
    }
  }

  const handleVerifySetup = async () => {
    if (verifyCode.length !== 6) return
    setSetupStep('verifying')
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'خطأ', description: data.error || 'رمز غير صحيح', variant: 'destructive' })
        setSetupStep('show-qr')
        return
      }
      setTotpEnabled(true)
      setSetupStep('idle')
      setQrCode('')
      setSecret('')
      setVerifyCode('')
      toast({ title: 'تم التفعيل', description: 'تم تفعيل المصادقة الثنائية بنجاح' })
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ', variant: 'destructive' })
      setSetupStep('show-qr')
    }
  }

  const handleDisable = async () => {
    if (disableCode.length !== 6) return
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'خطأ', description: data.error || 'رمز غير صحيح', variant: 'destructive' })
        return
      }
      setTotpEnabled(false)
      setShowDisable(false)
      setDisableCode('')
      toast({ title: 'تم الإلغاء', description: 'تم إلغاء تفعيل المصادقة الثنائية' })
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-muted-foreground">/</span>
            <Link href="/settings" className="text-muted-foreground hover:text-primary-900">الإعدادات</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">الأمان</span>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-900 font-arabic">الأمان</h1>
                <p className="text-muted-foreground">إدارة إعدادات الأمان وحماية حسابك</p>
              </div>
            </div>
          </div>

          <OrnamentalDivider />

          {/* Security Status */}
          <Card className={totpEnabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${totpEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <CheckCircle className={`h-6 w-6 ${totpEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${totpEnabled ? 'text-green-900' : 'text-yellow-900'}`}>
                    {totpEnabled ? 'حسابك محمي بالمصادقة الثنائية' : 'يُنصح بتفعيل المصادقة الثنائية'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${totpEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
                    {totpEnabled
                      ? 'المصادقة الثنائية مفعّلة. حسابك محمي بطبقة إضافية من الأمان.'
                      : 'لمزيد من الأمان، ننصح بتفعيل المصادقة الثنائية لحماية حسابك.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle>تغيير كلمة المرور</CardTitle>
                  <CardDescription>قم بتحديث كلمة المرور الخاصة بك بشكل دوري</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required className="pl-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900">
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required minLength={8} className="pl-10"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">يجب أن تحتوي على 8 أحرف على الأقل</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required className="pl-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={pwLoading} className="w-full">
                  {pwLoading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري التحديث...</> : 'تحديث كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <CardTitle>المصادقة الثنائية (2FA)</CardTitle>
                  <CardDescription>
                    {totpEnabled ? 'المصادقة الثنائية مفعّلة — حسابك محمي' : 'أضف طبقة حماية إضافية لحسابك'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {totpLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : totpEnabled ? (
                <>
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">المصادقة الثنائية مفعّلة. يُطلب منك إدخال رمز المصادقة عند تسجيل الدخول.</span>
                  </div>
                  {!showDisable ? (
                    <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5"
                      onClick={() => setShowDisable(true)}>
                      إلغاء تفعيل المصادقة الثنائية
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-red-900">أدخل رمز المصادقة للتأكيد</p>
                        <button onClick={() => { setShowDisable(false); setDisableCode('') }}
                          className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        type="text" inputMode="numeric" maxLength={6}
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="text-center font-mono tracking-widest"
                        dir="ltr"
                      />
                      <Button variant="destructive" className="w-full"
                        onClick={handleDisable} disabled={disableCode.length !== 6}>
                        تأكيد الإلغاء
                      </Button>
                    </div>
                  )}
                </>
              ) : setupStep === 'idle' ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    المصادقة الثنائية تضيف طبقة أمان إضافية. عند تفعيلها، ستحتاج إلى إدخال رمز من تطبيق المصادقة (Google Authenticator أو Authy) عند تسجيل الدخول.
                  </p>
                  <Button onClick={handleStartSetup} className="w-full">
                    تفعيل المصادقة الثنائية
                  </Button>
                </>
              ) : setupStep === 'loading-qr' ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">الخطوة 1: امسح رمز QR</p>
                    <p>افتح تطبيق المصادقة (Google Authenticator، Authy، أو أي تطبيق TOTP) وامسح الرمز أدناه.</p>
                  </div>

                  {qrCode && (
                    <div className="flex justify-center">
                      <div className="p-3 bg-white border rounded-xl shadow-sm">
                        <img src={qrCode} alt="QR Code" width={180} height={180} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-xs text-primary-700 hover:underline"
                    >
                      {showSecret ? 'إخفاء المفتاح السري' : 'لا يمكنك المسح؟ أدخل المفتاح يدوياً'}
                    </button>
                    {showSecret && (
                      <div className="bg-muted rounded-lg p-3 font-mono text-sm break-all select-all" dir="ltr">
                        {secret}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">الخطوة 2: أدخل رمز التحقق</p>
                    <Input
                      type="text" inputMode="numeric" maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="text-center font-mono text-xl tracking-widest h-12"
                      dir="ltr"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1"
                      onClick={() => { setSetupStep('idle'); setQrCode(''); setSecret(''); setVerifyCode('') }}>
                      إلغاء
                    </Button>
                    <Button className="flex-1"
                      onClick={handleVerifySetup}
                      disabled={verifyCode.length !== 6 || setupStep === 'verifying'}>
                      {setupStep === 'verifying' ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري التحقق...</> : 'تفعيل'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="bg-gradient-to-br from-primary-50 to-gold-50 border-primary-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle>نصائح أمنية</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  'استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز',
                  'لا تشارك كلمة المرور مع أي شخص',
                  'قم بتغيير كلمة المرور بشكل دوري (كل 3-6 أشهر)',
                  'تجنب استخدام نفس كلمة المرور في مواقع متعددة',
                  'فعّل المصادقة الثنائية لحماية إضافية',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">منطقة الخطر</CardTitle>
                  <CardDescription className="text-red-700">إجراءات لا يمكن التراجع عنها</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="font-semibold text-red-900 mb-2">حذف الحساب</h4>
                <p className="text-sm text-red-700 mb-4">حذف حسابك نهائياً سيؤدي إلى فقدان جميع بياناتك. هذا الإجراء لا يمكن التراجع عنه.</p>
                <Button variant="destructive" disabled>حذف الحساب (متوفر قريباً)</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
