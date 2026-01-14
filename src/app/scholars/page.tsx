'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import Link from 'next/link'
import { BookOpen, Award, Users, MapPin, Loader2, Search, Globe } from 'lucide-react'

interface Scholar {
  id: string
  full_name: string
  specialization: string
  bio: string
  country: string
  city: string
  certificates_issued: number
  years_of_experience: number
  profile_id: string
  profiles: {
    full_name_arabic: string
  }
}

export default function ScholarsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [scholars, setScholars] = useState<Scholar[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all')

  useEffect(() => {
    async function loadScholars() {
      try {
        const { data, error } = await supabase
          .from('scholars')
          .select(`
            *,
            profiles!inner(full_name_arabic)
          `)
          .order('certificates_issued', { ascending: false })

        if (error) throw error
        setScholars(data || [])
      } catch (error) {
        console.error('Error loading scholars:', error)
      } finally {
        setLoading(false)
      }
    }

    loadScholars()
  }, [supabase])

  const filteredScholars = scholars.filter(scholar => {
    const matchesSearch = 
      scholar.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholar.profiles?.full_name_arabic?.includes(searchTerm) ||
      scholar.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterSpecialization === 'all' || 
      scholar.specialization?.toLowerCase().includes(filterSpecialization.toLowerCase())

    return matchesSearch && matchesFilter
  })

  const specializations = ['all', 'حفظ', 'قراءات', 'تجويد', 'سند']

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
      <section className="hero-bg text-white relative overflow-hidden py-20 border-b-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              الشيوخ المعتمدون
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              نخبة من أفضل الشيوخ والقراء المتقنين من مختلف أنحاء العالم
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-900 mb-2">{scholars.length}</div>
            <div className="text-sm text-muted-foreground">شيخ معتمد</div>
          </div>
          <div className="text-center border-x border-border">
            <div className="text-4xl font-bold text-gold-600 mb-2">
              {scholars.reduce((sum, s) => sum + (s.certificates_issued || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">إجازة صادرة</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-900 mb-2">
              {new Set(scholars.map(s => s.country)).size}
            </div>
            <div className="text-sm text-muted-foreground">دولة</div>
          </div>
        </div>

        <OrnamentalDivider className="mb-12" />

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث عن شيخ..."
              className="w-full pr-12 pl-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Specialization Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {specializations.map((spec) => (
              <Button
                key={spec}
                variant={filterSpecialization === spec ? 'default' : 'outline'}
                onClick={() => setFilterSpecialization(spec)}
                className={filterSpecialization === spec ? 'btn-gold' : ''}
              >
                {spec === 'all' ? 'الكل' : spec}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-700 mb-4" />
            <p className="text-muted-foreground">جاري تحميل الشيوخ...</p>
          </div>
        )}

        {/* Scholars Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredScholars.map((scholar) => (
              <Card key={scholar.id} className="card-hover overflow-hidden">
                <CardContent className="p-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2 font-arabic">
                      {scholar.profiles?.full_name_arabic || scholar.full_name}
                    </h3>
                    <p className="text-center text-white/80 text-sm">
                      {scholar.full_name}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Specialization */}
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gold-600" />
                      <span className="text-sm font-semibold text-primary-900">
                        {scholar.specialization}
                      </span>
                    </div>

                    {/* Location */}
                    {scholar.country && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {scholar.city ? `${scholar.city}, ` : ''}{scholar.country}
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    {scholar.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {scholar.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 pt-4 border-t border-border">
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-primary-900">
                          {scholar.certificates_issued || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">إجازة</div>
                      </div>
                      <div className="flex-1 text-center border-r border-border">
                        <div className="text-2xl font-bold text-gold-600">
                          {scholar.years_of_experience || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">سنة خبرة</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href="/auth/register">
                      <Button className="w-full btn-gold">
                        تقديم طلب إجازة
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredScholars.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-primary-900 mb-3 font-arabic">
              لا توجد نتائج
            </h3>
            <p className="text-muted-foreground mb-6">
              لم يتم العثور على شيوخ مطابقين لمعايير البحث
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterSpecialization('all')
              }}
            >
              إعادة تعيين البحث
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 max-w-3xl mx-auto text-center bg-gradient-to-br from-primary-50 to-gold-50 p-12 rounded-2xl border border-primary-200">
          <h2 className="text-3xl font-bold text-primary-900 font-arabic mb-4">
            هل أنت شيخ متقن؟
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            انضم إلى منصتنا وساهم في نشر القرآن الكريم بالقراءات الصحيحة
          </p>
          <Link href="/become-scholar">
            <Button size="lg" className="btn-gold text-lg px-10 py-6">
              قدم طلب انضمام كشيخ
            </Button>
          </Link>
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
