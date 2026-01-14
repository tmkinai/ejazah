import { Button } from '@/components/ui/button'
import { Logo, Bismillah, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { BookOpen, Award, Users, Target, Heart, Globe, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'عن النظام - Ejazah',
  description: 'تعرف على نظام الإجازة القرآنية ورؤيتنا ورسالتنا',
}

export default function AboutPage() {
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
            <Link href="/verify" className="text-muted-foreground hover:text-primary-900 transition-colors">
              التحقق من شهادة
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
      <section className="hero-bg text-white relative overflow-hidden py-24 border-b-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-arabic text-gold-400 text-xl md:text-2xl mb-6 opacity-90">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              عن نظام الإجازة
              <span className="block text-gold-400 mt-2">القرآنية</span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              منصة رقمية متكاملة تربط طلاب القرآن الكريم بالشيوخ المعتمدين حول العالم
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

      {/* Vision & Mission */}
      <section className="py-24 container">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Vision */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center mx-auto mb-6 shadow-elegant">
              <Target className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-primary-900 font-arabic mb-4">
              رؤيتنا
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              أن نكون المنصة الرائدة عالمياً في ربط طلاب القرآن الكريم بالشيوخ المعتمدين، 
              وتسهيل الحصول على الإجازات القرآنية الموثقة بأعلى معايير الجودة والمصداقية.
            </p>
          </div>

          {/* Mission */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-600 to-gold-700 text-white flex items-center justify-center mx-auto mb-6 shadow-gold">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-primary-900 font-arabic mb-4">
              رسالتنا
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              تيسير طريق طلاب القرآن الكريم للحصول على الإجازات القرآنية من شيوخ موثوقين، 
              والمساهمة في حفظ القرآن الكريم ونشره بالقراءات الصحيحة المتواترة.
            </p>
          </div>
        </div>
      </section>

      <OrnamentalDivider className="container" />

      {/* Our Values */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="section-header">
            <h2 className="font-arabic">قيمنا الأساسية</h2>
            <p>المبادئ التي نؤمن بها ونعمل من أجلها</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            {/* Value 1 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">الأصالة</h3>
              <p className="text-muted-foreground leading-relaxed">
                الالتزام بالسند المتصل والقراءات الصحيحة المتواترة
              </p>
            </div>

            {/* Value 2 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">الجودة</h3>
              <p className="text-muted-foreground leading-relaxed">
                أعلى معايير الاختبار والتقييم من شيوخ متخصصين
              </p>
            </div>

            {/* Value 3 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">الشفافية</h3>
              <p className="text-muted-foreground leading-relaxed">
                وضوح في الإجراءات والمعايير وسهولة في التواصل
              </p>
            </div>

            {/* Value 4 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">العالمية</h3>
              <p className="text-muted-foreground leading-relaxed">
                خدمة طلاب القرآن من جميع أنحاء العالم بلا حدود
              </p>
            </div>

            {/* Value 5 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">الإخلاص</h3>
              <p className="text-muted-foreground leading-relaxed">
                العمل بنية خالصة لخدمة كتاب الله عز وجل
              </p>
            </div>

            {/* Value 6 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">التميز</h3>
              <p className="text-muted-foreground leading-relaxed">
                السعي المستمر لتقديم أفضل خدمة ممكنة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Ijazah */}
      <section className="py-24 container">
        <div className="max-w-4xl mx-auto">
          <div className="section-header">
            <OrnamentalDivider className="mb-6" />
            <h2 className="font-arabic">ما هي الإجازة القرآنية؟</h2>
          </div>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mt-12">
            <p>
              <strong className="text-primary-900">الإجازة القرآنية</strong> هي شهادة موثقة يمنحها شيخ متقن 
              لطالب أتقن القرآن الكريم أو جزءاً منه، تثبت أن الطالب قد قرأ على الشيخ وأتقن القراءة 
              بالرواية المحددة، وتتضمن السند المتصل إلى رسول الله صلى الله عليه وسلم.
            </p>

            <p>
              وللإجازة القرآنية أهمية كبيرة في حفظ القرآن الكريم وضبط قراءته، فهي تضمن نقل القرآن 
              بالتلقي المباشر من الشيوخ المتقنين، كما كان يُنقل منذ عهد النبي صلى الله عليه وسلم 
              إلى يومنا هذا بسند متصل لا ينقطع.
            </p>

            <div className="bg-primary-50 border-r-4 border-primary-600 p-6 rounded-lg">
              <p className="font-arabic text-primary-900 text-xl mb-2">
                ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾
              </p>
              <p className="text-sm text-muted-foreground">سورة الحجر: 9</p>
            </div>

            <h3 className="text-2xl font-bold text-primary-900 font-arabic mt-8 mb-4">
              أنواع الإجازات
            </h3>

            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-gold-600 font-bold text-xl">•</span>
                <div>
                  <strong className="text-primary-900">إجازة الحفظ:</strong> تُمنح لمن أتم حفظ القرآن الكريم كاملاً
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-600 font-bold text-xl">•</span>
                <div>
                  <strong className="text-primary-900">إجازة القراءات:</strong> تُمنح لمن أتقن قراءة القرآن بإحدى القراءات العشر
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-600 font-bold text-xl">•</span>
                <div>
                  <strong className="text-primary-900">إجازة التجويد:</strong> تُمنح لمن أتقن أحكام التجويد نظرياً وعملياً
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-600 font-bold text-xl">•</span>
                <div>
                  <strong className="text-primary-900">إجازة بالسند:</strong> تُمنح مع ذكر السند المتصل إلى النبي صلى الله عليه وسلم
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 hero-bg text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10 text-center">
          <h2 className="font-arabic text-4xl md:text-5xl font-bold mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            انضم إلينا اليوم وابدأ رحلتك نحو الحصول على إجازتك القرآنية
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="btn-gold text-lg px-10 py-6 group">
                سجل الآن
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
            <Link href="/scholars">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                تصفح الشيوخ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 text-white py-16">
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
