'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, ArrowLeft, Users, Clock, CheckCircle, XCircle, FileText, Eye } from 'lucide-react'
import Link from 'next/link'

interface ScholarApplication {
  id: string
  status: string
  specialization: string
  bio: string
  credentials: any
  sanad_chain: any
  documents: any[]
  submitted_at: string
  reviewer_notes?: string
  user: {
    full_name: string
    email: string
    phone_number?: string
  }
}

export default function ScholarApplicationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [applications, setApplications] = useState<ScholarApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
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

      // Fetch all scholar applications
      const { data: applicationsData, error } = await supabase
        .from('scholar_applications')
        .select(`
          id,
          status,
          specialization,
          bio,
          credentials,
          sanad_chain,
          documents,
          submitted_at,
          reviewer_notes,
          profiles:user_id (
            full_name,
            email,
            phone_number
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      // Transform data
      const transformed = applicationsData?.map((app: any) => ({
        id: app.id,
        status: app.status,
        specialization: app.specialization,
        bio: app.bio,
        credentials: app.credentials,
        sanad_chain: app.sanad_chain,
        documents: app.documents || [],
        submitted_at: app.submitted_at,
        reviewer_notes: app.reviewer_notes,
        user: {
          full_name: app.profiles?.full_name || 'Unknown',
          email: app.profiles?.email || '',
          phone_number: app.profiles?.phone_number,
        },
      })) || []

      setApplications(transformed)

      // Calculate stats
      const pending = transformed.filter((a: ScholarApplication) => a.status === 'pending').length
      const approved = transformed.filter((a: ScholarApplication) => a.status === 'approved').length
      const rejected = transformed.filter((a: ScholarApplication) => a.status === 'rejected').length

      setStats({ pending, approved, rejected })
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      approved: { label: 'موافق عليه', variant: 'default' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
      withdrawn: { label: 'مسحوب', variant: 'outline' },
    }

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-3 font-arabic">
              طلبات التسجيل كمُجيز
            </h1>
            <p className="text-muted-foreground text-lg">
              مراجعة والموافقة على طلبات الشيوخ للانضمام إلى المنصة
            </p>
          </div>

          <OrnamentalDivider />

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-700">
                    قيد الانتظار
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-700 font-arabic">
                  {stats.pending}
                </div>
                <p className="text-sm text-muted-foreground mt-2">طلب جديد</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-700">
                    موافق عليها
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-700 font-arabic">
                  {stats.approved}
                </div>
                <p className="text-sm text-muted-foreground mt-2">طلب موافق عليه</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-700">
                    مرفوضة
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-700 font-arabic">
                  {stats.rejected}
                </div>
                <p className="text-sm text-muted-foreground mt-2">طلب مرفوض</p>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">جميع الطلبات</CardTitle>
              <CardDescription>
                قائمة بجميع طلبات التسجيل كمُجيز في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد طلبات بعد</h3>
                  <p className="text-muted-foreground">
                    ستظهر هنا طلبات التسجيل كمُجيز عندما يتقدم المستخدمون
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-primary-900">
                                {application.user.full_name}
                              </h3>
                              {getStatusBadge(application.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {application.user.email}
                              {application.user.phone_number && ` • ${application.user.phone_number}`}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-800">التخصص:</span>{' '}
                                <span className="text-gray-700">{application.specialization}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">السيرة الذاتية:</span>{' '}
                                <span className="text-gray-700">
                                  {application.bio.length > 150
                                    ? `${application.bio.substring(0, 150)}...`
                                    : application.bio}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">تاريخ التقديم:</span>{' '}
                                <span className="text-gray-700">
                                  {new Date(application.submitted_at).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                              {application.documents.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-800">المستندات:</span>{' '}
                                  <span className="text-gray-700">
                                    {application.documents.length} مستند مرفق
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/admin/scholar-applications/${application.id}`}>
                              <Button variant="default" size="sm">
                                <Eye className="w-4 h-4 ml-2" />
                                مراجعة
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
