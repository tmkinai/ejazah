'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, Search, CheckCircle, XCircle, Shield } from 'lucide-react'
import { CertificateTemplate } from '@/components/certificates/certificate-template'
import Link from 'next/link'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [certificateNumber, setCertificateNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [certificate, setCertificate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for certificate parameter in URL and auto-verify
  useEffect(() => {
    const certParam = searchParams.get('certificate')
    if (certParam && !certificate && !searching) {
      setCertificateNumber(certParam.toUpperCase())
      // Trigger verification automatically
      handleVerifyWithNumber(certParam.toUpperCase())
    }
  }, [searchParams])

  const handleVerifyWithNumber = async (certNumber: string) => {
    if (!certNumber.trim()) {
      setError('يرجى إدخال رقم الشهادة')
      return
    }

    setSearching(true)
    setError(null)
    setCertificate(null)

    try {
      // Fetch certificate with scholar info
      const { data, error: fetchError } = await supabase
        .from('ijazah_certificates')
        .select(`
          id,
          certificate_number,
          ijazah_type,
          status,
          issue_date,
          recitation,
          memorization_level,
          qr_code_url,
          verification_count,
          last_verified_at,
          metadata,
          scholar_id
        `)
        .eq('certificate_number', certNumber.trim().toUpperCase())
        .single()

      if (fetchError || !data) {
        setError('الشهادة غير موجودة. يرجى التحقق من رقم الشهادة')
        
        // Log failed verification attempt
        await supabase.from('verification_logs').insert({
          verifier_ip: 'unknown',
          verifier_user_agent: navigator.userAgent,
          verification_method: 'certificate_number',
          success: false,
          failure_reason: 'Certificate not found',
        })
        
        return
      }

      // Get student and scholar info from metadata if available
      const metadata = data.metadata as any || {}

      // Fetch scholar info if scholar_id exists
      let scholarName = metadata.scholar_name || null
      let scholarSpecialization = metadata.scholar_specialization || ''
      
      if (data.scholar_id) {
        // Get scholar profile info
        const { data: scholarProfile } = await supabase
          .from('profiles')
          .select('full_name, full_name_arabic')
          .eq('id', data.scholar_id)
          .single()
        
        if (scholarProfile?.full_name) {
          scholarName = scholarProfile.full_name
        }
        
        // Get scholar specialization
        const { data: scholarData } = await supabase
          .from('scholars')
          .select('specialization')
          .eq('id', data.scholar_id)
          .single()
        
        if (scholarData?.specialization) {
          scholarSpecialization = scholarData.specialization
        }
      }

      // Fallback to app settings for default scholar name
      if (!scholarName) {
        const { data: appSettings } = await supabase
          .from('app_settings')
          .select('first_signature_name')
          .limit(1)
          .single()
        
        scholarName = appSettings?.first_signature_name || 'الشيخ المُجيز'
      }

      // Transform data
      const transformedCert = {
        id: data.id,
        certificate_number: data.certificate_number,
        ijazah_type: data.ijazah_type,
        status: data.status,
        issue_date: data.issue_date,
        recitation: data.recitation,
        memorization_level: data.memorization_level,
        qr_code_url: data.qr_code_url,
        verification_count: data.verification_count,
        last_verified_at: data.last_verified_at,
        metadata: metadata,
        user: {
          full_name: metadata.student_name || 'طالب غير معروف',
          full_name_arabic: metadata.student_name || null,
        },
        scholar: {
          full_name: scholarName,
          full_name_arabic: scholarName,
          specialization: scholarSpecialization,
        },
      }

      setCertificate(transformedCert)

      // Log successful verification and increment count
      await supabase.from('verification_logs').insert({
        certificate_id: data.id,
        verifier_ip: 'unknown',
        verifier_user_agent: navigator.userAgent,
        verification_method: 'certificate_number',
        success: true,
      })

      // Increment verification count
      await supabase.rpc('increment_certificate_verification', {
        cert_id: data.id,
      })
    } catch (err: any) {
      console.error('Error verifying certificate:', err)
      setError('حدث خطأ أثناء التحقق من الشهادة')
    } finally {
      setSearching(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleVerifyWithNumber(certificateNumber)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">
                تسجيل دخول
              </Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link href="/auth/register">
                تسجيل جديد
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-10">
          {/* Page Header */}
          <div className="text-center">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Shield className="h-12 w-12 text-gold-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 font-arabic">
                التحقق من الشهادة
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              تحقق من صحة شهادة الإجازة باستخدام رقم الشهادة أو رمز الاستجابة السريعة (QR)
            </p>
          </div>

          <OrnamentalDivider />

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  أدخل رقم الشهادة
                </CardTitle>
                <CardDescription className="text-center">
                  رقم الشهادة يكون بالصيغة: HFZ-26-XXXXX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificate_number">رقم الشهادة</Label>
                    <Input
                      id="certificate_number"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                      placeholder="HFZ-26-12345"
                      className="text-center text-lg font-mono"
                      disabled={searching}
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={searching}
                  >
                    {searching ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                        جاري البحث...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 ml-2" />
                        التحقق من الشهادة
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Certificate Display */}
          {certificate && (
            <div className="space-y-8 animate-fade-in">
              {/* Verification Success Banner */}
              <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-green-900 mb-3 font-arabic">
                        ✓ شهادة صحيحة وموثقة
                      </h3>
                      <p className="text-green-800 text-lg mb-3">
                        تم التحقق من صحة هذه الشهادة بنجاح. الشهادة{' '}
                        <span className="font-bold px-2 py-1 bg-green-200 rounded">
                          {certificate.status === 'active' ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </p>
                      <div className="flex items-center gap-6 text-sm text-green-700 bg-green-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>عدد مرات التحقق: <strong>{certificate.verification_count || 0}</strong></span>
                        </div>
                        {certificate.last_verified_at && (
                          <div className="flex items-center gap-2 border-r pr-6 border-green-300">
                            <span>آخر تحقق:</span>
                            <strong>{new Date(certificate.last_verified_at).toLocaleDateString('ar-SA')}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Template */}
              <div className="max-w-5xl mx-auto">
                <CertificateTemplate certificate={certificate} showQR={true} />
              </div>

              {/* Certificate Info Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">رقم الشهادة</div>
                      <div className="text-lg font-mono font-bold text-primary-900">
                        {certificate.certificate_number}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">نوع الإجازة</div>
                      <div className="text-lg font-bold text-primary-900 font-arabic">
                        {certificate.ijazah_type === 'hifz' && 'حفظ'}
                        {certificate.ijazah_type === 'qirat' && 'قراءة'}
                        {certificate.ijazah_type === 'tajweed' && 'تجويد'}
                        {certificate.ijazah_type === 'sanad' && 'سند'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">تاريخ الإصدار</div>
                      <div className="text-lg font-bold text-primary-900">
                        {new Date(certificate.issue_date).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCertificate(null)
                    setCertificateNumber('')
                    setError(null)
                  }}
                  className="min-w-[200px]"
                >
                  <Search className="w-5 h-5 ml-2" />
                  تحقق من شهادة أخرى
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => window.print()}
                  className="min-w-[200px]"
                >
                  طباعة الشهادة
                </Button>
              </div>
            </div>
          )}

          {/* How to Verify Section */}
          {!certificate && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-gold-50">
                  <CardTitle className="text-3xl text-center font-arabic">
                    كيفية التحقق من الشهادة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4 p-6 bg-gradient-to-br from-gold-50 to-amber-50 rounded-xl border-2 border-gold-200 hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-600 to-amber-600 flex items-center justify-center mb-4 shadow-md">
                        <Search className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900 font-arabic">
                        1. البحث برقم الشهادة
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        أدخل رقم الشهادة الموجود في الشهادة الأصلية
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-gold-300">
                        <code className="text-primary-900 font-mono font-bold">
                          مثال: HFZ-26-12345
                        </code>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center mb-4 shadow-md">
                        <Shield className="h-7 w-7 text-gold-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900 font-arabic">
                        2. مسح رمز QR
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        استخدم كاميرا الهاتف لمسح رمز الاستجابة السريعة الموجود على الشهادة
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-primary-300">
                        <span className="text-primary-900 font-semibold">
                          التحقق الفوري والآمن
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Features */}
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <h4 className="text-xl font-bold text-blue-900 mb-4 font-arabic flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      مميزات الأمان في الشهادة
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-blue-900">رمز QR فريد</div>
                          <div className="text-sm text-blue-700">لكل شهادة رمز خاص</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-blue-900">تسجيل التحققات</div>
                          <div className="text-sm text-blue-700">تتبع عدد مرات التحقق</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-blue-900">حماية ضد التزوير</div>
                          <div className="text-sm text-blue-700">نظام موثوق ومعتمد</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
