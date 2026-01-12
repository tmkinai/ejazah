'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, Award, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  status: string
  issue_date: string
  user: {
    full_name: string
    email: string
  }
  scholar: {
    profile: {
      full_name: string
    }
  } | null
  verification_count: number
}

export default function AdminCertificatesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch all certificates (admin can see all via RLS)
        const { data: certsData, error } = await supabase
          .from('ijazah_certificates')
          .select(`
            id,
            certificate_number,
            ijazah_type,
            status,
            issue_date,
            verification_count,
            profiles:user_id (
              full_name,
              email
            ),
            scholars:scholar_id (
              profiles:id (
                full_name
              )
            )
          `)
          .order('issue_date', { ascending: false })

        if (error) throw error

        const transformedCerts = certsData?.map((cert: any) => ({
          id: cert.id,
          certificate_number: cert.certificate_number,
          ijazah_type: cert.ijazah_type,
          status: cert.status,
          issue_date: cert.issue_date,
          verification_count: cert.verification_count || 0,
          user: {
            full_name: cert.profiles?.full_name || 'Unknown',
            email: cert.profiles?.email || '',
          },
          scholar: cert.scholars ? {
            profile: {
              full_name: cert.scholars.profiles?.full_name || 'Unknown'
            }
          } : null,
        })) || []

        setCertificates(transformedCerts)
      } catch (error) {
        console.error('Error loading certificates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: 'نشطة', className: 'bg-green-100 text-green-700' },
      revoked: { label: 'ملغاة', className: 'bg-red-100 text-red-700' },
      expired: { label: 'منتهية', className: 'bg-gray-100 text-gray-700' },
      suspended: { label: 'موقوفة', className: 'bg-yellow-100 text-yellow-700' },
    }

    const info = statusMap[status] || { label: status, className: 'bg-gray-100' }
    return <Badge className={info.className}>{info.label}</Badge>
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
            <span className="font-semibold">الشهادات</span>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              إدارة الشهادات
            </h1>
            <p className="text-muted-foreground mt-2">
              {certificates.length} شهادة صادرة
            </p>
          </div>

          <OrnamentalDivider />

          {/* Certificates List */}
          <div className="space-y-4">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <Card key={cert.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                            <Award className="h-5 w-5 text-gold-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary-900">
                              {cert.certificate_number}
                            </h3>
                            <div className="flex gap-2 mt-1">
                              {getStatusBadge(cert.status)}
                              <Badge variant="outline">
                                {getIjazahTypeLabel(cert.ijazah_type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-4">
                          <div>
                            <p><span className="font-medium">الحاصل عليها:</span> {cert.user.full_name}</p>
                            <p><span className="font-medium">البريد:</span> {cert.user.email}</p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">الشيخ المُجيز:</span>{' '}
                              {cert.scholar?.profile.full_name || 'غير محدد'}
                            </p>
                            <p>
                              <span className="font-medium">تاريخ الإصدار:</span>{' '}
                              {new Date(cert.issue_date).toLocaleDateString('ar-SA')}
                            </p>
                            <p>
                              <span className="font-medium">عدد التحققات:</span> {cert.verification_count}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link href={`/verify?cert=${cert.certificate_number}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد شهادات</h3>
                <p className="text-muted-foreground">
                  لم يتم إصدار أي شهادات بعد
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
