'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, User, Mail, Phone, Award, Calendar, Eye } from 'lucide-react'
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

interface StudentProfile {
  id: string
  full_name: string
  email: string
  phone_number?: string
  created_at: string
  certificates: Certificate[]
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentProfile | null>(null)

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    loadStudent()
  }, [params.id, session, sessionStatus])

  const loadStudent = async () => {
    try {
      // Fetch certificates issued by this scholar to this student
      const res = await fetch(`/api/admin/certificates?scholarId=me&studentId=${params.id}`)
      if (!res.ok) {
        router.push('/scholar/students')
        return
      }
      const certificates = await res.json()

      if (!certificates || certificates.length === 0) {
        router.push('/scholar/students')
        return
      }

      // Extract student info from the first certificate's user data
      const firstCert = certificates[0]
      const studentUser = firstCert.user || {}

      setStudent({
        id: params.id as string,
        full_name: studentUser.full_name || studentUser.fullName || 'Unknown',
        email: studentUser.email || '',
        phone_number: studentUser.phone_number || studentUser.phoneNumber,
        created_at: studentUser.created_at || studentUser.createdAt || new Date().toISOString(),
        certificates: certificates.map((cert: any) => ({
          id: cert.id,
          certificate_number: cert.certificate_number || cert.certificateNumber,
          ijazah_type: cert.ijazah_type || cert.ijazahType,
          status: cert.status,
          issue_date: cert.issue_date || cert.issueDate,
          recitation: cert.recitation,
          memorization_level: cert.memorization_level || cert.memorizationLevel,
        })),
      })
    } catch (error) {
      console.error('Error loading student:', error)
    } finally {
      setLoading(false)
    }
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

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">الطالب غير موجود</p>
        <Link href="/scholar/students">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/scholar/students">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة لقائمة الطلاب
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary-900 mb-2 font-arabic">
            ملف الطالب
          </h1>
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-900 flex items-center justify-center">
              <User className="w-8 h-8 text-gold-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-arabic">{student.full_name}</CardTitle>
              <CardDescription>
                عضو منذ {new Date(student.created_at).toLocaleDateString('ar-SA')}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {student.certificates.length} إجازة
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">البريد الإلكتروني</p>
                  <p className="text-base text-gray-900">{student.email}</p>
                </div>
              </div>

              {student.phone_number && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">رقم الهاتف</p>
                    <p className="text-base text-gray-900">{student.phone_number}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Award className="w-5 h-5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">إجمالي الإجازات</p>
                  <p className="text-base text-gray-900 font-arabic">
                    {student.certificates.length} إجازة صادرة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">آخر إجازة</p>
                  <p className="text-base text-gray-900">
                    {student.certificates.length > 0
                      ? new Date(student.certificates[0].issue_date).toLocaleDateString('ar-SA')
                      : 'لا توجد إجازات'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic">الإجازات الصادرة</CardTitle>
          <CardDescription>
            قائمة بجميع الإجازات التي أصدرتها لهذا الطالب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.certificates.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد إجازات بعد</h3>
              <p className="text-muted-foreground mb-6">
                لم تصدر أي إجازة لهذا الطالب بعد
              </p>
              <Link href="/admin/create-ijazah">
                <Button variant="default">
                  <Award className="w-4 h-4 ml-2" />
                  إصدار إجازة جديدة
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {student.certificates.map((cert) => (
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
                            <span className="font-medium">تاريخ الإصدار:</span>{' '}
                            {new Date(cert.issue_date).toLocaleDateString('ar-SA')}
                          </p>
                          {cert.recitation && (
                            <p>
                              <span className="font-medium">الرواية:</span> {cert.recitation}
                            </p>
                          )}
                          {cert.memorization_level && (
                            <p>
                              <span className="font-medium">مستوى الحفظ:</span> {cert.memorization_level}
                            </p>
                          )}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
