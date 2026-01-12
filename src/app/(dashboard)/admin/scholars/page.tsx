'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, Plus, Users, BookOpen, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Scholar {
  id: string
  full_name: string
  email: string
  specialization: string
  is_active: boolean
  total_ijazat_issued: number
  acceptance_rate: number
  created_at: string
}

export default function ScholarsManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [scholars, setScholars] = useState<Scholar[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadScholars() {
      try {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()

        if (!profile?.roles?.includes('admin')) {
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)

        // Fetch all scholars
        const { data: scholarsData, error } = await supabase
          .from('scholars')
          .select(`
            id,
            specialization,
            is_active,
            total_ijazat_issued,
            acceptance_rate,
            created_at,
            profiles:id (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform data
        const transformedScholars = scholarsData?.map((scholar: any) => ({
          id: scholar.id,
          full_name: scholar.profiles?.full_name || 'Unknown',
          email: scholar.profiles?.email || '',
          specialization: scholar.specialization,
          is_active: scholar.is_active,
          total_ijazat_issued: scholar.total_ijazat_issued,
          acceptance_rate: scholar.acceptance_rate,
          created_at: scholar.created_at,
        })) || []

        setScholars(transformedScholars)
      } catch (error) {
        console.error('Error loading scholars:', error)
      } finally {
        setLoading(false)
      }
    }

    loadScholars()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Logo size="lg" className="mb-8" />
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للوحة الإدارة
              </Button>
            </Link>
            <Logo />
          </div>
          <Link href="/admin/scholars/new">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة شيخ جديد
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-3 font-arabic">
              إدارة الشيوخ
            </h1>
            <p className="text-muted-foreground text-lg">
              إدارة ومراقبة حسابات الشيوخ المعتمدين في النظام
            </p>
          </div>

          <OrnamentalDivider />

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-primary-700">
                    إجمالي الشيوخ
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gold-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary-900 font-arabic">
                  {scholars.length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">شيخ مسجل</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gold-50 to-white border-gold-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gold-700">
                    الشيوخ النشطون
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gold-700 font-arabic">
                  {scholars.filter(s => s.is_active).length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">شيخ نشط حالياً</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    الإجازات الصادرة
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Award className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary-900 font-arabic">
                  {scholars.reduce((sum, s) => sum + s.total_ijazat_issued, 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">إجازة صادرة</p>
              </CardContent>
            </Card>
          </div>

          {/* Scholars List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">قائمة الشيوخ</CardTitle>
              <CardDescription>
                عرض جميع الشيوخ المسجلين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scholars.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا يوجد شيوخ بعد</h3>
                  <p className="text-muted-foreground mb-6">
                    ابدأ بإضافة أول شيخ للنظام
                  </p>
                  <Link href="/admin/scholars/new">
                    <Button variant="gold">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة شيخ جديد
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {scholars.map((scholar) => (
                    <Card key={scholar.id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-primary-900">
                                {scholar.full_name}
                              </h3>
                              <Badge variant={scholar.is_active ? 'default' : 'secondary'}>
                                {scholar.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {scholar.email}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">التخصص:</span>{' '}
                                <span className="font-medium">{scholar.specialization}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الإجازات الصادرة:</span>{' '}
                                <span className="font-medium">{scholar.total_ijazat_issued}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">نسبة القبول:</span>{' '}
                                <span className="font-medium">{scholar.acceptance_rate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/admin/scholars/${scholar.id}`}>
                              <Button variant="outline" size="sm">
                                عرض التفاصيل
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
