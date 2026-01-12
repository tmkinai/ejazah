'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Bell, User, Shield, Palette } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">الإعدادات</span>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              الإعدادات
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة إعدادات حسابك وتفضيلاتك
            </p>
          </div>

          <OrnamentalDivider />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Link href="/profile">
              <Card className="card-hover cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-primary-700" />
                  </div>
                  <CardTitle>الملف الشخصي</CardTitle>
                  <CardDescription>
                    تحديث معلوماتك الشخصية وصورة الملف الشخصي
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Notification Settings */}
            <Link href="/settings/notifications">
              <Card className="card-hover cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-gold-700" />
                  </div>
                  <CardTitle>الإشعارات</CardTitle>
                  <CardDescription>
                    تخصيص طريقة تلقي الإشعارات والتنبيهات
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Security Settings */}
            <Card className="card-hover opacity-60">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-700" />
                </div>
                <CardTitle>الأمان</CardTitle>
                <CardDescription>
                  إدارة كلمة المرور والمصادقة الثنائية (قريباً)
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Appearance Settings */}
            <Card className="card-hover opacity-60">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle>المظهر</CardTitle>
                <CardDescription>
                  تخصيص مظهر التطبيق والسمة (قريباً)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
