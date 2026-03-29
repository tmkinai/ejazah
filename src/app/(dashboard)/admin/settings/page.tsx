'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Save, 
  Loader2, 
  Settings, 
  Palette, 
  FileText, 
  BookOpen,
  Upload,
  X,
  Info,
  AlertTriangle,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Font options
const FONT_OPTIONS = [
  { name: 'IBM Plex Sans Arabic', url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap' },
  { name: 'Noto Naskh Arabic', url: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap' },
  { name: 'Amiri', url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap' },
  { name: 'Cairo', url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap' },
  { name: 'Tajawal', url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap' },
  { name: 'Scheherazade New', url: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap' },
]

// Readings hierarchy
const READINGS_HIERARCHY = [
  { reading: 'قراءة نافع', narrators: ['قالون', 'ورش'] },
  { reading: 'قراءة ابن كثير', narrators: ['البزي', 'قنبل'] },
  { reading: 'قراءة أبي عمرو', narrators: ['الدوري عن أبي عمرو', 'السوسي'] },
  { reading: 'قراءة ابن عامر', narrators: ['هشام', 'ابن ذكوان'] },
  { reading: 'قراءة عاصم', narrators: ['شعبة', 'حفص'] },
  { reading: 'قراءة حمزة', narrators: ['خلف عن حمزة', 'خلاد'] },
  { reading: 'قراءة الكسائي', narrators: ['أبو الحارث', 'الدوري عن الكسائي'] },
  { reading: 'قراءة أبي جعفر', narrators: ['ابن وردان', 'ابن جماز'] },
  { reading: 'قراءة يعقوب', narrators: ['رويس', 'روح'] },
  { reading: 'قراءة خلف', narrators: ['إسحاق', 'إدريس'] },
]

const PARENT_READINGS = READINGS_HIERARCHY.map(item => item.reading)

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [narrationTypes, setNarrationTypes] = useState<any[]>([])
  const [uploadingState, setUploadingState] = useState({
    uploadingSignature: false,
    uploadingSecondSignature: false,
    uploadingBackground: false,
    uploadingFont: false,
  })

  // Narration dialogs
  const [newNarrationType, setNewNarrationType] = useState({ name: '', parent_reading: '', description: '' })
  const [editingNarration, setEditingNarration] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingNarrationId, setDeletingNarrationId] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load settings
      const settingsRes = await fetch('/api/admin/settings')
      const settingsResult = await settingsRes.json()

      if (settingsResult.data) {
        setSettings(settingsResult.data)
      } else {
        // Create default settings
        setSettings(getDefaultSettings())
      }

      // Load narration types
      await loadNarrationTypes()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNarrationTypes = async () => {
    try {
      const res = await fetch('/api/admin/settings?section=narrations')
      const result = await res.json()
      if (result.data) {
        setNarrationTypes(result.data)
      }
    } catch (error) {
      console.error('Error loading narration types:', error)
    }
  }

  const getDefaultSettings = () => ({
    app_name: 'نظام الإجازة',
    footer_info: 'أسانيد الإجازات القرآنية',
    default_issue_place: 'المملكة العربية السعودية',
    header_text: 'إجازة قرآنية',
    student_label: 'المجــــاز',
    narration_label: 'الإجازة',
    narration_description: '',
    default_introduction: 'بسم الله الرحمن الرحيم\nالحمد لله رب العالمين والصلاة والسلام على أشرف الأنبياء والمرسلين',
    default_sanad_text: '',
    primary_color: '#1B4332',
    secondary_color: '#B8860B',
    bg_color: '#FFFBF5',
    font_family: 'IBM Plex Sans Arabic',
    font_url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    content_font_size: 16,
    background_pattern: 'diamonds',
    pattern_opacity: 0.35,
    show_guilloche: true,
    border_style: 'simple',
    header_align: 'center',
    content_align: 'center',
    student_info_layout: 'inline',
    qr_size: 80,
    qr_position: 'left',
    signature_size: 280,
    seal_size: 120,
    show_public_page: false,
    allow_public_view_details: false,
  })

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      if (result.data) setSettings(result.data)

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return

    const uploadKey = type === 'signature' ? 'uploadingSignature'
      : type === 'secondSignature' ? 'uploadingSecondSignature'
      : type === 'background' ? 'uploadingBackground'
      : 'uploadingFont'

    setUploadingState(prev => ({ ...prev, [uploadKey]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'settings')
      formData.append('type', type)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      const publicUrl = result.data?.url || result.url

      const fieldMap: Record<string, string> = {
        signature: 'signature_image_url',
        secondSignature: 'second_signature_image_url',
        background: 'background_image_url',
        customFont: 'custom_font_file_url',
      }

      handleChange(fieldMap[type], publicUrl)

      toast({
        title: 'تم الرفع',
        description: 'تم رفع الملف بنجاح',
      })
    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء رفع الملف',
        variant: 'destructive',
      })
    } finally {
      setUploadingState(prev => ({ ...prev, [uploadKey]: false }))
    }
  }

  // Narration type handlers
  const handleAddNarrationType = async () => {
    if (!newNarrationType.name || !newNarrationType.parent_reading) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الراوي واختيار القراءة الأم',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_narration', ...newNarrationType, active: true }),
      })
      if (!res.ok) throw new Error('Failed to add')

      setNewNarrationType({ name: '', parent_reading: '', description: '' })
      await loadNarrationTypes()

      toast({
        title: 'تم',
        description: 'تمت إضافة الراوي بنجاح',
      })
    } catch (error: any) {
      console.error('Error adding narration type:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة الراوي',
        variant: 'destructive',
      })
    }
  }

  const handleToggleNarrationType = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_narration', id, active: !active }),
      })
      if (!res.ok) throw new Error('Failed to toggle')
      await loadNarrationTypes()
    } catch (error) {
      console.error('Error toggling narration type:', error)
    }
  }

  const handleUpdateNarration = async () => {
    if (!editingNarration) return

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_narration',
          id: editingNarration.id,
          name: editingNarration.name,
          parent_reading: editingNarration.parent_reading,
          description: editingNarration.description,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')

      await loadNarrationTypes()
      setIsEditDialogOpen(false)
      setEditingNarration(null)

      toast({
        title: 'تم',
        description: 'تم تعديل الراوي بنجاح',
      })
    } catch (error: any) {
      console.error('Error updating narration:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تعديل الراوي',
        variant: 'destructive',
      })
    }
  }

  const confirmDelete = async () => {
    if (!deletingNarrationId) return

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_narration', id: deletingNarrationId }),
      })
      if (!res.ok) throw new Error('Failed to delete')

      await loadNarrationTypes()
      setDeleteDialogOpen(false)
      setDeletingNarrationId(null)

      toast({
        title: 'تم',
        description: 'تم حذف الراوي بنجاح',
      })
    } catch (error: any) {
      console.error('Error deleting narration:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'فشل حذف الراوي',
        variant: 'destructive',
      })
    }
  }

  const handleResetNarrations = async () => {
    setIsResetting(true)

    try {
      // Create new structured list
      const newNarrations = READINGS_HIERARCHY.flatMap((item, readingIndex) =>
        item.narrators.map((narratorName, narratorIndex) => ({
          name: narratorName,
          parent_reading: item.reading,
          active: true,
          display_order: readingIndex * 10 + narratorIndex,
        }))
      )

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_narrations', narrations: newNarrations }),
      })

      if (!res.ok) throw new Error('Failed to reset')

      if (error) throw error

      await loadNarrationTypes()

      toast({
        title: 'تم',
        description: 'تم إعادة تعيين قائمة الروايات بنجاح',
      })
    } catch (error: any) {
      console.error('Error resetting narrations:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إعادة التعيين',
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
      setResetDialogOpen(false)
    }
  }

  // Get unique categories from narration types
  const narrationCategories = [...new Set(narrationTypes.map(t => t.parent_reading).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-arabic text-amber-900">الإعدادات</h1>
          <p className="text-muted-foreground font-arabic">إعدادات التصميم والمحتوى</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          حفظ الإعدادات
        </Button>
      </div>

      <Tabs defaultValue="narrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-amber-50">
          <TabsTrigger value="narrations" className="font-arabic data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 ml-2" />
            روايات
          </TabsTrigger>
          <TabsTrigger value="content" className="font-arabic data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 ml-2" />
            محتوى
          </TabsTrigger>
          <TabsTrigger value="design" className="font-arabic data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Palette className="w-4 h-4 ml-2" />
            تصميم
          </TabsTrigger>
          <TabsTrigger value="general" className="font-arabic data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 ml-2" />
            عام
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">إعدادات عامة للتطبيق</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-arabic">اسم التطبيق (يظهر في الهيدر)</Label>
                <Input 
                  value={settings.app_name || ''} 
                  onChange={(e) => handleChange('app_name', e.target.value)} 
                  placeholder="اسم التطبيق" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">معلومات التذييل (تظهر في الفوتر)</Label>
                <Input 
                  value={settings.footer_info || ''} 
                  onChange={(e) => handleChange('footer_info', e.target.value)} 
                  placeholder="معلومات التذييل" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">مكان الإصدار الافتراضي</Label>
                <Input 
                  value={settings.default_issue_place || ''} 
                  onChange={(e) => handleChange('default_issue_place', e.target.value)} 
                  placeholder="مثال: المملكة العربية السعودية" 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base font-arabic">صفحة سجل الإجازات</Label>
                  <p className="text-sm text-muted-foreground font-arabic">
                    تفعيل أو إلغاء تفعيل عرض صفحة الإجازات المنشورة للعامة.
                  </p>
                </div>
                <Switch 
                  checked={settings.show_public_page || false} 
                  onCheckedChange={(checked) => handleChange('show_public_page', checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base font-arabic">عرض تفاصيل الإجازة للعامة</Label>
                  <p className="text-sm text-muted-foreground font-arabic">
                    السماح للزوار بالضغط على "عرض التفاصيل" في صفحة سجل الإجازات.
                  </p>
                </div>
                <Switch 
                  checked={settings.allow_public_view_details || false} 
                  onCheckedChange={(checked) => handleChange('allow_public_view_details', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">محتوى الشهادة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-arabic">نص ترويسة الشهادة</Label>
                <Input 
                  value={settings.header_text || ''} 
                  onChange={(e) => handleChange('header_text', e.target.value)} 
                  placeholder="إجازة قرآنية" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">عنوان حقل الطالب</Label>
                <Input 
                  value={settings.student_label || ''} 
                  onChange={(e) => handleChange('student_label', e.target.value)} 
                  placeholder="المجــــاز" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">عنوان حقل الإجازة</Label>
                <Input 
                  value={settings.narration_label || ''} 
                  onChange={(e) => handleChange('narration_label', e.target.value)} 
                  placeholder="الإجازة" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">نص توضيحي للإجازة (اختياري)</Label>
                <Input 
                  value={settings.narration_description || ''} 
                  onChange={(e) => handleChange('narration_description', e.target.value)} 
                  placeholder="مثال: بجميع طرقها المتواترة..." 
                />
                <p className="text-xs text-muted-foreground font-arabic">
                  💡 سيظهر هذا النص أسفل اسم الرواية كتوضيح إضافي.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">المقدمة الافتراضية</Label>
                <Textarea 
                  value={settings.default_introduction || ''} 
                  onChange={(e) => handleChange('default_introduction', e.target.value)} 
                  rows={3}
                  placeholder="بسم الله الرحمن الرحيم..." 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">نص السند الافتراضي</Label>
                <Textarea 
                  value={settings.default_sanad_text || ''} 
                  onChange={(e) => handleChange('default_sanad_text', e.target.value)} 
                  rows={8}
                  placeholder="أجزت الطالب... بالسند المتصل..." 
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold font-arabic">قوالب النصوص</h4>
                <p className="text-sm text-muted-foreground font-arabic">
                  يمكنك استخدام المتغيرات التالية في القوالب: {'{student_name}'}, {'{narration}'}, {'{issue_date}'}, {'{issue_place}'}, {'{hijri_date}'}
                </p>
                
                <div className="space-y-2">
                  <Label className="font-arabic">قالب النص المختصر</Label>
                  <Textarea 
                    value={settings.template_short || ''} 
                    onChange={(e) => handleChange('template_short', e.target.value)} 
                    rows={4}
                    placeholder="أجيز {student_name} برواية {narration} بتاريخ {issue_date}" 
                  />
                  <p className="text-xs text-muted-foreground font-arabic">
                    💡 يُستخدم هذا القالب للإجازات المختصرة أو عند طباعة شهادات مبسطة.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-arabic">قالب النص المفصل</Label>
                  <Textarea 
                    value={settings.template_detailed || ''} 
                    onChange={(e) => handleChange('template_detailed', e.target.value)} 
                    rows={8}
                    placeholder="الحمد لله رب العالمين... أجيز الأخ/الأخت {student_name} برواية {narration} بعد أن قرأ علي القرآن الكريم كاملاً..." 
                  />
                  <p className="text-xs text-muted-foreground font-arabic">
                    💡 يُستخدم هذا القالب للإجازات التفصيلية مع ذكر السند كاملاً.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Settings Tab */}
        <TabsContent value="design" className="space-y-6">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">الألوان</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-arabic">اللون الرئيسي</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={settings.primary_color || '#1B4332'} 
                      onChange={(e) => handleChange('primary_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={settings.primary_color || '#1B4332'} 
                      onChange={(e) => handleChange('primary_color', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={settings.secondary_color || '#B8860B'} 
                      onChange={(e) => handleChange('secondary_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={settings.secondary_color || '#B8860B'} 
                      onChange={(e) => handleChange('secondary_color', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={settings.bg_color || '#FFFBF5'} 
                      onChange={(e) => handleChange('bg_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={settings.bg_color || '#FFFBF5'} 
                      onChange={(e) => handleChange('bg_color', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fonts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">الخطوط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-arabic">نوع الخط</Label>
                <Select 
                  value={settings.font_family || 'IBM Plex Sans Arabic'} 
                  onValueChange={(value) => {
                    const selectedFont = FONT_OPTIONS.find(f => f.name === value)
                    if (selectedFont) {
                      handleChange('font_family', selectedFont.name)
                      handleChange('font_url', selectedFont.url)
                    } else if (value === 'custom') {
                      handleChange('font_family', 'custom')
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="اختر نوع الخط" /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.name} value={font.name}>{font.name}</SelectItem>
                    ))}
                    <SelectItem value="custom">خط مخصص (ملف خاص)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.font_family === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label className="font-arabic">اسم الخط المخصص</Label>
                    <Input 
                      value={settings.custom_font_name || ''} 
                      onChange={(e) => handleChange('custom_font_name', e.target.value)} 
                      placeholder="اسم الخط المخصص"
                      className="font-ui"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-arabic">رفع ملف الخط المخصص</Label>
                    <input 
                      type="file" 
                      accept=".ttf,.otf,.woff,.woff2" 
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'font')} 
                      className="hidden" 
                      id="font-upload"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 font-arabic" 
                        onClick={() => document.getElementById('font-upload')?.click()} 
                        disabled={uploadingState.uploadingFont}
                      >
                        {uploadingState.uploadingFont ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Upload className="w-4 h-4 ml-2" />
                        )}
                        رفع ملف الخط (.ttf, .otf, .woff)
                      </Button>
                      {settings.custom_font_file_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleChange('custom_font_file_url', '')
                            handleChange('custom_font_name', '')
                          }}
                          title="مسح الملف"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {settings.custom_font_file_url && (
                      <p className="text-xs text-green-600 font-ui">
                        ✓ تم رفع ملف الخط بنجاح
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="font-arabic">حجم الخط (محتوى الشهادة)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    min="12" 
                    max="50" 
                    value={settings.content_font_size || 16} 
                    onChange={(e) => handleChange('content_font_size', parseInt(e.target.value) || 16)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground font-arabic">
                    بكسل (الافتراضي: 16، الحد الأقصى: 50)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">نمط الخلفية الأمني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-arabic">اختر النمط</Label>
                <Select 
                  value={settings.background_pattern || 'diamonds'} 
                  onValueChange={(value) => handleChange('background_pattern', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diamonds">معينات ومثلثات (افتراضي)</SelectItem>
                    <SelectItem value="geometric">أشكال هندسية متقدمة</SelectItem>
                    <SelectItem value="islamic">نمط إسلامي</SelectItem>
                    <SelectItem value="waves">موجات وخطوط</SelectItem>
                    <SelectItem value="dots">نقاط منقطة</SelectItem>
                    <SelectItem value="lines">خطوط متقاطعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-arabic">شفافية النمط</Label>
                  <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                    <span className="text-lg font-bold text-amber-800">
                      {Math.round((settings.pattern_opacity || 0.35) * 100)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[(settings.pattern_opacity || 0.35) * 100]}
                  onValueChange={(value) => handleChange('pattern_opacity', value[0] / 100)}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.show_guilloche !== false}
                    onCheckedChange={(checked) => handleChange('show_guilloche', checked)}
                  />
                  <Label className="font-arabic cursor-pointer">إظهار نمط Guilloche في الزوايا</Label>
                </div>
                <Info className="w-4 h-4 text-blue-600" />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">نمط الإطار</Label>
                <Select 
                  value={settings.border_style || 'simple'} 
                  onValueChange={(value) => handleChange('border_style', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">بسيط</SelectItem>
                    <SelectItem value="double">مزدوج</SelectItem>
                    <SelectItem value="decorative">زخرفي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">التخطيط والمحاذاة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">محاذاة العنوان</Label>
                  <Select 
                    value={settings.header_align || 'center'} 
                    onValueChange={(value) => handleChange('header_align', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="right">يمين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-arabic">محاذاة النص</Label>
                  <Select 
                    value={settings.content_align || 'center'} 
                    onValueChange={(value) => handleChange('content_align', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="right">يمين</SelectItem>
                      <SelectItem value="justify">ضبط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">تخطيط معلومات الطالب</Label>
                <Select 
                  value={settings.student_info_layout || 'inline'} 
                  onValueChange={(value) => handleChange('student_info_layout', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">صف واحد (افتراضي)</SelectItem>
                    <SelectItem value="stacked">مكدس (سطور منفصلة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">أحجام ومواضع العناصر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold font-arabic">رمز QR</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">حجم رمز QR</Label>
                      <span className="text-lg font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                        {settings.qr_size || 80} بكسل
                      </span>
                    </div>
                    <Slider
                      value={[settings.qr_size || 80]}
                      onValueChange={(value) => handleChange('qr_size', value[0])}
                      min={60}
                      max={150}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-arabic">موضع رمز QR</Label>
                    <Select 
                      value={settings.qr_position || 'left'} 
                      onValueChange={(value) => handleChange('qr_position', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">يسار (افتراضي)</SelectItem>
                        <SelectItem value="center">وسط</SelectItem>
                        <SelectItem value="right">يمين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold font-arabic">التوقيع والختم</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">عرض التوقيع</Label>
                      <span className="text-lg font-bold text-green-800 bg-green-100 px-3 py-1 rounded-lg">
                        {settings.signature_size || 280} بكسل
                      </span>
                    </div>
                    <Slider
                      value={[settings.signature_size || 280]}
                      onValueChange={(value) => handleChange('signature_size', value[0])}
                      min={200}
                      max={400}
                      step={20}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">حجم الختم</Label>
                      <span className="text-lg font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-lg">
                        {settings.seal_size || 120} بكسل
                      </span>
                    </div>
                    <Slider
                      value={[settings.seal_size || 120]}
                      onValueChange={(value) => handleChange('seal_size', value[0])}
                      min={80}
                      max={180}
                      step={10}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">الصور والتوقيعات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-arabic">صورة التوقيع والاسم</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'signature')} 
                  className="hidden" 
                  id="signature-upload"
                />
                <Button 
                  variant="outline" 
                  className="w-full font-arabic" 
                  onClick={() => document.getElementById('signature-upload')?.click()} 
                  disabled={uploadingState.uploadingSignature}
                >
                  {uploadingState.uploadingSignature ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Upload className="w-4 h-4 ml-2" />
                  )}
                  رفع صورة التوقيع والاسم
                </Button>
                {settings.signature_image_url && (
                  <div className="relative p-2 border rounded">
                    <img src={settings.signature_image_url} alt="التوقيع" className="h-24 object-contain mx-auto" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 text-red-600 hover:text-red-700"
                      onClick={() => handleChange('signature_image_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">صورة الختم</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'secondSignature')} 
                  className="hidden" 
                  id="seal-upload"
                />
                <Button 
                  variant="outline" 
                  className="w-full font-arabic" 
                  onClick={() => document.getElementById('seal-upload')?.click()} 
                  disabled={uploadingState.uploadingSecondSignature}
                >
                  {uploadingState.uploadingSecondSignature ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Upload className="w-4 h-4 ml-2" />
                  )}
                  رفع صورة الختم
                </Button>
                {settings.second_signature_image_url && (
                  <div className="relative p-2 border rounded">
                    <img src={settings.second_signature_image_url} alt="الختم" className="h-24 object-contain mx-auto" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 text-red-600 hover:text-red-700"
                      onClick={() => handleChange('second_signature_image_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">اسم المُجيز (التوقيع الأول)</Label>
                <Input 
                  value={settings.first_signature_name || ''} 
                  onChange={(e) => handleChange('first_signature_name', e.target.value)} 
                  placeholder="مثال: غازي بن بنيدر العمري" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">عنوان التوقيع الثاني / الختم</Label>
                <Input 
                  value={settings.second_signature_title || ''} 
                  onChange={(e) => handleChange('second_signature_title', e.target.value)} 
                  placeholder="مثال: الختم الرسمي" 
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-arabic">صورة خلفية مخصصة</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')} 
                  className="hidden" 
                  id="background-upload"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 font-arabic" 
                    onClick={() => document.getElementById('background-upload')?.click()} 
                    disabled={uploadingState.uploadingBackground}
                  >
                    {uploadingState.uploadingBackground ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Upload className="w-4 h-4 ml-2" />
                    )}
                    رفع صورة خلفية
                  </Button>
                  {settings.background_image_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleChange('background_image_url', '')}
                      title="حذف صورة الخلفية"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {settings.background_image_url && (
                  <div className="relative p-2 border rounded">
                    <img 
                      src={settings.background_image_url} 
                      alt="خلفية الشهادة" 
                      className="h-24 w-full object-cover rounded"
                    />
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      ✓ تم الرفع
                    </div>
                  </div>
                )}
                <p className="text-xs text-amber-600 font-ui">
                  ⚠️ ملاحظة: صورة الخلفية قد تخفي النمط الأمني. احذفها إذا كنت تريد إظهار النمط فقط.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Narrations Tab */}
        <TabsContent value="narrations">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">إدارة القراءات والروايات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reset Button */}
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold font-arabic flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  إعادة تعيين القائمة
                </h3>
                <p className="text-sm text-yellow-800 mt-2 font-arabic">
                  استخدم هذا الخيار لمسح القائمة الحالية وإنشاء قائمة جديدة ومنظمة للقراء العشرة ورواتهم العشرين.
                </p>
                <Button 
                  variant="destructive" 
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 font-arabic" 
                  onClick={() => setResetDialogOpen(true)}
                >
                  إعادة تعيين قائمة الروايات
                </Button>
              </div>

              {/* Add New */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold font-arabic">إضافة راوٍ جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-arabic">القراءة الأم</Label>
                    <Select 
                      value={newNarrationType.parent_reading} 
                      onValueChange={(value) => setNewNarrationType({ ...newNarrationType, parent_reading: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="اختر القراءة" /></SelectTrigger>
                      <SelectContent>
                        {PARENT_READINGS.map((reading) => (
                          <SelectItem key={reading} value={reading}>{reading}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-arabic">اسم الراوي</Label>
                    <Input 
                      value={newNarrationType.name} 
                      onChange={(e) => setNewNarrationType({ ...newNarrationType, name: e.target.value })} 
                      placeholder="مثال: ورش" 
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddNarrationType} 
                  disabled={!newNarrationType.name || !newNarrationType.parent_reading}
                  className="font-arabic"
                >
                  إضافة الراوي
                </Button>
              </div>

              {/* List */}
              <div className="border rounded-md">
                <div className="p-3 bg-muted font-medium border-b font-arabic">القائمة الحالية</div>
                <ScrollArea className="h-72">
                  {narrationCategories.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground font-arabic">
                      لا توجد روايات. اضغط على "إعادة تعيين" لإنشاء القائمة الافتراضية.
                    </div>
                  ) : (
                    narrationCategories.map(reading => (
                      <div key={reading} className="border-b last:border-0">
                        <div className="p-3 bg-gray-50 font-bold font-arabic">{reading}</div>
                        <div className="p-3 space-y-2">
                          {narrationTypes
                            .filter(type => type.parent_reading === reading)
                            .map((type) => (
                              <div key={type.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                  <div className="font-medium font-arabic">{type.name}</div>
                                  {type.description && (
                                    <div className="text-sm text-gray-500 font-arabic">{type.description}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={type.active} 
                                    onCheckedChange={() => handleToggleNarrationType(type.id, type.active)} 
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      setEditingNarration(type)
                                      setIsEditDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      setDeletingNarrationId(type.id)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل الراوي</DialogTitle>
          </DialogHeader>
          {editingNarration && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="font-arabic">القراءة الأم</Label>
                <Select 
                  value={editingNarration.parent_reading} 
                  onValueChange={(value) => setEditingNarration({ ...editingNarration, parent_reading: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PARENT_READINGS.map((reading) => (
                      <SelectItem key={reading} value={reading}>{reading}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-arabic">اسم الراوي</Label>
                <Input 
                  value={editingNarration.name} 
                  onChange={(e) => setEditingNarration({ ...editingNarration, name: e.target.value })} 
                />
              </div>
              <div>
                <Label className="font-arabic">وصف مختصر</Label>
                <Input 
                  value={editingNarration.description || ''} 
                  onChange={(e) => setEditingNarration({ ...editingNarration, description: e.target.value })} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">إلغاء</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpdateNarration}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الرواية؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Alert Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إعادة التعيين</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إعادة تعيين قائمة الروايات؟ سيتم حذف جميع الروايات الحالية وإنشاء قائمة جديدة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetNarrations} 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isResetting}
            >
              {isResetting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
              نعم، قم بإعادة التعيين
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
