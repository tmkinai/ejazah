import { Button } from '@/components/ui/button'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { FileText, CheckCircle, AlertCircle, Scale, UserCheck, Shield } from 'lucide-react'

export const metadata = {
  title: 'الشروط والأحكام - Ejazah',
  description: 'الشروط والأحكام الخاصة باستخدام نظام الإجازة القرآنية',
}

export default function TermsPage() {
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
              <FileText className="h-10 w-10" />
            </div>
            
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              الشروط والأحكام
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              شروط استخدام منصة نظام الإجازة القرآنية
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
              مرحباً بك في نظام الإجازة القرآنية. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط 
              والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا. إذا كنت لا توافق على هذه الشروط، يرجى عدم 
              استخدام المنصة.
            </p>
          </div>

          <OrnamentalDivider className="mb-12" />

          {/* Key Points */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-6 bg-primary-50 rounded-xl border border-primary-200">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">الموافقة</h3>
              <p className="text-sm text-muted-foreground">
                باستخدام المنصة، توافق على هذه الشروط
              </p>
            </div>

            <div className="text-center p-6 bg-gold-50 rounded-xl border border-gold-200">
              <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                <Scale className="h-7 w-7 text-gold-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">العدالة</h3>
              <p className="text-sm text-muted-foreground">
                شروط عادلة ومتوازنة لجميع الأطراف
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-bold text-primary-900 mb-2 font-arabic">الحماية</h3>
              <p className="text-sm text-muted-foreground">
                حماية حقوق جميع مستخدمي المنصة
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  1. التعريفات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>في هذه الشروط والأحكام، تعني المصطلحات التالية:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li><strong>"المنصة":</strong> نظام الإجازة القرآنية وجميع خدماته</li>
                  <li><strong>"المستخدم":</strong> أي شخص يستخدم المنصة</li>
                  <li><strong>"الطالب":</strong> المستخدم الذي يتقدم للحصول على إجازة قرآنية</li>
                  <li><strong>"الشيخ":</strong> المعلم المعتمد الذي يمنح الإجازات</li>
                  <li><strong>"الإجازة":</strong> الشهادة القرآنية الصادرة من شيخ معتمد</li>
                  <li><strong>"الخدمات":</strong> جميع الخدمات المقدمة عبر المنصة</li>
                  <li><strong>"المحتوى":</strong> جميع النصوص والصور والبيانات على المنصة</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  2. الأهلية والتسجيل
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <h3 className="text-lg font-semibold text-primary-900">شروط الأهلية</h3>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>يجب أن يكون عمرك 13 عاماً على الأقل لاستخدام المنصة</li>
                  <li>إذا كنت دون 18 عاماً، يجب الحصول على موافقة ولي الأمر</li>
                  <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                  <li>يجب الحفاظ على سرية بيانات حسابك</li>
                </ul>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">الحساب</h3>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>أنت مسؤول عن جميع الأنشطة التي تتم من خلال حسابك</li>
                  <li>يجب إبلاغنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                  <li>لا يجوز نقل حسابك إلى شخص آخر</li>
                  <li>نحتفظ بالحق في تعليق أو إنهاء حسابك عند انتهاك الشروط</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  3. استخدام الخدمات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <h3 className="text-lg font-semibold text-primary-900">الاستخدام المسموح</h3>
                <p>يمكنك استخدام المنصة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>التقديم للحصول على إجازة قرآنية</li>
                  <li>التواصل مع الشيوخ المعتمدين</li>
                  <li>متابعة حالة طلباتك</li>
                  <li>التحقق من صحة الإجازات</li>
                  <li>الوصول إلى المحتوى التعليمي</li>
                </ul>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">الاستخدام المحظور</h3>
                <p>يُحظر عليك:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>استخدام المنصة لأي غرض غير قانوني</li>
                  <li>انتحال شخصية شخص آخر أو كيان</li>
                  <li>نشر محتوى مسيء أو غير لائق</li>
                  <li>محاولة اختراق أو تعطيل المنصة</li>
                  <li>جمع بيانات المستخدمين الآخرين</li>
                  <li>استخدام برامج آلية (bots) دون إذن</li>
                  <li>تزوير الإجازات أو المستندات</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  4. الإجازات والشهادات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <h3 className="text-lg font-semibold text-primary-900">عملية التقديم</h3>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>يجب تقديم معلومات صحيحة ودقيقة في طلب الإجازة</li>
                  <li>يجب رفع المستندات المطلوبة بصيغ مقبولة</li>
                  <li>تخضع جميع الطلبات للمراجعة والموافقة</li>
                  <li>لا نضمن قبول أي طلب</li>
                </ul>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">الاختبارات</h3>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>يجب الحضور في الموعد المحدد للاختبار</li>
                  <li>يجب الالتزام بآداب الاختبار والسلوك المهني</li>
                  <li>قرار الشيخ في النتيجة نهائي</li>
                  <li>يمكن إعادة الاختبار حسب سياسة كل شيخ</li>
                </ul>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">الشهادات</h3>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>الشهادات الصادرة موثقة ومحمية من التزوير</li>
                  <li>يمكن التحقق من صحة أي شهادة عبر المنصة</li>
                  <li>لا يجوز تعديل أو تزوير الشهادات</li>
                  <li>نحتفظ بالحق في إلغاء الشهادات المزورة</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  5. الرسوم والمدفوعات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>التسجيل في المنصة مجاني</li>
                  <li>قد تكون هناك رسوم للإجازات حسب سياسة كل شيخ أو مؤسسة</li>
                  <li>جميع الرسوم موضحة بوضوح قبل التقديم</li>
                  <li>المدفوعات آمنة ومشفرة</li>
                  <li>سياسة الاسترداد تخضع لشروط كل شيخ أو مؤسسة</li>
                  <li>نحن لسنا مسؤولين عن النزاعات المالية بين الطلاب والشيوخ</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  6. الملكية الفكرية
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <h3 className="text-lg font-semibold text-primary-900">حقوق المنصة</h3>
                <p>
                  جميع المحتويات والتصاميم والشعارات والعلامات التجارية على المنصة مملوكة لنا أو لمرخصينا. 
                  لا يجوز استخدامها دون إذن كتابي مسبق.
                </p>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">المحتوى الذي تنشره</h3>
                <p>عند رفع محتوى إلى المنصة:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>تحتفظ بملكية المحتوى الخاص بك</li>
                  <li>تمنحنا ترخيصاً لاستخدام المحتوى لتقديم الخدمات</li>
                  <li>تضمن أن لديك الحق في نشر المحتوى</li>
                  <li>تضمن أن المحتوى لا ينتهك حقوق الآخرين</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  7. إخلاء المسؤولية
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  المنصة مقدمة "كما هي" و"حسب التوفر". نحن لا نقدم أي ضمانات صريحة أو ضمنية بشأن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>دقة أو اكتمال المحتوى</li>
                  <li>توفر الخدمة دون انقطاع</li>
                  <li>خلو المنصة من الأخطاء أو الفيروسات</li>
                  <li>ملاءمة الخدمة لأغراض معينة</li>
                </ul>
                <p className="mt-4">
                  نحن لسنا مسؤولين عن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>جودة الخدمات المقدمة من الشيوخ</li>
                  <li>النزاعات بين الطلاب والشيوخ</li>
                  <li>فقدان البيانات بسبب أعطال تقنية</li>
                  <li>الأضرار غير المباشرة أو التبعية</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  8. التعويض
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  توافق على تعويضنا والدفاع عنا ضد أي مطالبات أو أضرار أو خسائر ناتجة عن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>انتهاكك لهذه الشروط والأحكام</li>
                  <li>انتهاكك لأي قوانين أو حقوق طرف ثالث</li>
                  <li>المحتوى الذي تنشره على المنصة</li>
                  <li>استخدامك غير المصرح به للمنصة</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  9. الإنهاء
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <h3 className="text-lg font-semibold text-primary-900">من قبلك</h3>
                <p>يمكنك إنهاء حسابك في أي وقت من خلال إعدادات الحساب.</p>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">من قبلنا</h3>
                <p>نحتفظ بالحق في تعليق أو إنهاء حسابك في الحالات التالية:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>انتهاك هذه الشروط والأحكام</li>
                  <li>استخدام المنصة بطريقة غير قانونية</li>
                  <li>تقديم معلومات كاذبة أو مضللة</li>
                  <li>السلوك المسيء تجاه المستخدمين الآخرين</li>
                  <li>عدم النشاط لفترة طويلة</li>
                </ul>

                <h3 className="text-lg font-semibold text-primary-900 mt-6">بعد الإنهاء</h3>
                <p>عند إنهاء حسابك:</p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                  <li>ستفقد الوصول إلى جميع خدمات المنصة</li>
                  <li>قد نحتفظ ببعض البيانات للأغراض القانونية</li>
                  <li>الشهادات الصادرة تبقى صالحة للتحقق</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  10. التعديلات
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سنخطرك بأي تغييرات جوهرية عبر 
                  البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة بعد التعديلات 
                  يعني موافقتك على الشروط المعدلة.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  11. القانون الحاكم
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن هذه الشروط 
                  يخضع للاختصاص الحصري للمحاكم المختصة في المملكة العربية السعودية.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 font-arabic">
                  12. اتصل بنا
                </h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed pr-13">
                <p>
                  إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا:
                </p>
                <ul className="list-none space-y-3 pr-4">
                  <li><strong>البريد الإلكتروني:</strong> legal@ejazah.com</li>
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

          {/* Acceptance */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary-50 to-gold-50 rounded-2xl border-2 border-primary-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-900 font-arabic mb-3">
                  الموافقة على الشروط
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  باستخدامك لمنصة نظام الإجازة القرآنية، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط 
                  والأحكام وعلى{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline font-semibold">
                    سياسة الخصوصية
                  </Link>
                  .
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/register">
                    <Button className="btn-gold">
                      إنشاء حساب
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">
                      اتصل بنا
                    </Button>
                  </Link>
                </div>
              </div>
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
