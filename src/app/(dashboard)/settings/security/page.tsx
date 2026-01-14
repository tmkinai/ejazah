'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Shield, Lock, Key, Smartphone, AlertTriangle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

export default function SecuritySettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
        variant: 'destructive'
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    toast({
      title: 'تم التحديث',
      description: 'تم تغيير كلمة المرور بنجاح'
    })
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-muted-foreground">/</span>
            <Link href="/settings" className="text-muted-foreground hover:text-primary-900">
              الإعدادات
            </Link>
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
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-900 font-arabic">
                  الأمان
                </h1>
                <p className="text-muted-foreground">
                  إدارة إعدادات الأمان وحماية حسابك
                </p>
              </div>
            </div>
          </div>

          <OrnamentalDivider />

          {/* Security Status */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    حسابك محمي
                  </h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    تم تفعيل الإجراءات الأمنية الأساسية لحماية حسابك. لمزيد من الأمان، ننصح بتفعيل 
                    المصادقة الثنائية.
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
                  <CardDescription>
                    قم بتحديث كلمة المرور الخاصة بك بشكل دوري لحماية حسابك
                  </CardDescription>
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
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      className="pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900"
                    >
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
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      minLength={8}
                      className="pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    يجب أن تحتوي على 8 أحرف على الأقل
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                      className="pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-900"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <CardTitle>المصادقة الثنائية (2FA)</CardTitle>
                  <CardDescription>
                    أضف طبقة حماية إضافية لحسابك (قريباً)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  المصادقة الثنائية تضيف طبقة أمان إضافية لحسابك. عند تفعيلها، ستحتاج إلى إدخال رمز 
                  من تطبيق المصادقة بالإضافة إلى كلمة المرور عند تسجيل الدخول.
                </p>
                <Button disabled variant="outline" className="w-full">
                  تفعيل المصادقة الثنائية (متوفر قريباً)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>الجلسات النشطة</CardTitle>
                  <CardDescription>
                    إدارة الأجهزة المتصلة بحسابك (قريباً)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                راجع وأدر جميع الأجهزة التي قمت بتسجيل الدخول منها إلى حسابك.
              </p>
              <Button disabled variant="outline" className="w-full">
                عرض الجلسات النشطة (متوفر قريباً)
              </Button>
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
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>لا تشارك كلمة المرور مع أي شخص</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>قم بتغيير كلمة المرور بشكل دوري (كل 3-6 أشهر)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تجنب استخدام نفس كلمة المرور في مواقع متعددة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>فعّل المصادقة الثنائية عندما تكون متاحة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>راجع الجلسات النشطة بانتظام وأنهِ أي جلسات مشبوهة</span>
                </li>
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
                  <CardDescription className="text-red-700">
                    إجراءات لا يمكن التراجع عنها
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">حذف الحساب</h4>
                  <p className="text-sm text-red-700 mb-4">
                    حذف حسابك نهائياً سيؤدي إلى فقدان جميع بياناتك. هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                  <Button variant="destructive" disabled>
                    حذف الحساب (متوفر قريباً)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
