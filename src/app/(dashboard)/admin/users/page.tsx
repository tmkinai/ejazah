'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, LogOut, Users, Search, MoreHorizontal, Shield, BookOpen, User } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone_number: string | null
  roles: string[]
  is_verified: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch all users (admin can see all via RLS)
        const { data: usersData, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(usersData || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (roles: string[]) => {
    if (roles?.includes('admin')) {
      return <Badge className="bg-red-100 text-red-700">مدير</Badge>
    }
    if (roles?.includes('scholar')) {
      return <Badge className="bg-gold-100 text-gold-700">شيخ</Badge>
    }
    return <Badge variant="secondary">طالب</Badge>
  }

  const getRoleIcon = (roles: string[]) => {
    if (roles?.includes('admin')) return <Shield className="h-5 w-5 text-red-600" />
    if (roles?.includes('scholar')) return <BookOpen className="h-5 w-5 text-gold-600" />
    return <User className="h-5 w-5 text-muted-foreground" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-muted-foreground">/</span>
            <Link href="/admin" className="text-muted-foreground hover:text-primary-900">
              لوحة التحكم
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">المستخدمون</span>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 font-arabic">
                إدارة المستخدمين
              </h1>
              <p className="text-muted-foreground mt-2">
                {users.length} مستخدم مسجل في النظام
              </p>
            </div>
          </div>

          <OrnamentalDivider />

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث عن مستخدم..."
              className="w-full pr-10 pl-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        {getRoleIcon(user.roles)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-primary-900">
                            {user.full_name || 'بدون اسم'}
                          </h3>
                          {getRoleBadge(user.roles)}
                          {user.is_verified && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              موثق
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على مستخدمين مطابقين للبحث
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
