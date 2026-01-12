import { Button } from '@/components/ui/button'
import { Logo, Bismillah, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { BookOpen, Shield, Award, Users, CheckCircle, ArrowLeft } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-primary-900 transition-colors">
              المميزات
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-primary-900 transition-colors">
              كيف يعمل
            </Link>
            <Link href="/verify" className="text-muted-foreground hover:text-primary-900 transition-colors">
              التحقق من شهادة
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
      <section className="hero-bg text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Bismillah */}
            <p className="font-arabic text-gold-400 text-xl md:text-2xl mb-8 opacity-90">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            
            <h1 className="font-arabic text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              نظام الإجازة
              <span className="block text-gold-400 mt-2">القرآنية</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة رقمية متكاملة لإدارة الإجازات القرآنية والتحقق من صحة الشهادات بسهولة وأمان
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="btn-gold text-lg px-8 py-6 w-full sm:w-auto group">
                  ابدأ رحلتك الآن
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                >
                  التحقق من شهادة
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-1">+500</div>
                <div className="text-sm text-white/60">إجازة صادرة</div>
              </div>
              <div className="text-center border-x border-white/20 px-4">
                <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-1">+50</div>
                <div className="text-sm text-white/60">شيخ معتمد</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-1">+20</div>
                <div className="text-sm text-white/60">دولة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFBF5"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 container">
        <div className="section-header">
          <OrnamentalDivider className="mb-6" />
          <h2 className="font-arabic">لماذا نظام الإجازة؟</h2>
          <p>نوفر لك منصة شاملة وموثوقة للحصول على إجازتك القرآنية</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {/* Feature 1 */}
          <div className="feature-card group">
            <div className="feature-card-icon group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">تقديم سهل ومنظم</h3>
            <p className="text-muted-foreground leading-relaxed">
              نظام تقديم متعدد الخطوات يرشدك خلال عملية التسجيل بسهولة ويسر
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card group">
            <div className="feature-card-icon group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">التحقق الآمن</h3>
            <p className="text-muted-foreground leading-relaxed">
              تحقق من صحة أي شهادة إجازة قرآنية برمز QR فريد وآمن
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card group">
            <div className="feature-card-icon group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">شهادات معترف بها</h3>
            <p className="text-muted-foreground leading-relaxed">
              إجازات موثقة بسلسلة السند الكاملة من شيوخ معتمدين
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card group">
            <div className="feature-card-icon group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">شيوخ متميزون</h3>
            <p className="text-muted-foreground leading-relaxed">
              نخبة من أفضل الشيوخ والقراء المعتمدين من مختلف أنحاء العالم
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card group">
            <div className="feature-card-icon group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">متابعة فورية</h3>
            <p className="text-muted-foreground leading-relaxed">
              تتبع حالة طلبك لحظة بلحظة واستلم إشعارات بكل تحديث
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card group bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
            <div className="feature-card-icon bg-primary-900 text-gold-400">
              <span className="text-2xl font-arabic">إ</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">أنواع متعددة</h3>
            <p className="text-muted-foreground leading-relaxed">
              إجازة الحفظ، القراءات، التجويد، وإجازة مع السند الكامل
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="container">
          <div className="section-header">
            <OrnamentalDivider className="mb-6" />
            <h2 className="font-arabic">كيف يعمل النظام؟</h2>
            <p>ثلاث خطوات بسيطة للحصول على إجازتك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-900 text-gold-400 text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-elegant">
                ١
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">سجل وقدم طلبك</h3>
              <p className="text-muted-foreground">
                أنشئ حسابك واملأ نموذج الطلب بمعلوماتك وخبرتك القرآنية
              </p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex items-center justify-center -mx-8">
              <div className="w-full h-px bg-gradient-to-r from-primary-300 via-gold-400 to-primary-300" />
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-900 text-gold-400 text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-elegant">
                ٢
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">المراجعة والاختبار</h3>
              <p className="text-muted-foreground">
                يراجع شيخ متخصص طلبك ويحدد موعداً للاختبار الشفوي
              </p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex items-center justify-center -mx-8">
              <div className="w-full h-px bg-gradient-to-r from-primary-300 via-gold-400 to-primary-300" />
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gold-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-gold">
                ٣
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-900 font-arabic">احصل على إجازتك</h3>
              <p className="text-muted-foreground">
                عند النجاح، تحصل على شهادة إجازة رقمية موثقة بالسند
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 hero-bg text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10 text-center">
          <p className="font-arabic text-gold-400 text-lg mb-4">
            ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
          </p>
          
          <h2 className="font-arabic text-4xl md:text-5xl font-bold mb-6">
            ابدأ رحلتك نحو الإجازة
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            انضم إلى آلاف الطلاب الذين حصلوا على إجازاتهم من خلال منصتنا
          </p>
          
          <Link href="/auth/register">
            <Button size="lg" className="btn-gold text-lg px-10 py-6 group">
              سجل الآن مجاناً
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
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
