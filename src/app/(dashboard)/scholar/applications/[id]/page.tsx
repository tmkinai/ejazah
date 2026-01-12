'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, ArrowLeft, CheckCircle, XCircle, Calendar, FileText, User } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  application_number: string
  ijazah_type: string
  status: string
  submitted_at: string
  personal_info: any
  academic_background: any
  quran_experience: any
  prerequisites: any
  documents: any
  reviewer_notes?: string
  user: {
    full_name: string
    email: string
    phone_number?: string
  }
}

export default function ApplicationReviewPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<Application | null>(null)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadApplication() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch application details
        const { data: appData, error } = await supabase
          .from('ijazah_applications')
          .select(`
            id,
            application_number,
            ijazah_type,
            status,
            submitted_at,
            personal_info,
            academic_background,
            quran_experience,
            prerequisites,
            documents,
            reviewer_notes,
            profiles:user_id (
              full_name,
              email,
              phone_number
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (!appData) {
          router.push('/scholar')
          return
        }

        const transformedApp = {
          id: appData.id,
          application_number: appData.application_number,
          ijazah_type: appData.ijazah_type,
          status: appData.status,
          submitted_at: appData.submitted_at,
          personal_info: appData.personal_info,
          academic_background: appData.academic_background,
          quran_experience: appData.quran_experience,
          prerequisites: appData.prerequisites,
          documents: appData.documents,
          reviewer_notes: appData.reviewer_notes,
          user: {
            full_name: (appData.profiles as any)?.full_name || 'Unknown',
            email: (appData.profiles as any)?.email || '',
            phone_number: (appData.profiles as any)?.phone_number,
          },
        }

        setApplication(transformedApp)
        setNotes(appData.reviewer_notes || '')
      } catch (error) {
        console.error('Error loading application:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadApplication()
    }
  }, [params.id, router, supabase])

  const handleApprove = async () => {
    if (!application) return
    
    setProcessing(true)
    try {
      // Update application status to approved
      const { error } = await supabase
        .from('ijazah_applications')
        .update({
          status: 'approved',
          reviewer_notes: notes,
          decided_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (error) throw error

      alert('تم الموافقة على الطلب بنجاح!')
      router.push('/scholar')
      router.refresh()
    } catch (error) {
      console.error('Error approving application:', error)
      alert('حدث خطأ أثناء الموافقة على الطلب')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!application) return
    if (!notes.trim()) {
      alert('يرجى إضافة سبب الرفض')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('ijazah_applications')
        .update({
          status: 'rejected',
          reviewer_notes: notes,
          decided_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (error) throw error

      alert('تم رفض الطلب')
      router.push('/scholar')
      router.refresh()
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('حدث خطأ أثناء رفض الطلب')
    } finally {
      setProcessing(false)
    }
  }

  const handleStartReview = async () => {
    if (!application) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('ijazah_applications')
        .update({
          status: 'under_review',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (error) throw error

      setApplication({ ...application, status: 'under_review' })
    } catch (error) {
      console.error('Error starting review:', error)
      alert('حدث خطأ أثناء بدء المراجعة')
    } finally {
      setProcessing(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Logo size="lg" className="mb-8" />
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري تحميل الطلب...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-destructive">الطلب غير موجود</p>
        <Link href="/scholar">
          <Button variant="outline" className="mt-4">
            العودة
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/scholar">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
            <Logo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 max-w-6xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2 font-arabic">
                  مراجعة الطلب
                </h1>
                <p className="text-muted-foreground">
                  رقم الطلب: <span className="font-mono font-semibold">{application.application_number}</span>
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {getIjazahTypeLabel(application.ijazah_type)}
              </Badge>
            </div>
          </div>

          <OrnamentalDivider />

          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">معلومات المتقدم</CardTitle>
                  <CardDescription>البيانات الشخصية للمتقدم</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">الاسم الكامل</Label>
                <p className="text-lg font-semibold">{application.user.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                <p className="text-lg font-semibold">{application.user.email}</p>
              </div>
              {application.user.phone_number && (
                <div>
                  <Label className="text-muted-foreground">رقم الهاتف</Label>
                  <p className="text-lg font-semibold">{application.user.phone_number}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">تاريخ التقديم</Label>
                <p className="text-lg font-semibold">
                  {new Date(application.submitted_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">الخلفية الأكاديمية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(application.academic_background || {}).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-muted-foreground capitalize">{key}</Label>
                  <p className="text-base">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quran Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">الخبرة القرآنية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(application.quran_experience || {}).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-muted-foreground capitalize">{key}</Label>
                  <p className="text-base">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {application.prerequisites && Array.isArray(application.prerequisites) && application.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">المتطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {application.prerequisites.map((prereq: any, index: number) => (
                    <li key={index}>{typeof prereq === 'string' ? prereq : JSON.stringify(prereq)}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reviewer Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ملاحظات المراجع</CardTitle>
              <CardDescription>
                أضف ملاحظاتك حول هذا الطلب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="اكتب ملاحظاتك هنا..."
                disabled={processing}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                {application.status === 'submitted' && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartReview}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    ) : (
                      <FileText className="h-5 w-5 ml-2" />
                    )}
                    بدء المراجعة
                  </Button>
                )}
                
                {['under_review', 'interview_scheduled'].includes(application.status) && (
                  <>
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleApprove}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : (
                        <CheckCircle className="h-5 w-5 ml-2" />
                      )}
                      الموافقة على الطلب
                    </Button>

                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleReject}
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : (
                        <XCircle className="h-5 w-5 ml-2" />
                      )}
                      رفض الطلب
                    </Button>
                  </>
                )}

                {application.status === 'approved' && (
                  <div className="text-center">
                    <Badge variant="default" className="text-lg px-6 py-3 bg-green-600">
                      <CheckCircle className="h-5 w-5 ml-2" />
                      تم الموافقة على هذا الطلب
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      يمكنك الآن إصدار الشهادة من لوحة التحكم
                    </p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <Badge variant="destructive" className="text-lg px-6 py-3">
                    <XCircle className="h-5 w-5 ml-2" />
                    تم رفض هذا الطلب
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
