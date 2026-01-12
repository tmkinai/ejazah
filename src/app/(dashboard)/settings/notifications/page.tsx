'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, MessageSquare, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface NotificationPreferences {
  email_application_status: boolean
  email_certificate_issued: boolean
  email_review_request: boolean
  email_system_updates: boolean
  inapp_application_status: boolean
  inapp_certificate_issued: boolean
  inapp_review_request: boolean
  inapp_system_updates: boolean
  sms_enabled: boolean
  sms_application_status: boolean
  sms_certificate_issued: boolean
  digest_frequency: 'instant' | 'daily' | 'weekly' | 'never'
}

export default function NotificationSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_application_status: true,
    email_certificate_issued: true,
    email_review_request: true,
    email_system_updates: true,
    inapp_application_status: true,
    inapp_certificate_issued: true,
    inapp_review_request: true,
    inapp_system_updates: true,
    sms_enabled: false,
    sms_application_status: false,
    sms_certificate_issued: true,
    digest_frequency: 'instant',
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        })

      if (error) throw error

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث تفضيلات الإشعارات',
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'خطأ',
        description: 'فشل حفظ التفضيلات',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function updatePreference(key: keyof NotificationPreferences, value: boolean | string) {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-primary-900 mb-2">
            إعدادات الإشعارات
          </h1>
          <p className="text-muted-foreground">
            تخصيص طريقة تلقي الإشعارات والتحديثات
          </p>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Mail className="h-5 w-5 text-primary-700" />
              </div>
              <div>
                <CardTitle>إشعارات البريد الإلكتروني</CardTitle>
                <CardDescription>
                  تلقي الإشعارات عبر البريد الإلكتروني
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_application_status" className="font-semibold">
                  حالة الطلبات
                </Label>
                <p className="text-sm text-muted-foreground">
                  إشعارات عند تحديث حالة طلب الإجازة
                </p>
              </div>
              <Switch
                id="email_application_status"
                checked={preferences.email_application_status}
                onCheckedChange={(checked) =>
                  updatePreference('email_application_status', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_certificate_issued" className="font-semibold">
                  إصدار الشهادات
                </Label>
                <p className="text-sm text-muted-foreground">
                  إشعارات عند إصدار شهادة إجازة جديدة
                </p>
              </div>
              <Switch
                id="email_certificate_issued"
                checked={preferences.email_certificate_issued}
                onCheckedChange={(checked) =>
                  updatePreference('email_certificate_issued', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_review_request" className="font-semibold">
                  طلبات المراجعة
                </Label>
                <p className="text-sm text-muted-foreground">
                  (للمشايخ) إشعارات عند تعيين طلب جديد للمراجعة
                </p>
              </div>
              <Switch
                id="email_review_request"
                checked={preferences.email_review_request}
                onCheckedChange={(checked) =>
                  updatePreference('email_review_request', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_system_updates" className="font-semibold">
                  تحديثات النظام
                </Label>
                <p className="text-sm text-muted-foreground">
                  إشعارات مهمة حول النظام والتحديثات
                </p>
              </div>
              <Switch
                id="email_system_updates"
                checked={preferences.email_system_updates}
                onCheckedChange={(checked) =>
                  updatePreference('email_system_updates', checked)
                }
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="digest_frequency" className="font-semibold mb-2 block">
                تكرار الملخصات
              </Label>
              <select
                id="digest_frequency"
                className="w-full p-2 border border-border rounded-lg bg-white"
                value={preferences.digest_frequency}
                onChange={(e) =>
                  updatePreference('digest_frequency', e.target.value)
                }
              >
                <option value="instant">فوري (عند حدوث كل إشعار)</option>
                <option value="daily">يومي (ملخص مرة واحدة يومياً)</option>
                <option value="weekly">أسبوعي (ملخص مرة واحدة أسبوعياً)</option>
                <option value="never">أبداً (لا ترسل ملخصات)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle>الإشعارات داخل التطبيق</CardTitle>
                <CardDescription>
                  الإشعارات التي تظهر في التطبيق
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inapp_application_status" className="font-semibold">
                  حالة الطلبات
                </Label>
                <p className="text-sm text-muted-foreground">
                  عرض إشعارات حالة الطلبات في التطبيق
                </p>
              </div>
              <Switch
                id="inapp_application_status"
                checked={preferences.inapp_application_status}
                onCheckedChange={(checked) =>
                  updatePreference('inapp_application_status', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inapp_certificate_issued" className="font-semibold">
                  إصدار الشهادات
                </Label>
                <p className="text-sm text-muted-foreground">
                  عرض إشعارات إصدار الشهادات في التطبيق
                </p>
              </div>
              <Switch
                id="inapp_certificate_issued"
                checked={preferences.inapp_certificate_issued}
                onCheckedChange={(checked) =>
                  updatePreference('inapp_certificate_issued', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inapp_review_request" className="font-semibold">
                  طلبات المراجعة
                </Label>
                <p className="text-sm text-muted-foreground">
                  (للمشايخ) عرض طلبات المراجعة في التطبيق
                </p>
              </div>
              <Switch
                id="inapp_review_request"
                checked={preferences.inapp_review_request}
                onCheckedChange={(checked) =>
                  updatePreference('inapp_review_request', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inapp_system_updates" className="font-semibold">
                  تحديثات النظام
                </Label>
                <p className="text-sm text-muted-foreground">
                  عرض تحديثات النظام في التطبيق
                </p>
              </div>
              <Switch
                id="inapp_system_updates"
                checked={preferences.inapp_system_updates}
                onCheckedChange={(checked) =>
                  updatePreference('inapp_system_updates', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications (Optional) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle>إشعارات الرسائل النصية (SMS)</CardTitle>
                <CardDescription>
                  تلقي الإشعارات عبر الرسائل النصية (قريباً)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_enabled" className="font-semibold">
                  تفعيل الرسائل النصية
                </Label>
                <p className="text-sm text-muted-foreground">
                  تفعيل إشعارات الرسائل النصية (متوفر قريباً)
                </p>
              </div>
              <Switch
                id="sms_enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) =>
                  updatePreference('sms_enabled', checked)
                }
                disabled
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="sms_application_status" className="font-semibold">
                  حالة الطلبات
                </Label>
                <p className="text-sm text-muted-foreground">
                  رسالة نصية عند تحديث حالة الطلب
                </p>
              </div>
              <Switch
                id="sms_application_status"
                checked={preferences.sms_application_status}
                disabled
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="sms_certificate_issued" className="font-semibold">
                  إصدار الشهادات
                </Label>
                <p className="text-sm text-muted-foreground">
                  رسالة نصية عند إصدار الشهادة
                </p>
              </div>
              <Switch
                id="sms_certificate_issued"
                checked={preferences.sms_certificate_issued}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={savePreferences}
            disabled={saving}
            size="lg"
            className="flex-1"
          >
            <Save className="h-4 w-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
          <Button
            variant="outline"
            onClick={loadPreferences}
            size="lg"
          >
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  )
}
