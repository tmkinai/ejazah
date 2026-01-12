'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, FileText, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  application_number: string
  ijazah_type: string
  status: string
  submitted_at: string
  user: {
    full_name: string
    email: string
  }
  scholar: {
    id: string
    profile: {
      full_name: string
    }
  } | null
}

export default function AdminApplicationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch all applications (admin can see all via RLS)
        const { data: appsData, error } = await supabase
          .from('ijazah_applications')
          .select(`
            id,
            application_number,
            ijazah_type,
            status,
            submitted_at,
            profiles:user_id (
              full_name,
              email
            ),
            scholars:scholar_id (
              id,
              profiles:id (
                full_name
              )
            )
          `)
          .order('submitted_at', { ascending: false })

        if (error) throw error

        const transformedApps = appsData?.map((app: any) => ({
          id: app.id,
          application_number: app.application_number,
          ijazah_type: app.ijazah_type,
          status: app.status,
          submitted_at: app.submitted_at,
          user: {
            full_name: app.profiles?.full_name || 'Unknown',
            email: app.profiles?.email || '',
          },
          scholar: app.scholars ? {
            id: app.scholars.id,
            profile: {
              full_name: app.scholars.profiles?.full_name || 'Unknown'
            }
          } : null,
        })) || []

        setApplications(transformedApps)
      } catch (error) {
        console.error('Error loading applications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
      draft: { label: 'مسودة', icon: <Clock className="h-3 w-3" />, className: 'bg-gray-100 text-gray-700' },
      submitted: { label: 'تم التقديم', icon: <Clock className="h-3 w-3" />, className: 'bg-blue-100 text-blue-700' },
      under_review: { label: 'قيد المراجعة', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-yellow-100 text-yellow-700' },
      interview_scheduled: { label: 'موعد مقابلة', icon: <Clock className="h-3 w-3" />, className: 'bg-purple-100 text-purple-700' },
      approved: { label: 'موافق عليه', icon: <CheckCircle className="h-3 w-3" />, className: 'bg-green-100 text-green-700' },
      rejected: { label: 'مرفوض', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-700' },
    }

    const info = statusMap[status] || { label: status, icon: null, className: 'bg-gray-100' }
    return (
      <Badge className={info.className}>
        <span className="flex items-center gap-1">
          {info.icon}
          {info.label}
        </span>
      </Badge>
    )
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-muted-foreground">/</span>
            <Link href="/admin" className="text-muted-foreground hover:text-primary-900">
              لوحة التحكم
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">الطلبات</span>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              إدارة الطلبات
            </h1>
            <p className="text-muted-foreground mt-2">
              {applications.length} طلب إجمالي
            </p>
          </div>

          <OrnamentalDivider />

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'الكل' : 
                 status === 'submitted' ? 'تم التقديم' :
                 status === 'under_review' ? 'قيد المراجعة' :
                 status === 'approved' ? 'موافق عليه' :
                 status === 'rejected' ? 'مرفوض' : status}
              </Button>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-primary-900">
                          {app.application_number}
                        </h3>
                        {getStatusBadge(app.status)}
                        <Badge variant="outline">
                          {getIjazahTypeLabel(app.ijazah_type)}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p><span className="font-medium">المتقدم:</span> {app.user.full_name}</p>
                          <p><span className="font-medium">البريد:</span> {app.user.email}</p>
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">الشيخ المعين:</span>{' '}
                            {app.scholar?.profile.full_name || 'غير معين'}
                          </p>
                          <p>
                            <span className="font-medium">تاريخ التقديم:</span>{' '}
                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('ar-SA') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/applications/${app.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-2" />
                        عرض
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">
                  لا توجد طلبات تطابق المعايير المحددة
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
