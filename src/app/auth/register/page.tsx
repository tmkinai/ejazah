import { RegisterForm } from '@/components/auth/register-form'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-8 bg-background pattern-overlay">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Logo className="justify-center mb-8" size="lg" />
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              إنشاء حساب جديد
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              انضم إلينا وابدأ رحلتك نحو الإجازة
            </p>
          </div>

          <div className="auth-card">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary-700 hover:text-primary-900 font-medium">
              ← العودة للرئيسية
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:block hero-bg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          <div className="text-center text-white max-w-lg">
            {/* Quran verse */}
            <p className="font-arabic text-gold-400 text-xl mb-8 opacity-90">
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
            </p>
            
            <h2 className="font-arabic text-4xl md:text-5xl font-bold mb-6 leading-tight">
              ابدأ رحلتك
              <span className="block text-gold-400 mt-2">نحو الإجازة</span>
            </h2>
            
            <OrnamentalDivider className="my-8 [&>span]:text-gold-400 [&>div]:from-transparent [&>div]:to-gold-400/50" />
            
            <p className="text-white/80 text-lg leading-relaxed">
              انضم إلى آلاف الطلاب الذين حصلوا على إجازاتهم القرآنية من خلال منصتنا
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-gold-400 mb-1">+500</div>
                <div className="text-xs text-white/60">إجازة صادرة</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-gold-400 mb-1">+50</div>
                <div className="text-xs text-white/60">شيخ معتمد</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-gold-400 mb-1">+20</div>
                <div className="text-xs text-white/60">دولة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
