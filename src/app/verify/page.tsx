'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, Search, CheckCircle, XCircle, Shield } from 'lucide-react'
import CertificateView from '@/components/certificates/CertificateView'
import Link from 'next/link'

function VerifyPageContent() {
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
      const { data, error: fetchError } = await supabase
        .from('ijazah_certificates')
        .select(`
          id,
          certificate_number,
          ijazah_type,
          status,
          issue_date,
          verification_count,
          last_verified_at
        `)
        .eq('certificate_number', certNumber.trim().toUpperCase())
        .single()

      if (fetchError || !data) {
        setError('الشهادة غير موجودة. يرجى التحقق من رقم الشهادة')

        await supabase.from('verification_logs').insert({
          verifier_ip: 'unknown',
          verifier_user_agent: navigator.userAgent,
          verification_method: 'certificate_number',
          success: false,
          failure_reason: 'Certificate not found',
        })
        return
      }

      setCertificate(data)

      await supabase.from('verification_logs').insert({
        certificate_id: data.id,
        verifier_ip: 'unknown',
        verifier_user_agent: navigator.userAgent,
        verification_method: 'certificate_number',
        success: true,
      })

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

  const handleReset = () => {
    setCertificate(null)
    setCertificateNumber('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">تسجيل دخول</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link href="/auth/register">تسجيل جديد</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-bg text-white py-16 relative overflow-hidden">
        <div className="container text-center space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center">
              <Shield className="h-9 w-9 text-gold-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-arabic">
              التحقق من الشهادة
            </h1>
          </div>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            تحقق من صحة شهادة الإجازة باستخدام رقم الشهادة أو رمز الاستجابة السريعة (QR)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-12 space-y-12">

        {/* Search Form */}
        <div className="max-w-2xl mx-auto -mt-8">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center font-arabic">أدخل رقم الشهادة</CardTitle>
              <CardDescription className="text-center text-base">
                رقم الشهادة يكون بالصيغة: GH-XXXXXXXX
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
                    placeholder="GH-00000001"
                    className="text-center text-lg font-mono h-12"
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
                  className="w-full h-12 text-base"
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

        {/* Certificate Result */}
        {certificate && (
          <div className="space-y-8 animate-fade-in">

            {/* Verification Success Banner */}
            <div className="max-w-3xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 p-1 shadow-xl">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle className="h-9 w-9 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-green-900 font-arabic mb-1">
                        شهادة صحيحة وموثقة ✓
                      </h3>
                      <p className="text-green-800 mb-3">
                        تم التحقق بنجاح — الشهادة{' '}
                        <span className="font-bold px-2 py-0.5 bg-green-200 rounded-full text-sm">
                          {certificate.status === 'active' ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-green-700">
                        <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>عدد التحققات: <strong>{certificate.verification_count || 0}</strong></span>
                        </div>
                        {certificate.last_verified_at && (
                          <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1">
                            <span>آخر تحقق: <strong>{new Date(certificate.last_verified_at).toLocaleDateString('ar-SA')}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1">
                          <span>رقم الشهادة: <strong className="font-mono">{certificate.certificate_number}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Certificate using CertificateView — same wrapper as /certificates/[id] */}
            <div className="container mx-auto p-6 max-w-5xl">
              <CertificateView certificateId={certificate.id} />
            </div>

            {/* Reset Action */}
            <div className="flex justify-center pb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="gap-2 px-8"
              >
                <Search className="w-5 h-5" />
                تحقق من شهادة أخرى
              </Button>
            </div>

          </div>
        )}

        {/* How to Verify Section */}
        {!certificate && (
          <div className="max-w-4xl mx-auto space-y-6">
            <OrnamentalDivider />

            <h2 className="text-3xl font-bold text-center text-primary-900 font-arabic">
              كيفية التحقق من الشهادة
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Method 1 */}
              <div className="group p-8 bg-gradient-to-br from-gold-50 to-amber-50 rounded-2xl border-2 border-gold-200 hover:shadow-xl hover:border-gold-400 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-600 to-amber-600 flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-900 font-arabic mb-3">
                  ١. البحث برقم الشهادة
                </h3>
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  أدخل رقم الشهادة الموجود في الشهادة الأصلية في الحقل أعلاه
                </p>
                <div className="bg-white p-3 rounded-xl border border-gold-300 text-center">
                  <code className="text-primary-900 font-mono font-bold text-sm">
                    مثال: GH-00000001
                  </code>
                </div>
              </div>

              {/* Method 2 */}
              <div className="group p-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border-2 border-primary-200 hover:shadow-xl hover:border-primary-400 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-gold-400" />
                </div>
                <h3 className="text-2xl font-bold text-primary-900 font-arabic mb-3">
                  ٢. مسح رمز QR
                </h3>
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  استخدم كاميرا هاتفك لمسح رمز الاستجابة السريعة المطبوع على الشهادة
                </p>
                <div className="bg-white p-3 rounded-xl border border-primary-300 text-center">
                  <span className="text-primary-900 font-semibold text-sm">
                    تحقق فوري وآمن بدون إدخال بيانات
                  </span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200">
              <h4 className="text-xl font-bold text-primary-900 mb-6 font-arabic flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-700" />
                مميزات الأمان في الشهادة
              </h4>
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { title: 'رمز QR فريد', desc: 'لكل شهادة رمز خاص لا يمكن تكراره' },
                  { title: 'تسجيل التحققات', desc: 'تتبع كامل لعدد مرات ووقت التحقق' },
                  { title: 'حماية ضد التزوير', desc: 'نظام تشفير متطور وموثوق' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-primary-900 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
