'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  FileText, 
  Award, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Eye,
  GraduationCap,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Application {
  id: string
  application_number: string
  ijazah_type: string
  status: string
  created_at: string
  submitted_at: string | null
}

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  status: string
  issue_date: string
  recitation: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [showScholarBanner, setShowScholarBanner] = useState(false)
  const [scholarApplicationStatus, setScholarApplicationStatus] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalCertificates: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        
        // Check if user is a student (not scholar/admin) to show banner
        const roles = profileData.roles || ['student']
        const isStudent = !roles.includes('scholar') && !roles.includes('admin')
        
        if (isStudent) {
          // Check if user has a pending scholar application
          const { data: scholarApp } = await supabase
            .from('scholar_applications')
            .select('status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (scholarApp) {
            setScholarApplicationStatus(scholarApp.status)
            setShowScholarBanner(scholarApp.status === 'pending')
          } else {
            setShowScholarBanner(true)
          }
        }
      }

      // Load recent applications
      const { data: appsData, count: appsCount } = await supabase
        .from('ijazah_applications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (appsData) {
        setApplications(appsData)
      }

      // Count pending applications
      const { count: pendingCount } = await supabase
        .from('ijazah_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['submitted', 'under_review', 'interview_scheduled'])

      // Count approved applications
      const { count: approvedCount } = await supabase
        .from('ijazah_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved')

      // Load certificates
      const { data: certsData, count: certsCount } = await supabase
        .from('ijazah_certificates')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (certsData) {
        setCertificates(certsData)
      }

      setStats({
        totalApplications: appsCount || 0,
        pendingApplications: pendingCount || 0,
        approvedApplications: approvedCount || 0,
        totalCertificates: certsCount || 0,
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'مسودة', icon: FileText },
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'قيد المراجعة', icon: Clock },
      under_review: { color: 'bg-yellow-100 text-yellow-800', label: 'تحت الدراسة', icon: Clock },
      interview_scheduled: { color: 'bg-purple-100 text-purple-800', label: 'مقابلة مجدولة', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'مقبول', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'مرفوض', icon: XCircle },
      active: { color: 'bg-green-100 text-green-800', label: 'نشط', icon: CheckCircle },
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getIjazahTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      hifz: 'حفظ',
      qirat: 'قراءات',
      tajweed: 'تجويد',
      sanad: 'سند',
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-arabic mb-2">
          مرحباً {profile?.full_name || 'بك'}
        </h1>
        <p className="text-muted-foreground font-arabic">
          نظام الإجازة الإلكتروني - لوحة التحكم الشخصية
        </p>
      </div>

      {/* Become Scholar Banner */}
      {showScholarBanner && (
        <Card className="mb-8 bg-gradient-to-br from-gold-50 via-amber-50 to-white border-gold-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-600 to-amber-600 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-primary-900 font-arabic">
                      هل أنت شيخ مُجيز؟
                    </h3>
                    <Sparkles className="w-5 h-5 text-gold-600" />
                  </div>
                  <p className="text-gray-700 font-arabic">
                    انضم إلى نخبة المُجيزين المعتمدين وشارك علمك مع طلاب القرآن الكريم حول العالم
                  </p>
                </div>
              </div>
              <Link href="/become-scholar">
                <Button variant="default" size="lg" className="bg-gold-600 hover:bg-gold-700 text-white">
                  <GraduationCap className="w-5 h-5 ml-2" />
                  قدّم طلبك الآن
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Scholar Application Alert */}
      {scholarApplicationStatus === 'pending' && (
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 font-arabic">
            <strong>طلبك قيد المراجعة:</strong> تم تقديم طلبك لتصبح مُجيزاً معتمداً. سنقوم بإعلامك عند اتخاذ قرار.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-sm text-muted-foreground font-arabic">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-sm text-muted-foreground font-arabic">قيد المراجعة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvedApplications}</p>
                <p className="text-sm text-muted-foreground font-arabic">مقبولة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-sm text-muted-foreground font-arabic">الشهادات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold font-arabic mb-2">طلب إجازة جديدة</h3>
                <p className="text-sm text-muted-foreground font-arabic mb-4">
                  ابدأ رحلتك للحصول على إجازة قرآنية موثقة
                </p>
                <Link href="/applications/new">
                  <Button className="font-arabic">
                    <PlusCircle className="w-4 h-4 ml-2" />
                    تقديم طلب
                  </Button>
                </Link>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <PlusCircle className="w-10 h-10 text-primary-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold font-arabic mb-2">التحقق من شهادة</h3>
                <p className="text-sm text-muted-foreground font-arabic mb-4">
                  تحقق من صحة أي شهادة إجازة صادرة
                </p>
                <Link href="/verify">
                  <Button variant="outline" className="font-arabic border-amber-300 hover:bg-amber-50">
                    <Eye className="w-4 h-4 ml-2" />
                    التحقق الآن
                  </Button>
                </Link>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-arabic">آخر الطلبات</CardTitle>
              <CardDescription className="font-arabic">طلبات الإجازة الأخيرة</CardDescription>
            </div>
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="font-arabic">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-arabic">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد طلبات بعد</p>
                <Link href="/applications/new">
                  <Button variant="link" className="font-arabic mt-2">
                    تقديم طلب جديد
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium font-arabic">
                            إجازة {getIjazahTypeLabel(app.ijazah_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.application_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        {getStatusBadge(app.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.created_at), 'd MMM yyyy', { locale: ar })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-arabic">شهاداتي</CardTitle>
              <CardDescription className="font-arabic">الإجازات الصادرة</CardDescription>
            </div>
            <Link href="/certificates">
              <Button variant="ghost" size="sm" className="font-arabic">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-arabic">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد شهادات بعد</p>
                <p className="text-sm mt-2">ستظهر هنا بعد اعتماد طلبك</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <Link key={cert.id} href={`/certificates/${cert.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium font-arabic">
                            {cert.recitation || getIjazahTypeLabel(cert.ijazah_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cert.certificate_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        {getStatusBadge(cert.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(cert.issue_date), 'd MMM yyyy', { locale: ar })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
