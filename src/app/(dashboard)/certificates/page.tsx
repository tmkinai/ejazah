'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, Award, Download, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  status: string
  issue_date: string
  recitation?: string
  memorization_level?: string
}

export default function MyCertificatesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    async function loadCertificates() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch user's certificates
        const { data, error } = await supabase
          .from('ijazah_certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('issue_date', { ascending: false })

        if (error) throw error

        setCertificates(data || [])
      } catch (error) {
        console.error('Error loading certificates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [router, supabase])

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
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      active: { label: 'نشطة', variant: 'default' },
      revoked: { label: 'ملغاة', variant: 'destructive' },
      expired: { label: 'منتهية', variant: 'secondary' },
      suspended: { label: 'معلقة', variant: 'secondary' },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                العودة للوحة التحكم
              </Button>
            </Link>
            <Logo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-10">
          {/* Page Header */}
          <div className="text-center md:text-right">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
              <Award className="h-10 w-10 text-gold-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 font-arabic">
                شهاداتي
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              عرض وإدارة جميع شهادات الإجازة الصادرة لك
            </p>
          </div>

          <OrnamentalDivider />

          {/* Certificates List */}
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">لا توجد شهادات بعد</h3>
                <p className="text-muted-foreground mb-6">
                  لم يتم إصدار أي شهادات لك حتى الآن
                </p>
                <Link href="/applications/new">
                  <Button variant="gold">
                    تقديم طلب إجازة جديد
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="card-hover border-2 border-gold-200 bg-gradient-to-br from-white to-gold-50/30">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gold-600 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>
                    <CardTitle className="text-xl font-arabic">
                      إجازة {getIjazahTypeLabel(cert.ijazah_type)}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {cert.certificate_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {cert.recitation && (
                        <div>
                          <span className="text-muted-foreground">الرواية:</span>{' '}
                          <span className="font-medium">{cert.recitation}</span>
                        </div>
                      )}
                      {cert.memorization_level && (
                        <div>
                          <span className="text-muted-foreground">المستوى:</span>{' '}
                          <span className="font-medium">{cert.memorization_level}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(cert.issue_date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Link href={`/certificates/${cert.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
                      <Button variant="gold" size="sm" className="flex-1">
                        <Download className="h-4 w-4 ml-2" />
                        تنزيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
