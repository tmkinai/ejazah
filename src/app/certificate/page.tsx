'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import CertificateView from '@/components/certificates/CertificateView'
import { Loader2 } from 'lucide-react'

function CertificateContent() {
  const searchParams = useSearchParams()
  const certificateId = searchParams.get('id')

  if (!certificateId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-arabic">
          لم يتم تحديد رقم الشهادة
        </h2>
        <p className="text-gray-600 font-arabic">
          يرجى التأكد من صحة الرابط
        </p>
      </div>
    )
  }

  return (
    <CertificateView 
      certificateId={certificateId}
    />
  )
}

export default function PublicCertificatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <Suspense fallback={
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary-700" />
          </div>
        }>
          <CertificateContent />
        </Suspense>
      </div>
    </div>
  )
}
