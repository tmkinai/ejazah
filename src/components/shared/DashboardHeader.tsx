'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Book,
  User,
  Settings,
  LogOut,
  Shield,
  GraduationCap,
  LayoutDashboard,
  Bell,
  FileText,
  Award,
  Search,
  PlusCircle,
  Library,
  ChevronDown,
} from 'lucide-react'

interface DashboardHeaderProps {
  appSettings?: any
}

export default function DashboardHeader({ appSettings }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const hasRole = (role: string) => {
    if (!profile?.roles) return false
    if (Array.isArray(profile.roles)) {
      return profile.roles.includes(role)
    }
    return false
  }

  const isAdmin = hasRole('admin')
  const isScholar = hasRole('scholar')

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const primaryColor = appSettings?.primary_color || '#1B4332'
  const appName = appSettings?.app_name || 'نظام الإجازة'

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Book className="h-6 w-6" style={{ color: primaryColor }} />
            <h1 className="text-xl font-bold font-arabic hidden sm:block" style={{ color: primaryColor }}>
              {appName}
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-arabic">
                <LayoutDashboard className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </Link>

            <Link href="/applications">
              <Button variant="ghost" size="sm" className="font-arabic">
                <FileText className="w-4 h-4 ml-2" />
                طلباتي
              </Button>
            </Link>

            <Link href="/certificates">
              <Button variant="ghost" size="sm" className="font-arabic">
                <Award className="w-4 h-4 ml-2" />
                شهاداتي
              </Button>
            </Link>

            <Link href="/applications/new">
              <Button variant="ghost" size="sm" className="font-arabic text-green-700 hover:text-green-800 hover:bg-green-50">
                <PlusCircle className="w-4 h-4 ml-2" />
                طلب إجازة
              </Button>
            </Link>

            <Link href="/verify">
              <Button variant="ghost" size="sm" className="font-arabic">
                <Search className="w-4 h-4 ml-2" />
                التحقق
              </Button>
            </Link>
          </nav>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link href="/settings/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-sm" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-arabic text-sm max-w-[120px] truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-right">
                <DropdownMenuLabel className="font-arabic">
                  <div className="flex flex-col text-right">
                    <span className="font-semibold">{profile?.full_name || 'المستخدم'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Admin Dashboard */}
                {isAdmin && (
                  <DropdownMenuItem asChild className="flex-row-reverse">
                    <Link href="/admin" className="flex items-center w-full cursor-pointer gap-2 flex-row-reverse">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="font-arabic flex-1 text-right">لوحة الإدارة</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Scholar Dashboard */}
                {(isScholar || isAdmin) && (
                  <DropdownMenuItem asChild className="flex-row-reverse">
                    <Link href="/scholar" className="flex items-center w-full cursor-pointer gap-2 flex-row-reverse">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="font-arabic flex-1 text-right">لوحة المُجيز</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {(isAdmin || isScholar) && <DropdownMenuSeparator />}

                {/* Profile */}
                <DropdownMenuItem asChild className="flex-row-reverse">
                  <Link href="/profile" className="flex items-center w-full cursor-pointer gap-2 flex-row-reverse">
                    <User className="w-4 h-4" />
                    <span className="font-arabic flex-1 text-right">الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>

                {/* Settings */}
                <DropdownMenuItem asChild className="flex-row-reverse">
                  <Link href="/settings" className="flex items-center w-full cursor-pointer gap-2 flex-row-reverse">
                    <Settings className="w-4 h-4" />
                    <span className="font-arabic flex-1 text-right">الإعدادات</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer flex-row-reverse"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-arabic flex-1 text-right">تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
