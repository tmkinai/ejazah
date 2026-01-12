'use client'

import { useRouter } from 'next/navigation'
import { IjazahApplicationForm } from '@/components/applications/ijazah-application-form'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function NewApplicationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold">طلب إجازة جديدة</h1>
              <p className="text-sm text-muted-foreground">
                ملء نموذج الطلب
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/applications')}>
              <ArrowRight className="h-4 w-4 ml-2" />
              طلباتي
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              لوحة التحكم
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <IjazahApplicationForm />
        </div>
      </main>
    </div>
  )
}
