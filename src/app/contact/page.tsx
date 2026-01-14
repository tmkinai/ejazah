'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)
    
    toast({
      title: 'تم الإرسال بنجاح',
      description: 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.',
    })

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 3000)
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              تواصل معنا
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              نحن هنا للإجابة على استفساراتك ومساعدتك في رحلتك القرآنية
            </p>
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
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic mb-4">
                  معلومات التواصل
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  يسعدنا تواصلك معنا عبر أي من القنوات التالية
                </p>
              </div>

              <OrnamentalDivider />

              {/* Email */}
              <Card className="card-hover">
                <CardContent className="pt-8 px-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-2">البريد الإلكتروني</h3>
                      <a 
                        href="mailto:info@ejazah.com" 
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        info@ejazah.com
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        للاستفسارات العامة
                      </p>
                      <a 
                        href="mailto:support@ejazah.com" 
                        className="text-primary-600 hover:text-primary-800 transition-colors block mt-2"
                      >
                        support@ejazah.com
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        للدعم الفني
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card className="card-hover">
                <CardContent className="pt-8 px-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-gold-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-2">الهاتف</h3>
                      <a 
                        href="tel:+966500000000" 
                        className="text-primary-600 hover:text-primary-800 transition-colors text-lg"
                        dir="ltr"
                      >
                        +966 50 000 0000
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        من السبت إلى الخميس
                        <br />
                        9:00 صباحاً - 5:00 مساءً
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="card-hover">
                <CardContent className="pt-8 px-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-2">العنوان</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        المملكة العربية السعودية
                        <br />
                        الرياض
                        <br />
                        حي النخيل
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-gradient-to-br from-primary-50 to-gold-50 border-primary-200">
                <CardContent className="pt-8 px-6 pb-6">
                  <h3 className="font-semibold text-primary-900 mb-4">روابط سريعة</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/faq" className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-2">
                        <span className="text-gold-600">←</span>
                        الأسئلة الشائعة
                      </Link>
                    </li>
                    <li>
                      <Link href="/support" className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-2">
                        <span className="text-gold-600">←</span>
                        الدعم الفني
                      </Link>
                    </li>
                    <li>
                      <Link href="/verify" className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-2">
                        <span className="text-gold-600">←</span>
                        التحقق من شهادة
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-arabic">أرسل لنا رسالة</CardTitle>
                  <CardDescription>
                    املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900 mb-3 font-arabic">
                        تم الإرسال بنجاح!
                      </h3>
                      <p className="text-muted-foreground">
                        شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">الاسم الكامل *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="example@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+966 5XX XXX XXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">الموضوع *</Label>
                          <select
                            id="subject"
                            required
                            className="w-full p-2 border border-border rounded-lg bg-white"
                            value={formData.subject}
                            onChange={(e) => updateField('subject', e.target.value)}
                          >
                            <option value="">اختر الموضوع</option>
                            <option value="general">استفسار عام</option>
                            <option value="application">استفسار عن طلب إجازة</option>
                            <option value="certificate">استفسار عن شهادة</option>
                            <option value="technical">مشكلة تقنية</option>
                            <option value="scholar">استفسار عن الشيوخ</option>
                            <option value="other">أخرى</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">الرسالة *</Label>
                        <textarea
                          id="message"
                          required
                          rows={6}
                          className="w-full p-3 border border-border rounded-lg resize-none"
                          value={formData.message}
                          onChange={(e) => updateField('message', e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-gold text-lg py-6"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin ml-2" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 ml-2" />
                            إرسال الرسالة
                          </>
                        )}
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        بإرسال هذا النموذج، فإنك توافق على{' '}
                        <Link href="/privacy" className="text-primary-600 hover:underline">
                          سياسة الخصوصية
                        </Link>
                        {' '}و{' '}
                        <Link href="/terms" className="text-primary-600 hover:underline">
                          الشروط والأحكام
                        </Link>
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
