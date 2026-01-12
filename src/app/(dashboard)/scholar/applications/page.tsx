'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, FileText, Search, Eye } from 'lucide-react'
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
}

export default function ScholarApplicationsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: applicationsData } = await supabase
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
          )
        `)
        .in('status', ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'])
        .order('submitted_at', { ascending: false })

      const transformed = applicationsData?.map((app: any) => ({
        id: app.id,
        application_number: app.application_number,
        ijazah_type: app.ijazah_type,
        status: app.status,
        submitted_at: app.submitted_at,
        user: {
          full_name: app.profiles?.full_name || 'Unknown',
          email: app.profiles?.email || '',
        },
      })) || []

      setApplications(transformed)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      submitted: { label: 'قيد الانتظار', variant: 'secondary' },
      under_review: { label: 'قيد المراجعة', variant: 'default' },
      interview_scheduled: { label: 'موعد مقابلة', variant: 'outline' },
      approved: { label: 'موافق عليه', variant: 'default' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary-900 mb-2 font-arabic">
          إدارة الطلبات
        </h1>
        <p className="text-muted-foreground text-lg">
          مراجعة والموافقة على طلبات الإجازة
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-arabic">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="البحث برقم الطلب أو اسم المتقدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="submitted">قيد الانتظار</SelectItem>
                <SelectItem value="under_review">قيد المراجعة</SelectItem>
                <SelectItem value="interview_scheduled">موعد مقابلة</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic">قائمة الطلبات</CardTitle>
          <CardDescription>
            {filteredApplications.length} من {applications.length} طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد طلبات'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'جرب تغيير معايير البحث'
                  : 'سيظهر هنا الطلبات المقدمة للمراجعة'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
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

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">المتقدم:</span> {app.user.full_name}
                          </p>
                          <p>
                            <span className="font-medium">البريد:</span> {app.user.email}
                          </p>
                          <p>
                            <span className="font-medium">تاريخ التقديم:</span>{' '}
                            {new Date(app.submitted_at).toLocaleDateString('ar-SA')}
                          </p>
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
    </div>
  )
}
