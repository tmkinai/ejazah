'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Palette, Sun, Moon, Monitor, Type, Languages, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')

  const handleSave = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ إعدادات المظهر بنجاح'
    })
  }

  const themes = [
    {
      id: 'light' as const,
      name: 'فاتح',
      description: 'مظهر فاتح مريح للعين',
      icon: Sun,
      preview: 'bg-white border-2'
    },
    {
      id: 'dark' as const,
      name: 'داكن',
      description: 'مظهر داكن للعمل الليلي',
      icon: Moon,
      preview: 'bg-gray-900 border-2'
    },
    {
      id: 'system' as const,
      name: 'النظام',
      description: 'يتبع إعدادات نظام التشغيل',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-white to-gray-900 border-2'
    }
  ]

  const fontSizes = [
    {
      id: 'small' as const,
      name: 'صغير',
      example: 'text-sm',
      description: 'مناسب للشاشات الكبيرة'
    },
    {
      id: 'medium' as const,
      name: 'متوسط',
      example: 'text-base',
      description: 'الحجم الافتراضي'
    },
    {
      id: 'large' as const,
      name: 'كبير',
      example: 'text-lg',
      description: 'سهل القراءة'
    }
  ]

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
            <span className="font-semibold">المظهر</span>
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
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Palette className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-900 font-arabic">
                  المظهر
                </h1>
                <p className="text-muted-foreground">
                  تخصيص مظهر التطبيق حسب تفضيلاتك
                </p>
              </div>
            </div>
          </div>

          <OrnamentalDivider />

          {/* Coming Soon Notice */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    قريباً
                  </h3>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    نعمل حالياً على إضافة المزيد من خيارات التخصيص لتحسين تجربتك. ستكون هذه الميزات متاحة 
                    في التحديث القادم إن شاء الله.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Sun className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle>السمة</CardTitle>
                  <CardDescription>
                    اختر السمة المفضلة لديك (قريباً)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon
                  const isSelected = theme === themeOption.id
                  
                  return (
                    <button
                      key={themeOption.id}
                      disabled
                      onClick={() => setTheme(themeOption.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all text-right
                        ${isSelected 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-border hover:border-primary-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <CheckCircle className="h-5 w-5 text-primary-600" />
                        </div>
                      )}
                      
                      <div className={`w-full h-20 rounded-lg mb-3 ${themeOption.preview}`} />
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-primary-600" />
                        <h3 className="font-semibold text-primary-900">{themeOption.name}</h3>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {themeOption.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Type className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <CardTitle>حجم الخط</CardTitle>
                  <CardDescription>
                    اضبط حجم الخط لسهولة القراءة (قريباً)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fontSizes.map((size) => {
                  const isSelected = fontSize === size.id
                  
                  return (
                    <button
                      key={size.id}
                      disabled
                      onClick={() => setFontSize(size.id)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-right flex items-center justify-between
                        ${isSelected 
                          ? 'border-gold-600 bg-gold-50' 
                          : 'border-border hover:border-gold-300'
                        }
                      `}
                    >
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-1">{size.name}</h3>
                        <p className="text-xs text-muted-foreground">{size.description}</p>
                      </div>
                      
                      <div className={`${size.example} font-arabic text-primary-900`}>
                        نموذج النص
                      </div>
                      
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-gold-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Languages className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>اللغة</CardTitle>
                  <CardDescription>
                    اختر لغة واجهة التطبيق (قريباً)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  disabled
                  onClick={() => setLanguage('ar')}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-right flex items-center justify-between
                    ${language === 'ar' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-border hover:border-green-300'
                    }
                  `}
                >
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">العربية</h3>
                    <p className="text-xs text-muted-foreground">اللغة الافتراضية</p>
                  </div>
                  {language === 'ar' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </button>

                <button
                  disabled
                  onClick={() => setLanguage('en')}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-right flex items-center justify-between
                    ${language === 'en' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-border hover:border-green-300'
                    }
                  `}
                >
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">English</h3>
                    <p className="text-xs text-muted-foreground">English language</p>
                  </div>
                  {language === 'en' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-primary-50 to-gold-50 border-primary-200">
            <CardHeader>
              <CardTitle className="font-arabic">معاينة المظهر</CardTitle>
              <CardDescription>
                هكذا سيبدو التطبيق مع الإعدادات المختارة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-xl p-6 border-2 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 font-arabic">عنوان تجريبي</h3>
                    <p className="text-sm text-muted-foreground">نص تجريبي للمعاينة</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  هذا نص تجريبي لمعاينة كيف سيبدو المحتوى مع الإعدادات المختارة. يمكنك تغيير السمة وحجم 
                  الخط واللغة لرؤية التأثير على المظهر العام للتطبيق.
                </p>
                <Button className="btn-gold">
                  زر تجريبي
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled className="flex-1">
              حفظ التغييرات (متوفر قريباً)
            </Button>
            <Link href="/settings">
              <Button variant="outline">
                إلغاء
              </Button>
            </Link>
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Palette className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    المزيد من خيارات التخصيص قريباً
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    نعمل على إضافة المزيد من الخيارات لتخصيص المظهر بما يناسب تفضيلاتك، بما في ذلك:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>اختيار الألوان المفضلة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>تخصيص نوع الخط</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>تخطيطات مختلفة للوحة التحكم</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>وضع التباين العالي</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
