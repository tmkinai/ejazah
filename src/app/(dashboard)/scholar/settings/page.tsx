'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Settings as SettingsIcon, AlertCircle, Bell } from 'lucide-react'

export default function ScholarSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({
    email_new_application: true,
    email_application_approved: true,
    inapp_new_application: true,
    profile_public: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load scholar metadata
      const { data: scholarData } = await supabase
        .from('scholars')
        .select('metadata, profile_visibility')
        .eq('id', user.id)
        .single()

      if (scholarData) {
        const metadata = scholarData.metadata || {}
        setSettings({
          email_new_application: metadata.email_new_application ?? true,
          email_application_approved: metadata.email_application_approved ?? true,
          inapp_new_application: metadata.inapp_new_application ?? true,
          profile_public: scholarData.profile_visibility === 'public',
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { email_new_application, email_application_approved, inapp_new_application, profile_public } = settings

      const { error: updateError } = await supabase
        .from('scholars')
        .update({
          metadata: {
            email_new_application,
            email_application_approved,
            inapp_new_application,
          },
          profile_visibility: profile_public ? 'public' : 'private',
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
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
          إعدادات المُجيز
        </h1>
        <p className="text-muted-foreground text-lg">
          قم بتخصيص إعدادات حسابك والإشعارات
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

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary-900" />
            إعدادات الإشعارات
          </CardTitle>
          <CardDescription>
            اختر متى تريد تلقي الإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_new_application" className="text-base font-semibold cursor-pointer">
                إشعار عند طلب جديد
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                تلقي إشعار بالبريد الإلكتروني عند تقديم طلب إجازة جديد
              </p>
            </div>
            <Switch
              id="email_new_application"
              checked={settings.email_new_application}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_new_application: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_application_approved" className="text-base font-semibold cursor-pointer">
                إشعار عند الموافقة على طلب
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                تلقي إشعار عند الموافقة على طلب إجازة
              </p>
            </div>
            <Switch
              id="email_application_approved"
              checked={settings.email_application_approved}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_application_approved: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="inapp_new_application" className="text-base font-semibold cursor-pointer">
                إشعارات داخل التطبيق
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                عرض إشعارات داخل التطبيق للأحداث المهمة
              </p>
            </div>
            <Switch
              id="inapp_new_application"
              checked={settings.inapp_new_application}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, inapp_new_application: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-arabic flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-primary-900" />
            إعدادات الخصوصية
          </CardTitle>
          <CardDescription>
            تحكم في من يمكنه رؤية ملفك الشخصي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <Label htmlFor="profile_public" className="text-base font-semibold cursor-pointer">
                ملف عام
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                السماح للجميع بمشاهدة سيرتك الذاتية وإجازاتك
              </p>
            </div>
            <Switch
              id="profile_public"
              checked={settings.profile_public}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, profile_public: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
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
    </div>
  )
}
