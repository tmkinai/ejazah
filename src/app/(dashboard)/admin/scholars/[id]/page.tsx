'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Logo } from '@/components/shared/logo'
import { Loader2, ArrowLeft, Save, Award, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { parseRoles } from '@/lib/auth-utils'

interface ScholarProfile {
  id: string
  full_name: string
  full_name_arabic: string
  email: string
  specialization: string
  bio_detailed: string
  is_active: boolean
  total_ijazat_issued: number
  acceptance_rate: number
}

interface Certificate {
  id: string
  certificate_number: string
  ijazah_type: string
  status: string
  issue_date: string
}

export default function ScholarDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scholar, setScholar] = useState<ScholarProfile | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [form, setForm] = useState({ specialization: '', bio_detailed: '' })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status !== 'authenticated') return

    const roles = parseRoles((session?.user as any)?.roles)
    if (!roles.includes('admin')) { router.push('/dashboard'); return }

    async function load() {
      const [scholarRes, certsRes] = await Promise.all([
        fetch(`/api/scholars?id=${id}`),
        fetch(`/api/admin/certificates?scholarId=${id}&limit=20`),
      ])

      if (!scholarRes.ok) { router.push('/admin/scholars'); return }

      const scholarData = await scholarRes.json()
      const s = scholarData.scholar || scholarData
      const merged: ScholarProfile = {
        id: s.id,
        full_name: s.profile?.fullName || s.fullName || '',
        full_name_arabic: s.profile?.fullNameArabic || s.fullNameArabic || '',
        email: s.profile?.email || s.email || '',
        specialization: s.specialization || '',
        bio_detailed: s.bioDetailed || s.bio_detailed || '',
        is_active: s.isActive ?? s.is_active ?? true,
        total_ijazat_issued: s.totalIjazatIssued || s.total_ijazat_issued || 0,
        acceptance_rate: s.acceptanceRate || s.acceptance_rate || 0,
      }
      setScholar(merged)
      setForm({ specialization: merged.specialization, bio_detailed: merged.bio_detailed })

      if (certsRes.ok) {
        const certsData = await certsRes.json()
        setCertificates(Array.isArray(certsData) ? certsData : certsData.certificates || [])
      }

      setLoading(false)
    }
    load()
  }, [id, status])

  const handleSave = async () => {
    if (!scholar) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/scholars?id=${scholar.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialization: form.specialization, bio_detailed: form.bio_detailed }),
    })
    setSaving(false)
    if (!res.ok) { setError('فشل حفظ التعديلات'); return }
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleToggleActive = async () => {
    if (!scholar) return
    const newVal = !scholar.is_active
    const res = await fetch(`/api/scholars?id=${scholar.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newVal }),
    })
    if (res.ok) setScholar({ ...scholar, is_active: newVal })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (!scholar) return null

  const typeLabel: Record<string, string> = { hifz: 'حفظ', qirat: 'قراءة', tajweed: 'تجويد', sanad: 'سند' }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/admin/scholars">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للشيوخ
            </Button>
          </Link>
          <Logo />
        </div>
      </header>

      <main className="container py-10 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">{scholar.full_name_arabic || scholar.full_name}</h1>
            <p className="text-muted-foreground">{scholar.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{scholar.is_active ? 'نشط' : 'غير نشط'}</span>
            <Switch checked={scholar.is_active} onCheckedChange={handleToggleActive} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-primary-50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">الإجازات الصادرة</p>
              <div className="text-3xl font-bold text-primary-900 mt-1">{scholar.total_ijazat_issued}</div>
            </CardContent>
          </Card>
          <Card className="bg-gold-50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">نسبة القبول</p>
              <div className="text-3xl font-bold text-gold-700 mt-1">{scholar.acceptance_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">الحالة</p>
              <Badge className="mt-2" variant={scholar.is_active ? 'default' : 'secondary'}>
                {scholar.is_active ? 'نشط' : 'معطل'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">تعديل معلومات الشيخ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>التخصص</Label>
              <Input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="مثال: قراءات عشر، حفظ وتجويد..."
              />
            </div>
            <div className="space-y-2">
              <Label>السيرة الذاتية التفصيلية</Label>
              <Textarea
                rows={6}
                value={form.bio_detailed}
                onChange={(e) => setForm({ ...form, bio_detailed: e.target.value })}
                placeholder="سيرة الشيخ وإجازاته ومشايخه..."
                className="font-arabic"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {saveSuccess && <p className="text-sm text-green-600">تم الحفظ بنجاح</p>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
              حفظ التعديلات
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Award className="h-5 w-5 text-gold-600" />
              الشهادات الصادرة ({certificates.length})
            </CardTitle>
            <CardDescription>آخر 20 شهادة صادرة من هذا الشيخ</CardDescription>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>لا توجد شهادات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-mono font-semibold text-sm">{cert.certificate_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {typeLabel[cert.ijazah_type] || cert.ijazah_type} — {cert.issue_date}
                      </p>
                    </div>
                    <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                      {cert.status === 'active' ? 'نشطة' : cert.status === 'revoked' ? 'ملغاة' : cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
