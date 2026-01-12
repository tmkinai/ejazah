'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/shared/logo'
import { Award, Calendar, User, BookOpen, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface CertificateProps {
  certificate: {
    id: string
    certificate_number: string
    ijazah_type: string
    issue_date: string
    recitation?: string
    memorization_level?: string
    status: string
    qr_code_url?: string
    user: {
      full_name: string
      full_name_arabic?: string
    }
    scholar: {
      full_name: string
      full_name_arabic?: string
      specialization: string
    }
  }
  showQR?: boolean
}

export function CertificateTemplate({ certificate, showQR = true }: CertificateProps) {
  const getIjazahTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      hifz: 'إجازة في الحفظ',
      qirat: 'إجازة في القراءات',
      tajweed: 'إجازة في التجويد',
      sanad: 'إجازة في السند',
    }
    return typeMap[type] || 'إجازة'
  }

  const isActive = certificate.status === 'active'

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-background">
      {/* Certificate Card */}
      <Card className="border-4 border-gold-600 bg-gradient-to-br from-white via-cream-50 to-gold-50/30 shadow-2xl relative overflow-hidden">
        {/* Decorative Islamic Pattern Background */}
        <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />
        
        {/* Top Border Decoration */}
        <div className="h-3 w-full gradient-gold absolute top-0" />
        
        <CardHeader className="text-center space-y-6 pb-0 relative">
          {/* Logo */}
          <div className="flex justify-center pt-8">
            <Logo size="lg" />
          </div>

          {/* Arabic Calligraphy Header */}
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-900 font-arabic leading-relaxed">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>
            <div className="w-32 h-1 bg-gradient-gold mx-auto rounded-full" />
          </div>

          {/* Certificate Title */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold text-gold-700 font-arabic">
              شَهَادَةُ الإِجَازَةِ
            </h2>
            <p className="text-xl text-gold-600 font-arabic">
              {getIjazahTypeLabel(certificate.ijazah_type)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 md:px-16 py-12 relative">
          {/* Certificate Number */}
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-6 py-2 border-2 border-gold-600 bg-white/80">
              <Award className="h-5 w-5 ml-2 text-gold-600" />
              <span className="font-mono font-bold">{certificate.certificate_number}</span>
            </Badge>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 text-lg leading-relaxed">
            <p className="text-primary-900 font-arabic text-2xl">
              نَشْهَدُ أَنَّ الطَّالِبَ الكَرِيمَ
            </p>

            {/* Student Name */}
            <div className="py-6 px-8 bg-gold-50/50 border-2 border-gold-200 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <User className="h-6 w-6 text-primary-900" />
                <h3 className="text-3xl md:text-4xl font-bold text-primary-900 font-arabic">
                  {certificate.user.full_name_arabic || certificate.user.full_name}
                </h3>
              </div>
              {certificate.user.full_name_arabic && certificate.user.full_name && (
                <p className="text-lg text-muted-foreground">
                  {certificate.user.full_name}
                </p>
              )}
            </div>

            <p className="text-primary-900 font-arabic text-xl">
              قَدْ أَتَمَّ دِرَاسَةَ وَحِفْظَ كِتَابِ اللَّهِ الكَرِيمِ
            </p>

            {certificate.recitation && (
              <p className="text-primary-900 font-arabic text-lg">
                بِرِوَايَةِ: <span className="font-bold">{certificate.recitation}</span>
              </p>
            )}

            {certificate.memorization_level && (
              <p className="text-primary-900 font-arabic text-lg">
                المُسْتَوَى: <span className="font-bold">{certificate.memorization_level}</span>
              </p>
            )}

            <p className="text-primary-900 font-arabic text-xl">
              وَقَدْ أَجَزْنَاهُ بِذَٰلِكَ إِجَازَةً مُطْلَقَةً
            </p>

            {/* Scholar Information */}
            <div className="py-6 px-8 bg-primary-50/50 border-2 border-primary-200 rounded-xl mt-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-primary-900" />
                <h4 className="text-2xl md:text-3xl font-bold text-primary-900 font-arabic">
                  {certificate.scholar.full_name_arabic || certificate.scholar.full_name}
                </h4>
              </div>
              {certificate.scholar.full_name_arabic && certificate.scholar.full_name && (
                <p className="text-base text-muted-foreground mb-2">
                  {certificate.scholar.full_name}
                </p>
              )}
              <p className="text-base text-primary-700">
                {certificate.scholar.specialization}
              </p>
            </div>

            {/* Issue Date */}
            <div className="flex items-center justify-center gap-2 text-primary-900 pt-4">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">
                تَارِيخُ الإِصْدَارِ:{' '}
                {new Date(certificate.issue_date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          {showQR && certificate.qr_code_url && (
            <div className="flex flex-col items-center gap-4 pt-8 border-t-2 border-gold-200">
              <div className="p-4 bg-white border-4 border-primary-900 rounded-lg shadow-lg">
                <img
                  src={certificate.qr_code_url}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="w-32 h-32 md:w-40 md:h-40"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  امسح رمز الاستجابة السريعة للتحقق من صحة الشهادة
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {certificate.certificate_number}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          {isActive && (
            <div className="flex justify-center">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                <CheckCircle className="h-4 w-4 ml-2" />
                شهادة موثقة ومعتمدة
              </Badge>
            </div>
          )}
        </CardContent>

        {/* Bottom Border Decoration */}
        <div className="h-3 w-full gradient-gold absolute bottom-0" />
      </Card>

      {/* Verification Note */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>هذه الشهادة صادرة من نظام الإجازة الإلكتروني</p>
        <p>يمكن التحقق من صحتها عبر رمز QR أو رقم الشهادة</p>
      </div>
    </div>
  )
}
