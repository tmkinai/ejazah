'use client'

import { useParams, useRouter } from 'next/navigation'
import CertificateView from '@/components/certificates/CertificateView'

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const certificateId = params.id as string

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <CertificateView 
        certificateId={certificateId}
        onBack={() => router.back()}
      />
    </div>
  )
}
