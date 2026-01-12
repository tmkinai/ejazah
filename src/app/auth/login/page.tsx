import { LoginForm } from '@/components/auth/login-form'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-8 bg-background pattern-overlay">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Logo className="justify-center mb-8" size="lg" />
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              مرحباً بك
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              سجل دخولك للمتابعة إلى حسابك
            </p>
          </div>

          <div className="auth-card">
            <LoginForm />
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
        <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          <div className="text-center text-white max-w-lg">
            {/* Bismillah */}
            <p className="font-arabic text-gold-400 text-xl mb-8 opacity-90">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            
            <h2 className="font-arabic text-4xl md:text-5xl font-bold mb-6 leading-tight">
              نظام الإجازة
              <span className="block text-gold-400 mt-2">القرآنية</span>
            </h2>
            
            <OrnamentalDivider className="my-8 [&>span]:text-gold-400 [&>div]:from-transparent [&>div]:to-gold-400/50" />
            
            <p className="text-white/80 text-lg leading-relaxed">
              منصة رقمية متكاملة لإدارة الإجازات القرآنية والتحقق من صحة الشهادات بسهولة وأمان
            </p>

            {/* Features list */}
            <div className="mt-12 space-y-4 text-right">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400">
                  ✓
                </div>
                <span>تقديم سهل ومنظم</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400">
                  ✓
                </div>
                <span>شهادات موثقة بالسند</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400">
                  ✓
                </div>
                <span>شيوخ معتمدون من جميع أنحاء العالم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
