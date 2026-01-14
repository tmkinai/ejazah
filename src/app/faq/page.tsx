'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, Award, Users, Shield, Clock } from 'lucide-react'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const categories = [
    {
      icon: BookOpen,
      title: 'عام',
      color: 'primary',
      faqs: [
        {
          question: 'ما هو نظام الإجازة القرآنية؟',
          answer: 'نظام الإجازة القرآنية هو منصة رقمية متكاملة تربط طلاب القرآن الكريم بالشيوخ المعتمدين حول العالم، وتسهل عملية التقديم والحصول على الإجازات القرآنية الموثقة بالسند المتصل.'
        },
        {
          question: 'ما هي الإجازة القرآنية؟',
          answer: 'الإجازة القرآنية هي شهادة موثقة يمنحها شيخ متقن لطالب أتقن القرآن الكريم أو جزءاً منه، تثبت أن الطالب قد قرأ على الشيخ وأتقن القراءة بالرواية المحددة، وتتضمن السند المتصل إلى رسول الله صلى الله عليه وسلم.'
        },
        {
          question: 'هل الخدمة مجانية؟',
          answer: 'التسجيل في المنصة مجاني، ولكن قد تكون هناك رسوم للإجازة نفسها تحددها كل مؤسسة أو شيخ حسب سياستهم. يمكنك الاطلاع على تفاصيل الرسوم عند التقديم.'
        },
        {
          question: 'هل يمكنني التقديم من أي دولة؟',
          answer: 'نعم، المنصة متاحة لجميع المسلمين حول العالم. يمكنك التقديم من أي دولة والتواصل مع الشيوخ عبر الإنترنت.'
        }
      ]
    },
    {
      icon: Award,
      title: 'التقديم والإجازات',
      color: 'gold',
      faqs: [
        {
          question: 'ما هي أنواع الإجازات المتاحة؟',
          answer: 'نوفر أربعة أنواع من الإجازات: إجازة الحفظ (لمن أتم حفظ القرآن كاملاً)، إجازة القراءات (لمن أتقن إحدى القراءات العشر)، إجازة التجويد (لمن أتقن أحكام التجويد)، وإجازة بالسند (تتضمن السند المتصل إلى النبي صلى الله عليه وسلم).'
        },
        {
          question: 'ما هي خطوات التقديم؟',
          answer: 'أولاً: سجل حساباً في المنصة. ثانياً: املأ نموذج التقديم بمعلوماتك وخبرتك القرآنية. ثالثاً: ارفع المستندات المطلوبة. رابعاً: انتظر مراجعة الشيخ وتحديد موعد الاختبار. خامساً: اجتاز الاختبار واحصل على إجازتك.'
        },
        {
          question: 'كم يستغرق الحصول على الإجازة؟',
          answer: 'يختلف الوقت حسب نوع الإجازة ومدى جاهزية الطالب. عادة ما تستغرق عملية المراجعة والاختبار من أسبوعين إلى شهرين. سيتم إعلامك بكل خطوة عبر الإشعارات.'
        },
        {
          question: 'ما هي المستندات المطلوبة؟',
          answer: 'عادة ما تحتاج إلى: نسخة من الهوية أو جواز السفر، شهادات قرآنية سابقة (إن وجدت)، خطاب توصية من شيخ أو معلم قرآن (اختياري)، وأي مستندات أخرى قد يطلبها الشيخ المختص.'
        },
        {
          question: 'هل يمكنني التقديم لأكثر من إجازة؟',
          answer: 'نعم، يمكنك التقديم لأكثر من نوع من الإجازات، ولكن يُفضل إكمال إجازة واحدة قبل البدء في أخرى لضمان التركيز والإتقان.'
        }
      ]
    },
    {
      icon: Users,
      title: 'الشيوخ والاختبارات',
      color: 'green',
      faqs: [
        {
          question: 'كيف يتم اختيار الشيوخ؟',
          answer: 'جميع الشيوخ في منصتنا معتمدون ومتقنون، ولديهم سند متصل إلى النبي صلى الله عليه وسلم. نقوم بمراجعة مؤهلاتهم وخبراتهم بعناية قبل قبولهم في المنصة.'
        },
        {
          question: 'هل يمكنني اختيار الشيخ؟',
          answer: 'نعم، يمكنك تصفح ملفات الشيوخ المعتمدين واختيار من تفضل بناءً على التخصص والخبرة والموقع الجغرافي.'
        },
        {
          question: 'كيف يتم الاختبار؟',
          answer: 'يتم الاختبار عادة عبر مكالمة فيديو مباشرة مع الشيخ. سيطلب منك قراءة أجزاء محددة من القرآن لتقييم إتقانك. مدة الاختبار تختلف حسب نوع الإجازة.'
        },
        {
          question: 'ماذا لو لم أنجح في الاختبار؟',
          answer: 'إذا لم تنجح في المرة الأولى، سيوجهك الشيخ إلى النقاط التي تحتاج إلى تحسين، ويمكنك إعادة الاختبار بعد فترة من المراجعة والتحسين.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      color: 'red',
      faqs: [
        {
          question: 'هل معلوماتي الشخصية آمنة؟',
          answer: 'نعم، نحن نأخذ خصوصية وأمان بياناتك على محمل الجد. جميع المعلومات مشفرة ومحمية بأحدث معايير الأمان، ولا نشارك بياناتك مع أي جهة خارجية دون إذنك.'
        },
        {
          question: 'كيف يمكنني التحقق من صحة الإجازة؟',
          answer: 'كل إجازة تصدر من منصتنا تحتوي على رمز QR فريد ورقم تسلسلي. يمكن لأي شخص التحقق من صحة الإجازة عبر صفحة التحقق في موقعنا بإدخال الرقم أو مسح رمز QR.'
        },
        {
          question: 'هل يمكن تزوير الإجازات؟',
          answer: 'الإجازات الصادرة من منصتنا محمية بتقنيات متقدمة تمنع التزوير، بما في ذلك التشفير الرقمي ورموز QR الفريدة وقاعدة بيانات مركزية للتحقق.'
        }
      ]
    },
    {
      icon: Clock,
      title: 'الدعم والمساعدة',
      color: 'purple',
      faqs: [
        {
          question: 'كيف يمكنني التواصل مع الدعم الفني؟',
          answer: 'يمكنك التواصل معنا عبر صفحة "اتصل بنا" أو إرسال بريد إلكتروني إلى support@ejazah.com. نحن متواجدون للرد على استفساراتك من السبت إلى الخميس.'
        },
        {
          question: 'هل توجد تطبيقات للهواتف؟',
          answer: 'حالياً، المنصة متاحة عبر المتصفح ومتوافقة مع جميع الأجهزة. نعمل على تطوير تطبيقات للهواتف الذكية وستكون متاحة قريباً إن شاء الله.'
        },
        {
          question: 'كيف أتلقى الإشعارات؟',
          answer: 'ستتلقى إشعارات عبر البريد الإلكتروني وداخل المنصة عند كل تحديث على طلبك. يمكنك تخصيص تفضيلات الإشعارات من صفحة الإعدادات.'
        },
        {
          question: 'هل يمكنني حذف حسابي؟',
          answer: 'نعم، يمكنك حذف حسابك في أي وقت من صفحة الإعدادات. يرجى ملاحظة أن هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك نهائياً.'
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      primary: { bg: 'bg-primary-100', text: 'text-primary-700', icon: 'text-primary-600' },
      gold: { bg: 'bg-gold-100', text: 'text-gold-700', icon: 'text-gold-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600' },
      red: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' },
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
              الأسئلة الشائعة
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              إجابات على أكثر الأسئلة شيوعاً حول نظام الإجازة القرآنية
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
        <div className="max-w-4xl mx-auto space-y-12">
          {categories.map((category, categoryIndex) => {
            const Icon = category.icon
            const colors = getColorClasses(category.color)
            
            return (
              <div key={categoryIndex}>
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <h2 className={`text-2xl font-bold ${colors.text} font-arabic`}>
                    {category.title}
                  </h2>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categories
                      .slice(0, categoryIndex)
                      .reduce((sum, cat) => sum + cat.faqs.length, 0) + faqIndex
                    const isOpen = openIndex === globalIndex

                    return (
                      <Card
                        key={faqIndex}
                        className={`card-hover cursor-pointer transition-all ${
                          isOpen ? 'ring-2 ring-primary-500' : ''
                        }`}
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-semibold text-primary-900 flex-1">
                              {faq.question}
                            </h3>
                            <button className="text-primary-600 hover:text-primary-800 transition-colors flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          
                          {isOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 max-w-3xl mx-auto text-center bg-gradient-to-br from-primary-50 to-gold-50 p-12 rounded-2xl border border-primary-200">
          <HelpCircle className="h-16 w-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-900 font-arabic mb-4">
            لم تجد إجابة لسؤالك؟
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            فريق الدعم الفني جاهز لمساعدتك والإجابة على جميع استفساراتك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="btn-gold text-lg px-10 py-6">
                اتصل بنا
              </Button>
            </Link>
            <Link href="/support">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                الدعم الفني
              </Button>
            </Link>
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
