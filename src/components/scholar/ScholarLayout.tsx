'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ScholarSidebar from '@/components/scholar/ScholarSidebar'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared/logo'

interface ScholarLayoutProps {
  children: React.ReactNode
}

export default function ScholarLayout({ children }: ScholarLayoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isScholar, setIsScholar] = useState(false)

  useEffect(() => {
    checkScholarAccess()
  }, [])

  const checkScholarAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

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

  if (loading) {
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
