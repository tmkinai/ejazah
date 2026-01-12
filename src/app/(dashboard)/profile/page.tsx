'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, User, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

interface Profile {
  id: string
  full_name: string
  full_name_arabic: string | null
  email: string
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  country: string | null
  city: string | null
  bio: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          full_name_arabic: profile.full_name_arabic,
          phone_number: profile.phone_number,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          country: profile.country,
          city: profile.city,
          bio: profile.bio,
        })
        .eq('id', profile.id)

      if (error) throw error

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث الملف الشخصي بنجاح',
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'خطأ',
        description: 'فشل حفظ التغييرات',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>لم يتم العثور على الملف الشخصي</p>
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
            <span className="font-semibold">الملف الشخصي</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary-700" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">
              الملف الشخصي
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة معلوماتك الشخصية
            </p>
          </div>

          <OrnamentalDivider />

          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>
                تحديث بياناتك الشخصية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل (بالإنجليزية)</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name_arabic">الاسم الكامل (بالعربية)</Label>
                  <Input
                    id="full_name_arabic"
                    value={profile.full_name_arabic || ''}
                    onChange={(e) => updateField('full_name_arabic', e.target.value)}
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  لا يمكن تغيير البريد الإلكتروني
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">رقم الهاتف</Label>
                  <Input
                    id="phone_number"
                    value={profile.phone_number || ''}
                    onChange={(e) => updateField('phone_number', e.target.value)}
                    placeholder="+966 5XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس</Label>
                  <select
                    id="gender"
                    className="w-full p-2 border border-border rounded-lg bg-white"
                    value={profile.gender || ''}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">اختر</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">البلد</Label>
                  <Input
                    id="country"
                    value={profile.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="المملكة العربية السعودية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={profile.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="الرياض"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة شخصية</Label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full p-3 border border-border rounded-lg resize-none"
                  value={profile.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="أكتب نبذة مختصرة عنك..."
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">إلغاء</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
