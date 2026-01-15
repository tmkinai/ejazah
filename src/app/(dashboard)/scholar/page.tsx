'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, FileText, CheckCircle, Clock, AlertCircle, BookOpen, Users, Award, PlusCircle, Eye } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  application_number: string
  ijazah_type: string
  status: string
  submitted_at: string
  personal_info: any
  user: {
    full_name: string
    email: string
  }
}

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  issue_date: string
  user: {
    full_name: string
  }
}

export default function ScholarDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [scholarName, setScholarName] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    completed: 0,
    totalIssued: 0,
    totalStudents: 0,
  })

  useEffect(() => {
    loadScholarData()
  }, [])

  const loadScholarData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles, full_name')
        .eq('id', user.id)
        .single()

      if (!profile?.roles?.includes('scholar') && !profile?.roles?.includes('admin')) {
        router.push('/dashboard')
        return
      }

      setScholarName(profile.full_name || 'Scholar')

      // Fetch scholar's statistics
      const { data: scholarData } = await supabase
        .from('scholars')
        .select('total_ijazat_issued')
        .eq('id', user.id)
        .single()

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('ijazah_applications')
        .select(`
          id,
          application_number,
          ijazah_type,
          status,
          submitted_at,
          personal_info,
          scholar_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .in('status', ['submitted', 'under_review', 'interview_scheduled', 'approved'])
        .order('submitted_at', { ascending: false })
        .limit(10)

      const transformedApps = applicationsData?.map((app: any) => ({
        id: app.id,
        application_number: app.application_number,
        ijazah_type: app.ijazah_type,
        status: app.status,
        submitted_at: app.submitted_at,
        personal_info: app.personal_info,
        user: {
          full_name: app.profiles?.full_name || 'Unknown',
          email: app.profiles?.email || '',
        },
      })) || []

      setApplications(transformedApps)

      // Fetch recent certificates
      const { data: certificatesData } = await supabase
        .from('ijazah_certificates')
        .select(`
          id,
          certificate_number,
          ijazah_type,
          issue_date,
          profiles:user_id (
            full_name
          )
        `)
        .eq('scholar_id', user.id)
        .order('issue_date', { ascending: false })
        .limit(5)

      const transformedCerts = certificatesData?.map((cert: any) => ({
        id: cert.id,
        certificate_number: cert.certificate_number,
        ijazah_type: cert.ijazah_type,
        issue_date: cert.issue_date,
        user: {
          full_name: cert.profiles?.full_name || 'Unknown',
        },
      })) || []

      setRecentCertificates(transformedCerts)

      // Count unique students
      const { data: studentsData } = await supabase
        .from('ijazah_certificates')
        .select('user_id')
        .eq('scholar_id', user.id)

      const uniqueStudents = new Set(studentsData?.map((s: any) => s.user_id)).size

      // Calculate stats
      const pending = transformedApps.filter((a: Application) => a.status === 'submitted').length
      const underReview = transformedApps.filter((a: Application) => 
        ['under_review', 'interview_scheduled'].includes(a.status)
      ).length
      const completed = transformedApps.filter((a: Application) => a.status === 'approved').length

      setStats({
        pending,
        underReview,
        completed,
        totalIssued: scholarData?.total_ijazat_issued || 0,
        totalStudents: uniqueStudents,
      })
    } catch (error) {
      console.error('Error loading scholar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      submitted: { label: 'قيد الانتظار', variant: 'secondary' },
      under_review: { label: 'قيد المراجعة', variant: 'default' },
      interview_scheduled: { label: 'موعد مقابلة', variant: 'outline' },
      approved: { label: 'موافق عليه', variant: 'default' },
    }
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getIjazahTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      hifz: 'حفظ',
      qirat: 'قراءة',
      tajweed: 'تجويد',
      sanad: 'سند',
    }
    return typeMap[type] || type
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center md:text-right">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
          <BookOpen className="h-10 w-10 text-gold-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 font-arabic">
            مرحباً، {scholarName}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          لوحة تحكم الشيخ - مراجعة الطلبات وإصدار الإجازات
        </p>
      </div>

      <OrnamentalDivider />

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="card-hover bg-gradient-to-br from-gold-50 to-white border-gold-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gold-700">
                قيد الانتظار
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-700 font-arabic">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">طلب جديد</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-700">
                قيد المراجعة
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-gold-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-900 font-arabic">
              {stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground mt-1">تحت المراجعة</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مكتمل
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-900 font-arabic">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">طلب موافق</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الإجازات
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-900 font-arabic">
              {stats.totalIssued}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجازة صادرة</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الطلاب
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-900 font-arabic">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">طالب</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl font-arabic">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/scholar/applications">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <FileText className="w-6 h-6 text-primary-900" />
                <span className="font-arabic">مراجعة الطلبات</span>
                {stats.pending > 0 && (
                  <Badge variant="default">{stats.pending} جديد</Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/admin/create-ijazah">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <PlusCircle className="w-6 h-6 text-green-600" />
                <span className="font-arabic">إصدار إجازة جديدة</span>
              </Button>
            </Link>
            
            <Link href="/scholar/students">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-arabic">إدارة الطلاب</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-arabic">آخر الطلبات</CardTitle>
              <CardDescription>أحدث الطلبات المقدمة للمراجعة</CardDescription>
            </div>
            <Link href="/scholar/applications">
              <Button variant="outline" size="sm">
                عرض الكل
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد طلبات حالياً</h3>
              <p className="text-muted-foreground">
                سيظهر هنا الطلبات المسندة إليك للمراجعة
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Card key={app.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-primary-900">
                            {app.application_number}
                          </h3>
                          {getStatusBadge(app.status)}
                          <Badge variant="outline">
                            {getIjazahTypeLabel(app.ijazah_type)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">المتقدم:</span> {app.user.full_name}
                        </div>
                      </div>
                      <Link href={`/scholar/applications/${app.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="w-4 h-4 ml-2" />
                          مراجعة
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Certificates */}
      {recentCertificates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-arabic">آخر الإجازات الصادرة</CardTitle>
                <CardDescription>أحدث الإجازات التي أصدرتها</CardDescription>
              </div>
              <Link href="/scholar/certificates">
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCertificates.map((cert) => (
                <Card key={cert.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-gold-600" />
                          <h3 className="font-semibold text-primary-900">
                            {cert.certificate_number}
                          </h3>
                          <Badge variant="outline">
                            {getIjazahTypeLabel(cert.ijazah_type)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">الطالب:</span> {cert.user.full_name} •{' '}
                          <span>{new Date(cert.issue_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      <Link href={`/certificates/${cert.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
