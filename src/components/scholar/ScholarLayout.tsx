'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ScholarSidebar from '@/components/scholar/ScholarSidebar'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared/logo'

interface ScholarLayoutProps {
  children: React.ReactNode
}

export default function ScholarLayout({ children }: ScholarLayoutProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [isScholar, setIsScholar] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    checkScholarAccess()
  }, [session, status])

  const checkScholarAccess = async () => {
    try {
      const res = await fetch('/api/profiles')
      if (!res.ok) throw new Error('Failed to load profile')
      const profile = await res.json()

      if (!profile?.roles?.includes('scholar') && !profile?.roles?.includes('admin')) {
        router.push('/dashboard')
        return
      }

      setIsScholar(true)
    } catch (error) {
      console.error('Error checking scholar access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Logo size="lg" className="mb-8" />
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  if (!isScholar) {
    return null
  }

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <ScholarSidebar className="w-64 flex-shrink-0 hidden lg:block" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
