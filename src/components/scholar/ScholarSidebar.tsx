'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  FileText,
  Users,
  Award,
  BookOpen,
  Settings,
} from 'lucide-react'

interface ScholarSidebarProps {
  className?: string
}

export default function ScholarSidebar({ className }: ScholarSidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadPendingCount()
  }, [])

  const loadPendingCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('ijazah_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted')

      setPendingCount(count || 0)
    } catch (error) {
      console.error('Error loading pending count:', error)
    }
  }

  const navItems = [
    {
      label: 'الرئيسية',
      href: '/scholar',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'الطلبات',
      href: '/scholar/applications',
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      label: 'الطلاب',
      href: '/scholar/students',
      icon: Users,
    },
    {
      label: 'الإجازات',
      href: '/scholar/certificates',
      icon: Award,
    },
    {
      label: 'السيرة الذاتية',
      href: '/scholar/biography',
      icon: BookOpen,
    },
    {
      label: 'الإعدادات',
      href: '/scholar/settings',
      icon: Settings,
    },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <aside className={cn('bg-white border-l shadow-sm', className)}>
      <div className="sticky top-16 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 font-arabic px-3">
          لوحة المُجيز
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-arabic text-sm transition-colors',
                  active
                    ? 'bg-primary-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-900'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <Badge
                    variant={active ? 'secondary' : 'default'}
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
