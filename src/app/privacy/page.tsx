import { Button } from '@/components/ui/button'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

export const metadata = {
  title: 'سياسة الخصوصية - Ejazah',
  description: 'سياسة الخصوصية وحماية البيانات في نظام الإجازة القرآنية',
}

export default function PrivacyPage() {
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
            <Link href="/contact" className="text-muted-foreground hover:text-primary-900 transition-colors">
              اتصل بنا
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
              <Shield className="h-10 w-10" />
            </div>
            
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              سياسة الخصوصية
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              نحن ملتزمون بحماية خصوصيتك وأمان بياناتك
            </p>
            
            <p className="text-sm text-white/60 mt-4">
              آخر تحديث: 14 يناير 2026
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
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              مرحباً بك في نظام الإجازة القرآنية ("المنصة" أو "الخدمة"). نحن نحترم خصوصيتك ونلتزم بحماية 
              بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية ومشاركة معلوماتك الشخصية 
              عند استخدامك لمنصتنا.
            </p>
          </div>

          <OrnamentalDivider className="mb-12" />

          {/* Key Points */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-6 bg-primary-50 rounded-xl border border-primary-200">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">تشفير البيانات</h3>
              <p className="text-sm text-muted-foreground">
                جميع بياناتك محمية بتشفير عالي المستوى
              </p>
            </div>

            <div className="text-center p-6 bg-gold-50 rounded-xl border border-gold-200">
              <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-7 w-7 text-gold-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">الشفافية</h3>
              <p className="text-sm text-muted-foreground">
                نوضح لك بالضبط كيف نستخدم بياناتك
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">حقوقك</h3>
              <p className="text-sm text-muted-foreground">
                لديك السيطرة الكاملة على بياناتك
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  1. المعلومات التي نجمعها
                </h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed pr-13">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">المعلومات الشخصية</h3>
                  <p className="mb-3">عند التسجيل في المنصة، نجمع المعلومات التالية:</p>
                  <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>الاسم الكامل (بالعربية والإنجليزية)</li>
                    <li>عنوان البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>تاريخ الميلاد</li>
                    <li>الجنس</li>
                    <li>البلد والمدينة</li>
                    <li>نبذة شخصية (اختياري)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">معلومات الطلب</h3>
                  <p className="mb-3">عند تقديم طلب إجازة، نجمع:</p>
                  <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>نوع الإجازة المطلوبة</li>
                    <li>الخبرة القرآنية والمؤهلات</li>
                    <li>المستندات الداعمة (شهادات، هوية)</li>
                    <li>معلومات الاتصال بالمراجع (إن وجدت)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">معلومات الاستخدام</h3>
                  <p className="mb-3">نجمع تلقائياً معلومات حول استخدامك للمنصة:</p>
                  <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>عنوان IP والموقع الجغرافي التقريبي</li>
                    <li>نوع المتصفح والجهاز</li>
                    <li>الصفحات التي تزورها والوقت المستغرق</li>
                    <li>تفاعلاتك مع المنصة</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  2. كيف نستخدم معلوماتك
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li><strong>تقديم الخدمة:</strong> معالجة طلبات الإجازة وإصدار الشهادات</li>
                  <li><strong>التواصل:</strong> إرسال إشعارات حول حالة طلبك والتحديثات المهمة</li>
                  <li><strong>التحسين:</strong> تحليل استخدام المنصة لتحسين تجربة المستخدم</li>
                  <li><strong>الأمان:</strong> حماية المنصة من الاحتيال وإساءة الاستخدام</li>
                  <li><strong>الامتثال:</strong> الالتزام بالمتطلبات القانونية والتنظيمية</li>
                  <li><strong>الدعم:</strong> الرد على استفساراتك وتقديم المساعدة الفنية</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  3. حماية معلوماتك
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li><strong>التشفير:</strong> جميع البيانات مشفرة أثناء النقل والتخزين (SSL/TLS)</li>
                  <li><strong>التحكم في الوصول:</strong> وصول محدود للموظفين المصرح لهم فقط</li>
                  <li><strong>المصادقة:</strong> مصادقة قوية وكلمات مرور آمنة</li>
                  <li><strong>النسخ الاحتياطي:</strong> نسخ احتياطية منتظمة لحماية البيانات</li>
                  <li><strong>المراقبة:</strong> مراقبة مستمرة للأنشطة المشبوهة</li>
                  <li><strong>التحديثات:</strong> تحديثات أمنية منتظمة للأنظمة</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  4. مشاركة المعلومات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية فقط:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li><strong>الشيوخ المعتمدون:</strong> نشارك معلومات طلبك مع الشيخ المختص لمراجعة طلبك</li>
                  <li><strong>مقدمو الخدمات:</strong> شركات موثوقة تساعدنا في تشغيل المنصة (استضافة، بريد إلكتروني)</li>
                  <li><strong>الامتثال القانوني:</strong> عند الطلب من السلطات القانونية المختصة</li>
                  <li><strong>موافقتك:</strong> عندما تمنحنا موافقة صريحة على المشاركة</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  5. حقوقك
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                  <li><strong>التصحيح:</strong> تحديث أو تصحيح بياناتك غير الدقيقة</li>
                  <li><strong>الحذف:</strong> طلب حذف بياناتك (مع بعض الاستثناءات القانونية)</li>
                  <li><strong>التقييد:</strong> طلب تقييد معالجة بياناتك</li>
                  <li><strong>النقل:</strong> الحصول على بياناتك بصيغة قابلة للنقل</li>
                  <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة</li>
                </ul>
                <p className="mt-4">
                  لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر{' '}
                  <Link href="/contact" className="text-primary-600 hover:underline">
                    صفحة الاتصال
                  </Link>.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  6. ملفات تعريف الارتباط (Cookies)
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك على المنصة. ملفات تعريف الارتباط 
                  هي ملفات نصية صغيرة تُخزن على جهازك. نستخدمها لـ:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>الحفاظ على تسجيل دخولك</li>
                  <li>تذكر تفضيلاتك وإعداداتك</li>
                  <li>تحليل استخدام المنصة</li>
                  <li>تحسين الأداء والأمان</li>
                </ul>
                <p>يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  7. الاحتفاظ بالبيانات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. بعد حذف حسابك، 
                  قد نحتفظ ببعض المعلومات للأغراض التالية:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>الامتثال للمتطلبات القانونية</li>
                  <li>حل النزاعات</li>
                  <li>منع الاحتيال</li>
                  <li>إنفاذ اتفاقياتنا</li>
                </ul>
                <p>
                  الشهادات الصادرة تُحفظ بشكل دائم لأغراض التحقق والتوثيق.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  8. خصوصية الأطفال
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  منصتنا مخصصة للأفراد الذين تبلغ أعمارهم 13 عاماً فما فوق. لا نجمع عن قصد معلومات شخصية 
                  من الأطفال دون سن 13 عاماً. إذا كنت والداً أو وصياً وتعتقد أن طفلك قدم لنا معلومات شخصية، 
                  يرجى التواصل معنا لحذف هذه المعلومات.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  9. التغييرات على سياسة الخصوصية
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد 
                  الإلكتروني أو من خلال إشعار بارز على المنصة. ننصحك بمراجعة هذه الصفحة بشكل دوري للاطلاع 
                  على أي تحديثات.
                </p>
                <p>
                  <strong>تاريخ آخر تحديث:</strong> 14 يناير 2026
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  10. اتصل بنا
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، 
                  يرجى التواصل معنا:
                </p>
                <ul className="list-none space-y-3 pr-4">
                  <li><strong>البريد الإلكتروني:</strong> privacy@ejazah.com</li>
                  <li><strong>الهاتف:</strong> +966 50 000 0000</li>
                  <li>
                    <strong>نموذج الاتصال:</strong>{' '}
                    <Link href="/contact" className="text-primary-600 hover:underline">
                      صفحة الاتصال
                    </Link>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary-50 to-gold-50 rounded-2xl border border-primary-200 text-center">
            <h3 className="text-2xl font-bold text-primary-900 font-arabic mb-4">
              هل لديك أسئلة؟
            </h3>
            <p className="text-muted-foreground mb-6">
              فريقنا جاهز للإجابة على جميع استفساراتك حول الخصوصية وحماية البيانات
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="btn-gold">
                  اتصل بنا
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline">
                  الأسئلة الشائعة
                </Button>
              </Link>
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
