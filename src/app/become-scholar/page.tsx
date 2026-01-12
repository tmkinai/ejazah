'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, GraduationCap, CheckCircle, XCircle, Clock, Upload, X } from 'lucide-react'
import Link from 'next/link'

const scholarApplicationSchema = z.object({
  specialization: z.string().min(10, 'التخصص يجب أن يكون 10 أحرف على الأقل'),
  bio: z.string().min(100, 'السيرة الذاتية يجب أن تكون 100 حرف على الأقل'),
  credentials: z.string().min(20, 'المؤهلات مطلوبة ويجب أن تكون 20 حرف على الأقل'),
  sanad_chain: z.string().min(20, 'سلسلة السند مطلوبة ويجب أن تكون 20 حرف على الأقل'),
})

type ScholarApplicationFormData = z.infer<typeof scholarApplicationSchema>

export default function BecomeScholarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [isScholar, setIsScholar] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [documents, setDocuments] = useState<Array<{name: string, url: string}>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScholarApplicationFormData>({
    resolver: zodResolver(scholarApplicationSchema),
  })

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is already a scholar
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

      if (profile?.roles?.includes('scholar')) {
        setIsScholar(true)
        setLoading(false)
        return
      }

      // Check if user has pending/approved application
      const { data: application } = await supabase
        .from('scholar_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (application) {
        setExistingApplication(application)
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDocument(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `scholar-documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setDocuments([...documents, { name: file.name, url: publicUrl }])
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError('فشل رفع المستند. يرجى المحاولة مرة أخرى.')
    } finally {
      setUploadingDocument(false)
    }
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ScholarApplicationFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Parse credentials and sanad_chain
      let credentialsJson
      let sanadChainJson

      try {
        credentialsJson = JSON.parse(data.credentials)
      } catch {
        credentialsJson = { text: data.credentials }
      }

      try {
        sanadChainJson = JSON.parse(data.sanad_chain)
      } catch {
        sanadChainJson = { chain: data.sanad_chain }
      }

      const { error: insertError } = await supabase
        .from('scholar_applications')
        .insert({
          user_id: user.id,
          specialization: data.specialization,
          bio: data.bio,
          credentials: credentialsJson,
          sanad_chain: sanadChainJson,
          documents: documents,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      // Redirect to dashboard with success message
      router.push('/dashboard?message=application_submitted')
      router.refresh()
    } catch (err: any) {
      console.error('Error submitting application:', err)
      setError(err.message || 'حدث خطأ أثناء تقديم الطلب')
    } finally {
      setSubmitting(false)
    }
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

  if (isScholar) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container py-4">
            <Logo />
          </div>
        </header>

        <main className="container py-12 max-w-4xl">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2 font-arabic">
                أنت بالفعل مُجيز معتمد
              </h2>
              <p className="text-green-700 mb-6">
                يمكنك الوصول إلى لوحة تحكم المُجيز لإدارة الطلبات والطلاب
              </p>
              <Link href="/scholar">
                <Button variant="default">
                  <GraduationCap className="w-4 h-4 ml-2" />
                  الذهاب للوحة المُجيز
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (existingApplication) {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'amber',
        title: 'طلبك قيد المراجعة',
        description: 'تم تقديم طلبك بنجاح ويقوم فريقنا بمراجعته. سنقوم بإعلامك عند اتخاذ قرار.',
      },
      approved: {
        icon: CheckCircle,
        color: 'green',
        title: 'تم الموافقة على طلبك!',
        description: 'تهانينا! تمت الموافقة على طلبك. سيتم ترقية حسابك قريباً.',
      },
      rejected: {
        icon: XCircle,
        color: 'red',
        title: 'تم رفض الطلب',
        description: existingApplication.reviewer_notes || 'للأسف، تم رفض طلبك. يمكنك التقديم مرة أخرى لاحقاً.',
      },
    }

    const config = statusConfig[existingApplication.status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container py-4">
            <Logo />
          </div>
        </header>

        <main className="container py-12 max-w-4xl">
          <Card className={`bg-${config.color}-50 border-${config.color}-200`}>
            <CardContent className="p-8 text-center">
              <Icon className={`h-16 w-16 text-${config.color}-600 mx-auto mb-4`} />
              <h2 className={`text-2xl font-bold text-${config.color}-900 mb-2 font-arabic`}>
                {config.title}
              </h2>
              <p className={`text-${config.color}-700 mb-6`}>
                {config.description}
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard">
                  <Button variant="outline">
                    العودة للوحة التحكم
                  </Button>
                </Link>
                {existingApplication.status === 'rejected' && (
                  <Button
                    variant="default"
                    onClick={() => setExistingApplication(null)}
                  >
                    تقديم طلب جديد
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center md:text-right">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
              <GraduationCap className="h-10 w-10 text-primary-900" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 font-arabic">
                التقديم لتصبح مُجيزاً
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              انضم إلى نخبة المُجيزين المعتمدين وشارك علمك مع طلاب القرآن الكريم
            </p>
          </div>

          <OrnamentalDivider />

          {/* Requirements Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900 font-arabic">
                المتطلبات الأساسية للتقديم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>إجازة قرآنية معتمدة بسند متصل</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>خبرة لا تقل عن سنتين في تدريس القرآن الكريم</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>مؤهلات علمية في علوم القرآن والتجويد</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>توصيات من شيوخ معتمدين (اختياري)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-arabic">نموذج التقديم</CardTitle>
              <CardDescription>
                يرجى ملء جميع الحقول بدقة وصدق. سيتم مراجعة طلبك من قبل فريقنا المختص.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Specialization */}
                <div className="space-y-2">
                  <Label htmlFor="specialization">التخصص *</Label>
                  <Input
                    id="specialization"
                    {...register('specialization')}
                    placeholder="مثال: حفظ وتجويد - رواية حفص عن عاصم"
                    disabled={submitting}
                  />
                  {errors.specialization && (
                    <p className="text-sm text-destructive">{errors.specialization.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    اذكر تخصصك في علوم القرآن (حفظ، قراءات، تجويد، إلخ)
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">السيرة الذاتية المختصرة *</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    className="min-h-[150px]"
                    placeholder="نبذة عن مسيرتك العلمية والتعليمية في القرآن الكريم..."
                    disabled={submitting}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    100 حرف على الأقل - اذكر خبرتك ومؤهلاتك بإيجاز
                  </p>
                </div>

                {/* Credentials */}
                <div className="space-y-2">
                  <Label htmlFor="credentials">المؤهلات والشهادات *</Label>
                  <Textarea
                    id="credentials"
                    {...register('credentials')}
                    className="min-h-[120px] font-mono text-sm"
                    placeholder='يمكنك كتابة JSON أو نص عادي، مثال:&#10;{"degrees": ["إجازة في القراءات العشر", "دكتوراه في التفسير"]}'
                    disabled={submitting}
                  />
                  {errors.credentials && (
                    <p className="text-sm text-destructive">{errors.credentials.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    اذكر إجازاتك وشهاداتك العلمية المتعلقة بالقرآن
                  </p>
                </div>

                {/* Sanad Chain */}
                <div className="space-y-2">
                  <Label htmlFor="sanad_chain">سلسلة السند *</Label>
                  <Textarea
                    id="sanad_chain"
                    {...register('sanad_chain')}
                    className="min-h-[120px] font-mono text-sm"
                    placeholder='سلسلة الرواية من النبي ﷺ، مثال:&#10;{"chain": ["الشيخ محمد", "الشيخ أحمد", "..."]}'
                    disabled={submitting}
                  />
                  {errors.sanad_chain && (
                    <p className="text-sm text-destructive">{errors.sanad_chain.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    اذكر سلسلة الإسناد المتصلة إلى النبي ﷺ
                  </p>
                </div>

                {/* Documents Upload */}
                <div className="space-y-2">
                  <Label>المستندات الداعمة (اختياري)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDocument || submitting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('document-upload')?.click()}
                        disabled={uploadingDocument || submitting}
                      >
                        {uploadingDocument ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 ml-2" />
                            رفع مستند
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Uploaded Documents List */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                          >
                            <span className="text-sm text-green-800">{doc.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              disabled={submitting}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    يمكنك رفع صور الإجازات والشهادات (PDF, JPG, PNG)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 justify-end pt-4">
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" disabled={submitting}>
                      إلغاء
                    </Button>
                  </Link>
                  <Button type="submit" variant="default" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري التقديم...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4 ml-2" />
                        تقديم الطلب
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
