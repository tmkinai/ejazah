'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, ArrowLeft, CheckCircle, XCircle, FileText, User, Download, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ScholarApplication {
  id: string
  user_id: string
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

export default function ScholarApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [application, setApplication] = useState<ScholarApplication | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApplication()
  }, [params.id])

  const loadApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

      if (!profile?.roles?.includes('admin')) {
        router.push('/dashboard')
        return
      }

      // Fetch application
      const { data: appData, error: appError } = await supabase
        .from('scholar_applications')
        .select(`
          id,
          user_id,
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
        .eq('id', params.id)
        .single()

      if (appError) throw appError

      if (!appData) {
        router.push('/admin/scholar-applications')
        return
      }

      const transformed = {
        id: appData.id,
        user_id: appData.user_id,
        status: appData.status,
        specialization: appData.specialization,
        bio: appData.bio,
        credentials: appData.credentials,
        sanad_chain: appData.sanad_chain,
        documents: appData.documents || [],
        submitted_at: appData.submitted_at,
        reviewer_notes: appData.reviewer_notes,
        user: {
          full_name: (appData.profiles as any)?.full_name || 'Unknown',
          email: (appData.profiles as any)?.email || '',
          phone_number: (appData.profiles as any)?.phone_number,
        },
      }

      setApplication(transformed)
      setNotes(appData.reviewer_notes || '')
    } catch (error) {
      console.error('Error loading application:', error)
      setError('فشل تحميل الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!application) return

    setProcessing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update application status
      const { error: updateError } = await supabase
        .from('scholar_applications')
        .update({
          status: 'approved',
          reviewer_notes: notes,
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (updateError) throw updateError

      // Add scholar role to user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', application.user_id)
        .single()

      const currentRoles = profile?.roles || ['student']
      const updatedRoles = Array.from(new Set([...currentRoles, 'scholar']))

      const { error: roleError } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', application.user_id)

      if (roleError) throw roleError

      // Create scholar record
      const { error: scholarError } = await supabase
        .from('scholars')
        .upsert({
          id: application.user_id,
          specialization: application.specialization,
          bio_detailed: application.bio,
          credentials: application.credentials,
          sanad_chain: application.sanad_chain,
          is_active: true,
        }, {
          onConflict: 'id'
        })

      if (scholarError) throw scholarError

      alert('تمت الموافقة على الطلب بنجاح!')
      router.push('/admin/scholar-applications')
      router.refresh()
    } catch (err: any) {
      console.error('Error approving application:', err)
      setError(err.message || 'حدث خطأ أثناء الموافقة على الطلب')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!application) return
    if (!notes.trim()) {
      setError('يرجى إضافة سبب الرفض في الملاحظات')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error: updateError } = await supabase
        .from('scholar_applications')
        .update({
          status: 'rejected',
          reviewer_notes: notes,
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (updateError) throw updateError

      alert('تم رفض الطلب')
      router.push('/admin/scholar-applications')
      router.refresh()
    } catch (err: any) {
      console.error('Error rejecting application:', err)
      setError(err.message || 'حدث خطأ أثناء رفض الطلب')
    } finally {
      setProcessing(false)
    }
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
        <Link href="/admin/scholar-applications">
          <Button variant="outline" className="mt-4">
            العودة
          </Button>
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      approved: { label: 'موافق عليه', variant: 'default' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
    }

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant} className="text-base px-4 py-2">{statusInfo.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/scholar-applications">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لقائمة الطلبات
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
                  مراجعة طلب المُجيز
                </h1>
                <p className="text-muted-foreground">
                  تقديم: {new Date(application.submitted_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </div>

          <OrnamentalDivider />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
            </CardContent>
          </Card>

          {/* Specialization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">التخصص</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{application.specialization}</p>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">السيرة الذاتية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{application.bio}</p>
            </CardContent>
          </Card>

          {/* Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">المؤهلات والشهادات</CardTitle>
            </CardHeader>
            <CardContent>
              {typeof application.credentials === 'object' ? (
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(application.credentials, null, 2)}
                </pre>
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">{application.credentials}</p>
              )}
            </CardContent>
          </Card>

          {/* Sanad Chain */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">سلسلة السند</CardTitle>
            </CardHeader>
            <CardContent>
              {typeof application.sanad_chain === 'object' ? (
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(application.sanad_chain, null, 2)}
                </pre>
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">{application.sanad_chain}</p>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {application.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">المستندات المرفقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-900" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 ml-2" />
                          فتح
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviewer Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ملاحظات المراجع</CardTitle>
              <CardDescription>
                أضف ملاحظاتك حول هذا الطلب (مطلوبة في حالة الرفض)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
                placeholder="اكتب ملاحظاتك هنا..."
                disabled={processing || application.status !== 'pending'}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 justify-center">
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
                </div>
              </CardContent>
            </Card>
          )}

          {application.status !== 'pending' && (
            <Card className={`border-2 ${
              application.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <CardContent className="p-6 text-center">
                <div className="text-lg font-semibold mb-2">
                  {application.status === 'approved' ? 'تم الموافقة على هذا الطلب' : 'تم رفض هذا الطلب'}
                </div>
                {application.reviewer_notes && (
                  <p className="text-muted-foreground">
                    {application.reviewer_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
