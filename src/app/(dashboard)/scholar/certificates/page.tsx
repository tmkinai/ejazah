'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Award, Search, Eye, PlusCircle, Download } from 'lucide-react'
import Link from 'next/link'

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  status: string
  issue_date: string
  user: {
    full_name: string
  }
}

export default function ScholarCertificatesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    thisMonth: 0,
  })

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: certificates } = await supabase
        .from('ijazah_certificates')
        .select(`
          id,
          certificate_number,
          ijazah_type,
          status,
          issue_date,
          profiles:user_id (
            full_name
          )
        `)
        .eq('scholar_id', user.id)
        .order('issue_date', { ascending: false })

      const transformed = certificates?.map((cert: any) => ({
        id: cert.id,
        certificate_number: cert.certificate_number,
        ijazah_type: cert.ijazah_type,
        status: cert.status,
        issue_date: cert.issue_date,
        user: {
          full_name: cert.profiles?.full_name || 'Unknown',
        },
      })) || []

      setCertificates(transformed)

      const active = transformed.filter(c => c.status === 'active').length
      const thisMonth = transformed.filter(c => {
        const issueDate = new Date(c.issue_date)
        const now = new Date()
        return issueDate.getMonth() === now.getMonth() &&
               issueDate.getFullYear() === now.getFullYear()
      }).length

      setStats({
        total: transformed.length,
        active,
        thisMonth,
      })
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIjazahTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      hifz: 'حفظ',
      qirat: 'قراءة',
      tajweed: 'تجويد',
      sanad: 'سند',
    }
    return typeMap[type] || type
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'نشط', variant: 'default' },
      revoked: { label: 'ملغي', variant: 'destructive' },
      expired: { label: 'منتهي', variant: 'secondary' },
      suspended: { label: 'معلق', variant: 'outline' },
    }

    const statusInfo = statusMap[status] || { label: status, variant: 'default' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-900 mb-2 font-arabic">
            إدارة الإجازات
          </h1>
          <p className="text-muted-foreground text-lg">
            قائمة بجميع الإجازات التي أصدرتها
          </p>
        </div>
        <Link href="/admin/create-ijazah">
          <Button variant="default" size="lg">
            <PlusCircle className="w-5 h-5 ml-2" />
            إصدار إجازة جديدة
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-700">
                إجمالي الإجازات
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center">
                <Award className="h-5 w-5 text-gold-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-900 font-arabic">
              {stats.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2">إجازة صادرة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                الإجازات النشطة
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700 font-arabic">
              {stats.active}
            </div>
            <p className="text-sm text-muted-foreground mt-2">إجازة نشطة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                هذا الشهر
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700 font-arabic">
              {stats.thisMonth}
            </div>
            <p className="text-sm text-muted-foreground mt-2">إجازة جديدة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-arabic">البحث عن إجازة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث برقم الإجازة أو اسم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic">قائمة الإجازات</CardTitle>
          <CardDescription>
            {filteredCertificates.length} من {certificates.length} إجازة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'لا توجد إجازات بعد'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ابدأ بإصدار أول إجازة'}
              </p>
              {!searchTerm && (
                <Link href="/admin/create-ijazah">
                  <Button variant="default">
                    <PlusCircle className="w-4 h-4 ml-2" />
                    إصدار إجازة جديدة
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((cert) => (
                <Card key={cert.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="w-5 h-5 text-gold-600" />
                          <h3 className="font-semibold text-primary-900 font-mono">
                            {cert.certificate_number}
                          </h3>
                          {getStatusBadge(cert.status)}
                          <Badge variant="outline">
                            {getIjazahTypeLabel(cert.ijazah_type)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">الطالب:</span> {cert.user.full_name}
                          </p>
                          <p>
                            <span className="font-medium">تاريخ الإصدار:</span>{' '}
                            {new Date(cert.issue_date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/certificates/${cert.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض
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
  )
}
