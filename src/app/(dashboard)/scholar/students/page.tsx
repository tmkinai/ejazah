'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Search, Eye, Award, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  full_name: string
  email: string
  phone_number?: string
  certificatesCount: number
  latestCertificate?: {
    certificate_number: string
    ijazah_type: string
    issue_date: string
  }
}

export default function StudentsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all certificates issued by this scholar
      const { data: certificates } = await supabase
        .from('ijazah_certificates')
        .select(`
          user_id,
          certificate_number,
          ijazah_type,
          issue_date,
          profiles:user_id (
            id,
            full_name,
            email,
            phone_number
          )
        `)
        .eq('scholar_id', user.id)
        .order('issue_date', { ascending: false })

      if (!certificates) {
        setLoading(false)
        return
      }

      // Group by student
      const studentsMap = new Map<string, Student>()

      certificates.forEach((cert: any) => {
        const profile = cert.profiles
        if (!profile) return

        if (!studentsMap.has(cert.user_id)) {
          studentsMap.set(cert.user_id, {
            id: cert.user_id,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || '',
            phone_number: profile.phone_number,
            certificatesCount: 0,
          })
        }

        const student = studentsMap.get(cert.user_id)!
        student.certificatesCount++

        if (!student.latestCertificate) {
          student.latestCertificate = {
            certificate_number: cert.certificate_number,
            ijazah_type: cert.ijazah_type,
            issue_date: cert.issue_date,
          }
        }
      })

      const studentsArray = Array.from(studentsMap.values())
      setStudents(studentsArray)
      setStats({
        total: studentsArray.length,
        active: studentsArray.length,
      })
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          إدارة الطلاب
        </h1>
        <p className="text-muted-foreground text-lg">
          قائمة بجميع الطلاب الذين حصلوا على إجازات منك
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-700">
                إجمالي الطلاب
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-gold-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-900 font-arabic">
              {stats.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2">طالب مسجل</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                الطلاب النشطون
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
            <p className="text-sm text-muted-foreground mt-2">طالب نشط</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-arabic">البحث عن طالب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic">قائمة الطلاب</CardTitle>
          <CardDescription>
            {filteredStudents.length} من {students.length} طالب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'لا يوجد طلاب بعد'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'سيظهر هنا الطلاب الذين أصدرت لهم إجازات'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gold-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-primary-900">
                              {student.full_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline">
                                {student.certificatesCount} إجازة
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{student.email}</span>
                          </div>
                          {student.phone_number && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{student.phone_number}</span>
                            </div>
                          )}
                          {student.latestCertificate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Award className="w-4 h-4" />
                              <span>
                                آخر إجازة: {getIjazahTypeLabel(student.latestCertificate.ijazah_type)} •{' '}
                                {new Date(student.latestCertificate.issue_date).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link href={`/scholar/students/${student.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="w-4 h-4 ml-2" />
                          عرض الملف
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
