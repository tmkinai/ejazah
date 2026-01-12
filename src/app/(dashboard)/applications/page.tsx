'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/shared/logo'
import { Loader2, Plus, Eye, Edit2, Trash2, ArrowRight } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Application = Database['public']['Tables']['ijazah_applications']['Row']

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مقدم' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد المراجعة' },
  interview_scheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'موعد المقابلة محدد' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'موافق عليه' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' },
  expired: { bg: 'bg-gray-200', text: 'text-gray-600', label: 'منتهي' },
  withdrawn: { bg: 'bg-gray-200', text: 'text-gray-600', label: 'مسحوب' },
}

const ijazahTypeLabels: Record<string, string> = {
  hifz: 'إجازة الحفظ',
  qirat: 'إجازة القراءات',
  tajweed: 'إجازة التجويد',
  sanad: 'إجازة مع السند',
}

export default function ApplicationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadApplications() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('ijazah_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setApplications(data || [])
      } catch (err) {
        console.error('Error loading applications:', err)
        setError('فشل تحميل الطلبات')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [supabase, router])

  const handleDelete = async (applicationId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      const { error } = await supabase
        .from('ijazah_applications')
        .delete()
        .eq('id', applicationId)

      if (error) throw error
      setApplications(applications.filter((app) => app.id !== applicationId))
    } catch (err) {
      console.error('Error deleting application:', err)
      alert('فشل حذف الطلب')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold">طلباتي</h1>
              <p className="text-sm text-muted-foreground">عرض ومتابعة جميع طلبات الإجازة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowRight className="h-4 w-4 ml-2" />
              لوحة التحكم
            </Button>
            <Button onClick={() => router.push('/applications/new')}>
              <Plus className="h-4 w-4 ml-2" />
              طلب جديد
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {error && (
          <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
                <Button onClick={() => router.push('/applications/new')}>
                  <Plus className="h-4 w-4 ml-2" />
                  قدم طلب جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold">
                          {ijazahTypeLabels[app.ijazah_type] || app.ijazah_type}
                        </h3>
                        <Badge
                          className={`${
                            statusColors[app.status]?.bg
                          } ${statusColors[app.status]?.text} border-0`}
                        >
                          {statusColors[app.status]?.label || app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        رقم الطلب: {app.application_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تاريخ الإنشاء:{' '}
                        {new Date(app.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/applications/${app.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/applications/${app.id}/edit`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
