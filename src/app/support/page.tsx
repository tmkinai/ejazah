'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  FileText,
  Video,
  Search,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function SupportPage() {
  const supportCategories = [
    {
      icon: BookOpen,
      title: 'البدء',
      description: 'تعلم كيفية استخدام المنصة',
      color: 'primary',
      articles: [
        'كيفية إنشاء حساب جديد',
        'تعبئة نموذج طلب الإجازة',
        'رفع المستندات المطلوبة',
        'تتبع حالة طلبك'
      ]
    },
    {
      icon: MessageCircle,
      title: 'الإجازات',
      description: 'معلومات عن أنواع الإجازات',
      color: 'gold',
      articles: [
        'أنواع الإجازات المتاحة',
        'متطلبات كل نوع إجازة',
        'عملية الاختبار والتقييم',
        'استلام الشهادة'
      ]
    },
    {
      icon: FileText,
      title: 'الحساب',
      description: 'إدارة حسابك وإعداداتك',
      color: 'green',
      articles: [
        'تحديث الملف الشخصي',
        'تغيير كلمة المرور',
        'إعدادات الإشعارات',
        'حذف الحساب'
      ]
    },
    {
      icon: Video,
      title: 'الاختبارات',
      description: 'معلومات عن الاختبارات',
      color: 'purple',
      articles: [
        'كيفية الاستعداد للاختبار',
        'متطلبات الاختبار عن بُعد',
        'ماذا تتوقع في يوم الاختبار',
        'إعادة الاختبار'
      ]
    }
  ]

  const commonIssues = [
    {
      icon: AlertCircle,
      title: 'لا يمكنني تسجيل الدخول',
      solution: 'تأكد من صحة البريد الإلكتروني وكلمة المرور. إذا نسيت كلمة المرور، استخدم خيار "نسيت كلمة المرور".',
      link: '/auth/login'
    },
    {
      icon: AlertCircle,
      title: 'فشل رفع المستندات',
      solution: 'تأكد من أن حجم الملف أقل من 5 ميجابايت وأن الصيغة مدعومة (PDF, JPG, PNG).',
      link: '/faq'
    },
    {
      icon: AlertCircle,
      title: 'لم أتلق إشعار البريد الإلكتروني',
      solution: 'تحقق من مجلد الرسائل غير المرغوب فيها. إذا لم تجد الرسالة، تواصل مع الدعم الفني.',
      link: '/contact'
    },
    {
      icon: AlertCircle,
      title: 'كيف أتحقق من صحة شهادة؟',
      solution: 'استخدم صفحة التحقق وأدخل رقم الشهادة أو امسح رمز QR الموجود على الشهادة.',
      link: '/verify'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      primary: { bg: 'bg-primary-100', text: 'text-primary-700', icon: 'text-primary-600' },
      gold: { bg: 'bg-gold-100', text: 'text-gold-700', icon: 'text-gold-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600' }
    }
    return colors[color] || colors.primary
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary-900 transition-colors">
              الرئيسية
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary-900 transition-colors">
              عن النظام
            </Link>
            <Link href="/scholars" className="text-muted-foreground hover:text-primary-900 transition-colors">
              الشيوخ
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">
                دخول
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="btn-gold font-medium">
                إنشاء حساب
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg text-white relative overflow-hidden py-20 border-b-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-10 w-10" />
            </div>
            
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              مركز الدعم
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              كيف يمكننا مساعدتك اليوم؟
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن مقالات المساعدة..."
                  className="w-full pr-12 pl-4 py-4 border-2 border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 -mb-px">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFBF5"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-12">
        {/* Quick Actions */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/faq">
              <Card className="card-hover cursor-pointer h-full text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2 font-arabic">
                    الأسئلة الشائعة
                  </h3>
                  <p className="text-muted-foreground">
                    إجابات سريعة على الأسئلة الشائعة
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="card-hover cursor-pointer h-full text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-gold-600" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2 font-arabic">
                    اتصل بنا
                  </h3>
                  <p className="text-muted-foreground">
                    تواصل مع فريق الدعم مباشرة
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/verify">
              <Card className="card-hover cursor-pointer h-full text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2 font-arabic">
                    التحقق من شهادة
                  </h3>
                  <p className="text-muted-foreground">
                    تحقق من صحة الإجازات
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <OrnamentalDivider className="mb-16" />

        {/* Support Categories */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="section-header mb-12">
            <h2 className="font-arabic">تصفح حسب الفئة</h2>
            <p>اختر الفئة التي تحتاج المساعدة فيها</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {supportCategories.map((category, index) => {
              const Icon = category.icon
              const colors = getColorClasses(category.color)
              
              return (
                <Card key={index} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      <div>
                        <CardTitle className="font-arabic">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <Link 
                            href="/faq" 
                            className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-2 group"
                          >
                            <span className="text-gold-600 group-hover:translate-x-1 transition-transform">←</span>
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Common Issues */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="section-header mb-12">
            <h2 className="font-arabic">المشاكل الشائعة</h2>
            <p>حلول سريعة للمشاكل الأكثر شيوعاً</p>
          </div>

          <div className="space-y-4">
            {commonIssues.map((issue, index) => {
              const Icon = issue.icon
              
              return (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary-900 mb-2">
                          {issue.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {issue.solution}
                        </p>
                        <Link href={issue.link}>
                          <Button variant="outline" size="sm">
                            معرفة المزيد
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Support Hours */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-primary-50 to-gold-50 border-primary-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-elegant flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary-900 font-arabic mb-4">
                ساعات عمل الدعم الفني
              </h2>
              <div className="space-y-2 text-lg text-muted-foreground mb-6">
                <p>السبت - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
                <p>الجمعة: مغلق</p>
                <p className="text-sm mt-4">التوقيت: توقيت مكة المكرمة (GMT+3)</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="btn-gold">
                    <Mail className="h-4 w-4 ml-2" />
                    أرسل رسالة
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 ml-2" />
                    تصفح الأسئلة الشائعة
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary-950 text-white py-16 mt-20">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Logo variant="light" size="lg" className="mb-6" />
              <p className="text-white/60 text-sm leading-relaxed">
                منصة رقمية متكاملة لإدارة الإجازات القرآنية والتحقق من صحة الشهادات
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gold-400">الروابط السريعة</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-gold-400 transition-colors">عن النظام</Link></li>
                <li><Link href="/verify" className="hover:text-gold-400 transition-colors">التحقق من شهادة</Link></li>
                <li><Link href="/scholars" className="hover:text-gold-400 transition-colors">الشيوخ المعتمدون</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gold-400">المساعدة</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/faq" className="hover:text-gold-400 transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="/support" className="hover:text-gold-400 transition-colors">الدعم الفني</Link></li>
                <li><Link href="/contact" className="hover:text-gold-400 transition-colors">اتصل بنا</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gold-400">القانونية</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/privacy" className="hover:text-gold-400 transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-gold-400 transition-colors">الشروط والأحكام</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/50">
                &copy; 2026 نظام الإجازة القرآنية. جميع الحقوق محفوظة.
              </p>
              <p className="text-sm text-white/50 font-arabic">
                ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
