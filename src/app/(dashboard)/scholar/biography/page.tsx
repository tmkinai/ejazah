'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, BookOpen, AlertCircle } from 'lucide-react'

export default function BiographyPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [biography, setBiography] = useState({
    full_name: '',
    title: '',
    specialization: '',
    education_text: '',
    certificates_text: '',
    sanad_image_urls: [] as string[],
    is_public: true,
  })

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (!session) return
    loadBiography()
  }, [session, sessionStatus])

  const loadBiography = async () => {
    try {
      const res = await fetch('/api/biographies')
      if (!res.ok) return
      const data = await res.json()

      if (data) {
        setBiography({
          full_name: data.full_name || data.fullName || '',
          title: data.title || '',
          specialization: data.specialization || '',
          education_text: data.education_text || data.educationText || '',
          certificates_text: data.certificates_text || data.certificatesText || '',
          sanad_image_urls: data.sanad_image_urls || data.sanadImageUrls || [],
          is_public: data.is_public ?? data.isPublic ?? true,
        })
      }
    } catch (error) {
      console.error('Error loading biography:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/biographies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biography),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving biography:', err)
      setError(err.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary-900 mb-2 font-arabic">
          السيرة الذاتية
        </h1>
        <p className="text-muted-foreground text-lg">
          قم بتحديث سيرتك الذاتية ليراها الطلاب
        </p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            تم حفظ التغييرات بنجاح!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Biography Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary-900" />
            معلومات السيرة الذاتية
          </CardTitle>
          <CardDescription>
            املأ المعلومات أدناه لإنشاء سيرتك الذاتية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">الاسم الكامل *</Label>
            <Input
              id="full_name"
              value={biography.full_name}
              onChange={(e) => setBiography({ ...biography, full_name: e.target.value })}
              placeholder="الشيخ محمد بن أحمد"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">اللقب</Label>
            <Input
              id="title"
              value={biography.title}
              onChange={(e) => setBiography({ ...biography, title: e.target.value })}
              placeholder="دكتور، أستاذ، إلخ"
            />
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label htmlFor="specialization">التخصص *</Label>
            <Input
              id="specialization"
              value={biography.specialization}
              onChange={(e) => setBiography({ ...biography, specialization: e.target.value })}
              placeholder="حفظ وتجويد - رواية حفص عن عاصم"
            />
          </div>

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education_text">التعليم والمؤهلات</Label>
            <Textarea
              id="education_text"
              value={biography.education_text}
              onChange={(e) => setBiography({ ...biography, education_text: e.target.value })}
              className="min-h-[120px]"
              placeholder="اذكر مؤهلاتك العلمية والشهادات..."
            />
          </div>

          {/* Certificates */}
          <div className="space-y-2">
            <Label htmlFor="certificates_text">الإجازات والشهادات</Label>
            <Textarea
              id="certificates_text"
              value={biography.certificates_text}
              onChange={(e) => setBiography({ ...biography, certificates_text: e.target.value })}
              className="min-h-[120px]"
              placeholder="اذكر إجازاتك في القرآن الكريم..."
            />
          </div>

          {/* Public Visibility */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="is_public"
              checked={biography.is_public}
              onChange={(e) => setBiography({ ...biography, is_public: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="is_public" className="cursor-pointer">
              إظهار السيرة الذاتية للعامة
            </Label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
