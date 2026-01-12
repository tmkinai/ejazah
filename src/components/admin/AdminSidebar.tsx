'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings,
  TrendingUp,
  UserCircle,
  FolderKanban,
  LayoutDashboard,
  ClipboardList,
  Users,
  FileCheck,
  Plus,
  BookOpen,
} from 'lucide-react'

interface Section {
  title: string
  icon: any
  color: string
  iconColor: string
  items: {
    title: string
    description: string
    icon: any
    id: string
    action?: () => void
  }[]
}

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (sectionId: string) => void
  sections: Section[]
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  sections,
}: AdminSidebarProps) {
  // Map section titles to orange/amber theme colors
  const sectionColors: Record<string, { bg: string; border: string; icon: string; active: string }> = {
    'نظام المنصة': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      active: 'bg-amber-600 hover:bg-amber-700',
    },
    'الطلاب والطلبات': {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      active: 'bg-green-600 hover:bg-green-700',
    },
    'الإجازات': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      active: 'bg-amber-600 hover:bg-amber-700',
    },
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const colors = sectionColors[section.title] || {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          active: 'bg-amber-600 hover:bg-amber-700',
        }
        
        return (
          <Card key={section.title} className={`${colors.bg} ${colors.border} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-base flex items-center gap-2 font-arabic ${colors.icon}`}>
                <section.icon className={`w-5 h-5`} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className={`w-full justify-start font-arabic text-sm ${
                    activeSection === item.id
                      ? `${colors.active} text-white`
                      : 'hover:bg-white/50 text-gray-700'
                  }`}
                  onClick={() => {
                    if (item.action) {
                      item.action()
                    } else {
                      onSectionChange(item.id)
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 ml-2" />
                  {item.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
