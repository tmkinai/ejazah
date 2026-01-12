'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, OrnamentalDivider } from '@/components/shared/logo'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const scholarSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  full_name_arabic: z.string().min(3, 'الاسم بالعربية يجب أن يكون 3 أحرف على الأقل'),
  phone_number: z.string().optional(),
  specialization: z.string().min(3, 'التخصص مطلوب'),
  bio_detailed: z.string().min(20, 'السيرة الذاتية يجب أن تكون 20 حرف على الأقل'),
  credentials: z.string().min(10, 'المؤهلات مطلوبة'),
  sanad_chain: z.string().min(10, 'سلسلة السند مطلوبة'),
})

type ScholarFormData = z.infer<typeof scholarSchema>

export default function AddScholarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScholarFormData>({
    resolver: zodResolver(scholarSchema),
  })

  const onSubmit = async (data: ScholarFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: Check if user with this email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, roles')
        .eq('email', data.email)
        .single()

      let userId: string

      if (existingProfile) {
        // User exists, just add scholar role
        userId = existingProfile.id
        const updatedRoles = Array.from(new Set([...existingProfile.roles, 'scholar']))
        
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ 
            roles: updatedRoles,
            full_name: data.full_name,
            full_name_arabic: data.full_name_arabic,
            phone_number: data.phone_number || null,
          })
          .eq('id', userId)

        if (roleError) throw roleError
      } else {
        // User doesn't exist, create invitation
        // For now, we'll show an error asking admin to have the user register first
        setError('المستخدم غير موجود. يرجى مطالبة الشيخ بالتسجيل أولاً باستخدام هذا البريد الإلكتروني.')
        setSubmitting(false)
        return
      }

      // Step 2: Parse JSON fields
      let credentialsJson
      let sanadChainJson

      try {
        credentialsJson = JSON.parse(data.credentials)
      } catch {
        credentialsJson = { text: data.credentials }
      }

      try {
        sanadChainJson = JSON.parse(data.sanad_chain)
      } catch {
        sanadChainJson = { chain: data.sanad_chain }
      }

      // Step 3: Create or update scholar record
      const { error: scholarError } = await supabase
        .from('scholars')
        .upsert({
          id: userId,
          specialization: data.specialization,
          bio_detailed: data.bio_detailed,
          credentials: credentialsJson,
          sanad_chain: sanadChainJson,
          is_active: true,
        }, {
          onConflict: 'id'
        })

      if (scholarError) throw scholarError

      // Success! Redirect to scholars list
      router.push('/admin/scholars')
      router.refresh()
    } catch (err: any) {
      console.error('Error adding scholar:', err)
      setError(err.message || 'حدث خطأ أثناء إضافة الشيخ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/scholars">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لقائمة الشيوخ
              </Button>
            </Link>
            <Logo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-3 font-arabic">
              إضافة شيخ جديد
            </h1>
            <p className="text-muted-foreground text-lg">
              إضافة شيخ معتمد جديد إلى نظام الإجازة
            </p>
          </div>

          <OrnamentalDivider />

          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">معلومات الشيخ</CardTitle>
              <CardDescription>
                يرجى ملء جميع الحقول المطلوبة بدقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">
                    المعلومات الشخصية
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">الاسم الكامل (English) *</Label>
                      <Input
                        id="full_name"
                        {...register('full_name')}
                        placeholder="Dr. Ahmed Mohammed"
                        disabled={submitting}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-destructive">{errors.full_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name_arabic">الاسم الكامل (العربية) *</Label>
                      <Input
                        id="full_name_arabic"
                        {...register('full_name_arabic')}
                        placeholder="د. أحمد محمد"
                        disabled={submitting}
                      />
                      {errors.full_name_arabic && (
                        <p className="text-sm text-destructive">{errors.full_name_arabic.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="scholar@example.com"
                        disabled={submitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        يجب أن يكون المستخدم مسجلاً مسبقاً بهذا البريد
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">رقم الهاتف</Label>
                      <Input
                        id="phone_number"
                        {...register('phone_number')}
                        placeholder="+966 XX XXX XXXX"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">
                    المعلومات الأكاديمية
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">التخصص *</Label>
                    <Input
                      id="specialization"
                      {...register('specialization')}
                      placeholder="حفظ وتجويد - رواية حفص عن عاصم"
                      disabled={submitting}
                    />
                    {errors.specialization && (
                      <p className="text-sm text-destructive">{errors.specialization.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio_detailed">السيرة الذاتية المفصلة *</Label>
                    <textarea
                      id="bio_detailed"
                      {...register('bio_detailed')}
                      className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="نبذة مفصلة عن الشيخ، مؤهلاته، خبراته..."
                      disabled={submitting}
                    />
                    {errors.bio_detailed && (
                      <p className="text-sm text-destructive">{errors.bio_detailed.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentials">المؤهلات والشهادات *</Label>
                    <textarea
                      id="credentials"
                      {...register('credentials')}
                      className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-sm"
                      placeholder='يمكنك كتابة JSON أو نص عادي، مثال:&#10;{"degrees": ["إجازة في القراءات العشر", "دكتوراه في التفسير"]}'
                      disabled={submitting}
                    />
                    {errors.credentials && (
                      <p className="text-sm text-destructive">{errors.credentials.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      يمكنك إدخال JSON أو نص عادي
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sanad_chain">سلسلة السند *</Label>
                    <textarea
                      id="sanad_chain"
                      {...register('sanad_chain')}
                      className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-sm"
                      placeholder='يمكنك كتابة JSON أو نص عادي، مثال:&#10;{"chain": ["الشيخ محمد", "الشيخ أحمد", "..."]}'
                      disabled={submitting}
                    />
                    {errors.sanad_chain && (
                      <p className="text-sm text-destructive">{errors.sanad_chain.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      سلسلة الرواية من النبي ﷺ
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 justify-end pt-4">
                  <Link href="/admin/scholars">
                    <Button type="button" variant="outline" disabled={submitting}>
                      إلغاء
                    </Button>
                  </Link>
                  <Button type="submit" variant="gold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 ml-2" />
                        حفظ الشيخ
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
