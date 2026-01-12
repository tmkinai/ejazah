'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { createClient } from '@/lib/supabase/client'
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

interface SettingsPanelProps {
  settings: any
  onSettingsUpdate: () => void
}

export default function SettingsPanel({ settings, onSettingsUpdate }: SettingsPanelProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [currentSettings, setCurrentSettings] = useState(settings || {})
  const [isSaving, setIsSaving] = useState(false)
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
    if (settings) {
      setCurrentSettings(settings)
    }
    loadNarrationTypes()
  }, [settings])

  const loadNarrationTypes = async () => {
    const { data } = await supabase
      .from('narration_types')
      .select('*')
      .order('display_order', { ascending: true })

    if (data) {
      setNarrationTypes(data)
    }
  }

  const handleChange = (field: string, value: any) => {
    setCurrentSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('app_settings')
          .update({ ...currentSettings, updated_at: new Date().toISOString() })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert([currentSettings])

        if (error) throw error
      }

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      })
      onSettingsUpdate()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return

    const uploadKey = type === 'signature' ? 'uploadingSignature' 
      : type === 'secondSignature' ? 'uploadingSecondSignature'
      : type === 'font' ? 'uploadingFont'
      : 'uploadingBackground'

    setUploadingState(prev => ({ ...prev, [uploadKey]: true }))

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}_${Date.now()}.${fileExt}`
      const filePath = `settings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      const fieldMap: Record<string, string> = {
        signature: 'signature_image_url',
        secondSignature: 'second_signature_image_url',
        background: 'background_image_url',
        font: 'custom_font_file_url',
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
      const { error } = await supabase
        .from('narration_types')
        .insert([{ ...newNarrationType, active: true }])

      if (error) throw error

      setNewNarrationType({ name: '', parent_reading: '', description: '' })
      await loadNarrationTypes()

      toast({ title: 'تم', description: 'تمت إضافة الراوي بنجاح' })
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
      const { error } = await supabase
        .from('narration_types')
        .update({ active: !active })
        .eq('id', id)

      if (error) throw error
      await loadNarrationTypes()
    } catch (error) {
      console.error('Error toggling narration type:', error)
    }
  }

  const handleResetNarrations = async () => {
    setIsResetting(true)

    try {
      await supabase.from('narration_types').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      const newNarrations = READINGS_HIERARCHY.flatMap((item, readingIndex) =>
        item.narrators.map((narratorName, narratorIndex) => ({
          name: narratorName,
          parent_reading: item.reading,
          active: true,
          display_order: readingIndex * 10 + narratorIndex,
        }))
      )

      const { error } = await supabase.from('narration_types').insert(newNarrations)
      if (error) throw error

      await loadNarrationTypes()
      toast({ title: 'تم', description: 'تم إعادة تعيين قائمة الروايات بنجاح' })
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

  const narrationCategories = [...new Set(narrationTypes.map(t => t.parent_reading).filter(Boolean))]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="narrations">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 bg-amber-100 border border-amber-200">
          <TabsTrigger value="narrations" className="font-arabic text-amber-900 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=inactive]:hover:bg-amber-200">
            <BookOpen className="w-4 h-4 ml-2" />
            روايات
          </TabsTrigger>
          <TabsTrigger value="content" className="font-arabic text-amber-900 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=inactive]:hover:bg-amber-200">
            <FileText className="w-4 h-4 ml-2" />
            محتوى
          </TabsTrigger>
          <TabsTrigger value="design" className="font-arabic text-amber-900 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=inactive]:hover:bg-amber-200">
            <Palette className="w-4 h-4 ml-2" />
            تصميم
          </TabsTrigger>
          <TabsTrigger value="general" className="font-arabic text-amber-900 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=inactive]:hover:bg-amber-200">
            <Settings className="w-4 h-4 ml-2" />
            عام
          </TabsTrigger>
        </TabsList>

        {/* Narrations Tab */}
        <TabsContent value="narrations" className="space-y-4">
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
                  className="font-arabic bg-amber-600 hover:bg-amber-700"
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
                                <div className="font-medium font-arabic">{type.name}</div>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={type.active} 
                                    onCheckedChange={() => handleToggleNarrationType(type.id, type.active)} 
                                  />
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

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">محتوى الشهادة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-arabic">نص ترويسة الشهادة</Label>
                <Input 
                  value={currentSettings.header_text || ''} 
                  onChange={(e) => handleChange('header_text', e.target.value)} 
                  placeholder="إجازة قرآنية" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">عنوان حقل الطالب</Label>
                <Input 
                  value={currentSettings.student_label || ''} 
                  onChange={(e) => handleChange('student_label', e.target.value)} 
                  placeholder="المجــــاز" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">عنوان حقل الإجازة</Label>
                <Input 
                  value={currentSettings.narration_label || ''} 
                  onChange={(e) => handleChange('narration_label', e.target.value)} 
                  placeholder="الإجازة" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">نص توضيحي للإجازة (اختياري)</Label>
                <Input 
                  value={currentSettings.narration_description || ''} 
                  onChange={(e) => handleChange('narration_description', e.target.value)} 
                  placeholder="مثال: بجميع طرقها المتواترة..." 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">المقدمة الافتراضية</Label>
                <Textarea 
                  value={currentSettings.default_introduction || ''} 
                  onChange={(e) => handleChange('default_introduction', e.target.value)} 
                  rows={3}
                  placeholder="بسم الله الرحمن الرحيم..." 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">نص السند الافتراضي</Label>
                <Textarea 
                  value={currentSettings.default_sanad_text || ''} 
                  onChange={(e) => handleChange('default_sanad_text', e.target.value)} 
                  rows={6}
                  placeholder="أجزت الطالب... بالسند المتصل..." 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">مكان الإصدار الافتراضي</Label>
                <Input 
                  value={currentSettings.default_issue_place || ''} 
                  onChange={(e) => handleChange('default_issue_place', e.target.value)} 
                  placeholder="المملكة العربية السعودية" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
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
                      value={currentSettings.primary_color || '#806852'} 
                      onChange={(e) => handleChange('primary_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={currentSettings.primary_color || '#806852'} 
                      onChange={(e) => handleChange('primary_color', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={currentSettings.secondary_color || '#d0aa67'} 
                      onChange={(e) => handleChange('secondary_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={currentSettings.secondary_color || '#d0aa67'} 
                      onChange={(e) => handleChange('secondary_color', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={currentSettings.bg_color || '#ffffff'} 
                      onChange={(e) => handleChange('bg_color', e.target.value)} 
                      className="w-16 p-1 h-10"
                    />
                    <Input 
                      value={currentSettings.bg_color || '#ffffff'} 
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
                  value={currentSettings.font_family || 'IBM Plex Sans Arabic'} 
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

              {currentSettings.font_family === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label className="font-arabic">اسم الخط المخصص</Label>
                    <Input 
                      value={currentSettings.custom_font_name || ''} 
                      onChange={(e) => handleChange('custom_font_name', e.target.value)} 
                      placeholder="اسم الخط المخصص"
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
                      {currentSettings.custom_font_file_url && (
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
                    {currentSettings.custom_font_file_url && (
                      <p className="text-xs text-green-600">
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
                    value={currentSettings.content_font_size || 16} 
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
                  value={currentSettings.background_pattern || 'diamonds'} 
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
                      {Math.round((currentSettings.pattern_opacity || 0.25) * 100)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[(currentSettings.pattern_opacity || 0.25) * 100]}
                  onValueChange={(value) => handleChange('pattern_opacity', value[0] / 100)}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 font-arabic">اضبط مستوى ظهور النمط الأمني في خلفية الشهادة</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentSettings.show_guilloche !== false}
                    onCheckedChange={(checked) => handleChange('show_guilloche', checked)}
                  />
                  <Label className="font-arabic cursor-pointer">إظهار نمط Guilloche في الزوايا</Label>
                </div>
                <Info className="w-4 h-4 text-blue-600" />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">نمط الإطار</Label>
                <Select 
                  value={currentSettings.border_style || 'decorative'} 
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

              <div className="space-y-2">
                <Label className="font-arabic">صورة خلفية مخصصة</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')} 
                  className="hidden" 
                  id="background-upload"
                />
                {currentSettings.background_image_url ? (
                  <div className="relative p-3 border-2 border-green-200 rounded-lg bg-green-50">
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-arabic">
                      ✓ تم الرفع
                    </div>
                    <img 
                      src={currentSettings.background_image_url} 
                      alt="خلفية الشهادة" 
                      className="h-32 w-full object-cover rounded"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 font-arabic" 
                        onClick={() => document.getElementById('background-upload')?.click()} 
                        disabled={uploadingState.uploadingBackground}
                      >
                        {uploadingState.uploadingBackground ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                        تغيير الصورة
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-arabic"
                        onClick={() => handleChange('background_image_url', '')}
                      >
                        <X className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('background-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-arabic">اضغط لرفع صورة الخلفية</p>
                      <p className="text-xs text-gray-400 font-arabic">PNG, JPG - يُنصح بحجم A4</p>
                      {uploadingState.uploadingBackground && (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-amber-600">
                  ⚠️ ملاحظة: صورة الخلفية قد تخفي النمط الأمني. احذفها إذا كنت تريد إظهار النمط فقط.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Layout and Alignment */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">التخطيط والمحاذاة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">محاذاة العنوان</Label>
                  <Select 
                    value={currentSettings.header_align || 'center'} 
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
                    value={currentSettings.content_align || 'justify'} 
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
                  value={currentSettings.student_info_layout || 'inline'} 
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

          {/* Sizes and Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">أحجام ومواضع العناصر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold font-arabic">رمز QR</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">حجم رمز QR</Label>
                      <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300">
                        <span className="text-lg font-bold text-blue-800">{currentSettings.qr_size || 80} بكسل</span>
                      </div>
                    </div>
                    <Slider
                      value={[currentSettings.qr_size || 80]}
                      onValueChange={(value) => handleChange('qr_size', value[0])}
                      min={60}
                      max={150}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-arabic">موضع رمز QR</Label>
                    <Select 
                      value={currentSettings.qr_position || 'left'} 
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
                      <Label className="font-arabic">عرض التوقيع (حد أقصى)</Label>
                      <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg border border-green-300">
                        <span className="text-lg font-bold text-green-800">{currentSettings.signature_size || 360} بكسل</span>
                      </div>
                    </div>
                    <Slider
                      value={[currentSettings.signature_size || 360]}
                      onValueChange={(value) => handleChange('signature_size', value[0])}
                      min={200}
                      max={400}
                      step={20}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">حجم الختم (حد أقصى)</Label>
                      <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-lg border border-purple-300">
                        <span className="text-lg font-bold text-purple-800">{currentSettings.seal_size || 120} بكسل</span>
                      </div>
                    </div>
                    <Slider
                      value={[currentSettings.seal_size || 120]}
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

          {/* Images and Signatures */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">الصور والتوقيعات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-arabic">صورة التوقيع والاسم (المجيز الأول)</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'signature')} 
                  className="hidden" 
                  id="signature-upload"
                />
                {currentSettings.signature_image_url ? (
                  <div className="relative p-3 border-2 border-green-200 rounded-lg bg-green-50">
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-arabic">
                      ✓ تم الرفع
                    </div>
                    <img src={currentSettings.signature_image_url} alt="التوقيع" className="h-24 object-contain mx-auto" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-red-600 hover:bg-red-100"
                      onClick={() => handleChange('signature_image_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mt-2 font-arabic" 
                      onClick={() => document.getElementById('signature-upload')?.click()} 
                      disabled={uploadingState.uploadingSignature}
                    >
                      {uploadingState.uploadingSignature ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                      تغيير الصورة
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('signature-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-arabic">اضغط لرفع صورة التوقيع</p>
                      <p className="text-xs text-gray-400 font-arabic">PNG, JPG أو GIF</p>
                      {uploadingState.uploadingSignature && (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">صورة الختم (يظهر في المنتصف)</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'secondSignature')} 
                  className="hidden" 
                  id="seal-upload"
                />
                {currentSettings.second_signature_image_url ? (
                  <div className="relative p-3 border-2 border-green-200 rounded-lg bg-green-50">
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-arabic">
                      ✓ تم الرفع
                    </div>
                    <img src={currentSettings.second_signature_image_url} alt="الختم" className="h-24 object-contain mx-auto" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-red-600 hover:bg-red-100"
                      onClick={() => handleChange('second_signature_image_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mt-2 font-arabic" 
                      onClick={() => document.getElementById('seal-upload')?.click()} 
                      disabled={uploadingState.uploadingSecondSignature}
                    >
                      {uploadingState.uploadingSecondSignature ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                      تغيير الصورة
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('seal-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-arabic">اضغط لرفع صورة الختم</p>
                      <p className="text-xs text-gray-400 font-arabic">PNG, JPG أو GIF</p>
                      {uploadingState.uploadingSecondSignature && (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">عنوان الختم</Label>
                <Input 
                  value={currentSettings.second_signature_title || ''} 
                  onChange={(e) => handleChange('second_signature_title', e.target.value)} 
                  placeholder="مثال: الختم الرسمي" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">إعدادات عامة للتطبيق</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-arabic">اسم التطبيق (يظهر في الهيدر)</Label>
                <Input 
                  value={currentSettings.app_name || ''} 
                  onChange={(e) => handleChange('app_name', e.target.value)} 
                  placeholder="الإجازات القرآنية" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">معلومات التذييل (تظهر في الفوتر)</Label>
                <Input 
                  value={currentSettings.footer_info || ''} 
                  onChange={(e) => handleChange('footer_info', e.target.value)} 
                  placeholder="أسانيد غازي بن بنيدر العمري" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">مكان الإصدار الافتراضي</Label>
                <Input 
                  value={currentSettings.default_issue_place || ''} 
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
                  checked={currentSettings.show_public_page || false} 
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
                  checked={currentSettings.allow_public_view_details || false} 
                  onCheckedChange={(checked) => handleChange('allow_public_view_details', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={saveSettings} className="w-full font-arabic bg-amber-600 hover:bg-amber-700" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 ml-2" />
            حفظ الإعدادات
          </>
        )}
      </Button>

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
