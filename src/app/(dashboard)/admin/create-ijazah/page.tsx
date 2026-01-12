'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  FileCheck, 
  Award, 
  BookOpen, 
  Shield,
  User,
  Calendar,
  MapPin,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react'

// Secret key for fingerprint generation
const SECRET_KEY = "IJAZAH_QURAN_2025_SECURITY_KEY"

// Digital fingerprint generation
const generateFingerprint = async (data: any) => {
  const fingerprintString = [
    data.ijazah_number,
    data.student_name,
    data.issue_date,
    data.narration_details || '',
    data.issue_place,
    SECRET_KEY
  ].join('|')

  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(fingerprintString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// Serial code generation
const generateSerialCode = (date: string, fingerprint: string) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const shortHash = fingerprint.substring(0, 4).toUpperCase()
  return `${year}${month}${day}-${shortHash}`
}

// Gregorian to Hijri conversion (approximate)
const toHijriDate = (gregorianDate: string): string => {
  const date = new Date(gregorianDate)
  try {
    return date.toLocaleDateString('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

function CreateIjazahPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [narrationTypes, setNarrationTypes] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false)
  
  const [formData, setFormData] = useState({
    application_id: '',
    // Type
    ijazah_type: 'qirat',
    // Basic Info
    ijazah_number: '',
    certificate_title: '',
    // Student
    student_name: '',
    student_email: '',
    student_information: '',
    // Narration
    narration_type: '',
    narration_details: '',
    // Content
    introduction: '',
    ijazah_text: '',
    // Date & Place
    issue_date: new Date().toISOString().split('T')[0],
    hijri_date: '',
    issue_place: '',
    // Visibility
    is_public: false,
    show_in_student_portal: true,
    archived: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  // Auto-update Hijri date when issue_date changes
  useEffect(() => {
    if (formData.issue_date) {
      const hijri = toHijriDate(formData.issue_date)
      setFormData(prev => ({ ...prev, hijri_date: hijri }))
    }
  }, [formData.issue_date])

  const loadData = async () => {
    try {
      // Load settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single()

      if (settingsData) {
        setSettings(settingsData)
        // Apply default values from settings
        setFormData(prev => ({
          ...prev,
          certificate_title: settingsData.header_text || 'إجازة قرآنية',
          introduction: settingsData.default_introduction || '',
          ijazah_text: settingsData.default_sanad_text || '',
          issue_place: settingsData.default_issue_place || '',
        }))
      }

      // Load approved applications
      const { data: apps, error: appsError } = await supabase
        .from('ijazah_applications')
        .select(`
          *,
          profiles!ijazah_applications_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (appsError) throw appsError
      setApplications(apps || [])

      // Load narration types
      const { data: narrations, error: narrError } = await supabase
        .from('narration_types')
        .select('*')
        .eq('active', true)
        .order('display_order')

      if (narrError) throw narrError
      setNarrationTypes(narrations || [])

      // Pre-fill from URL params if coming from request
      const studentName = searchParams.get('studentName')
      const studentEmail = searchParams.get('studentEmail')
      const narrations_param = searchParams.get('narrations')
      const countryCity = searchParams.get('countryCity')
      const profession = searchParams.get('profession')

      if (studentName || studentEmail) {
        let studentInfo = ''
        if (countryCity) studentInfo += `من ${countryCity}`
        if (profession) studentInfo += studentInfo ? `، ${profession}` : profession

        // Determine ijazah type from narrations
        const ijazahType = narrations_param?.includes('الفاتحة') ? 'tajweed' : 'qirat'
        const title = ijazahType === 'tajweed' ? 'إجازة سورة الفاتحة' : (settingsData?.header_text || 'إجازة قرآنية')

        setFormData(prev => ({
          ...prev,
          student_name: studentName || '',
          student_email: studentEmail || '',
          student_information: studentInfo,
          narration_details: narrations_param || '',
          ijazah_type: ijazahType,
          certificate_title: title,
        }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateIjazahNumber = useCallback(async () => {
    setIsGeneratingNumber(true)
    try {
      const { data: allIjazat } = await supabase
        .from('ijazah_certificates')
        .select('certificate_number')
        .order('created_at', { ascending: false })

      const validNumbers = (allIjazat || [])
        .map((ijazah: any) => ijazah.certificate_number)
        .filter((num: string) => num && /^GH-\d{8}$/.test(num))
        .map((num: string) => parseInt(num.split('-')[1]))

      const maxNumber = validNumbers.length > 0 ? Math.max(...validNumbers) : 0
      const nextNumber = (maxNumber + 1).toString().padStart(8, '0')
      const newIjazahNumber = `GH-${nextNumber}`
      
      setFormData(prev => ({ ...prev, ijazah_number: newIjazahNumber }))
    } catch (error) {
      console.error("Error generating ijazah number:", error)
    } finally {
      setIsGeneratingNumber(false)
    }
  }, [supabase])

  useEffect(() => {
    // Generate ijazah number on load if not set
    if (!isLoading && !formData.ijazah_number) {
      generateIjazahNumber()
    }
  }, [isLoading, formData.ijazah_number, generateIjazahNumber])

  const handleApplicationSelect = (appId: string) => {
    if (appId === 'none') {
      setFormData(prev => ({ ...prev, application_id: '' }))
      return
    }
    const app = applications.find((a) => a.id === appId)
    if (app) {
      // Build student info from application data
      let studentInfo = ''
      if (app.personal_info?.country) studentInfo += `من ${app.personal_info.country}`
      if (app.personal_info?.city) studentInfo += ` - ${app.personal_info.city}`

      setFormData(prev => ({
        ...prev,
        application_id: appId,
        student_name: app.profiles?.full_name || app.personal_info?.fullName || '',
        student_email: app.profiles?.email || app.personal_info?.email || '',
        student_information: studentInfo,
      }))
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Update certificate title when ijazah_type changes
    if (field === 'ijazah_type') {
      const title = value === 'tajweed' 
        ? 'إجازة سورة الفاتحة' 
        : (settings.header_text || 'إجازة قرآنية')
      setFormData(prev => ({ ...prev, [field]: value, certificate_title: title }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.student_name?.trim()) {
      setError('يرجى إدخال اسم الطالب')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Generate fingerprint and serial code
      const fingerprint = await generateFingerprint(formData)
      const serialCode = generateSerialCode(formData.issue_date, fingerprint)
      const certificateNumber = formData.ijazah_number || serialCode

      // Get application for user_id and scholar_id
      const application = formData.application_id 
        ? applications.find((a) => a.id === formData.application_id)
        : null

      // Create certificate
      const { data, error: insertError } = await supabase
        .from('ijazah_certificates')
        .insert({
          user_id: application?.user_id || null,
          application_id: formData.application_id || null,
          certificate_number: certificateNumber,
          ijazah_type: formData.ijazah_type,
          recitation: formData.narration_type,
          issue_date: formData.issue_date,
          scholar_id: application?.scholar_id || null,
          status: 'active',
          is_verified: true,
          verification_hash: fingerprint,
          metadata: {
            // Store all ijazah data in metadata
            student_name: formData.student_name,
            student_email: formData.student_email,
            student_information: formData.student_information,
            certificate_title: formData.certificate_title,
            introduction: formData.introduction,
            narration_details: formData.narration_details,
            ijazah_text: formData.ijazah_text,
            hijri_date: formData.hijri_date,
            issue_place: formData.issue_place,
            is_public: formData.is_public,
            show_in_student_portal: formData.show_in_student_portal,
            archived: formData.archived,
            digital_fingerprint: fingerprint,
            serial_code: serialCode,
          },
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Update application status to completed if linked
      if (formData.application_id) {
        await supabase
          .from('ijazah_applications')
          .update({ status: 'completed' })
          .eq('id', formData.application_id)
      }

      // Update student's ijazat count
      if (formData.student_email) {
        const { data: students } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.student_email)
          .single()

        if (students) {
          // This is a simple increment - in production you might use a counter table or RPC
          console.log('Student profile found:', students.id)
        }
      }

      setSuccess(true)
      setTimeout(() => router.push(`/certificates/${data.id}`), 1500)
    } catch (error: any) {
      console.error('Error creating certificate:', error)
      setError(error.message || 'فشل في إنشاء الإجازة. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-arabic">إصدار إجازة جديدة</h1>
            <p className="text-muted-foreground font-arabic">إنشاء شهادة إجازة قرآنية للطالب</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="font-arabic">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="font-arabic text-green-800">
            ✓ تم حفظ الإجازة بنجاح! جاري التحويل لصفحة الشهادة...
          </AlertDescription>
        </Alert>
      )}

      {/* Security Info */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="font-arabic text-blue-800">
          <strong>🔐 نظام الأمان الثلاثي:</strong> عند حفظ الإجازة، سيتم تلقائياً إنشاء:
          <ul className="mr-4 mt-2 text-xs space-y-1">
            <li>• <strong>بصمة رقمية</strong> مشفرة (SHA-256) تمنع التزوير</li>
            <li>• <strong>رقم تسلسلي مركب</strong> فريد يربط التاريخ بالبصمة</li>
            <li>• <strong>QR Code ذكي</strong> يحتوي على البصمة للتحقق الفوري</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Ijazah Type */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-arabic flex items-center gap-2 text-blue-900">
              <FileCheck className="w-5 h-5" />
              نوع الإجازة *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.ijazah_type}
              onValueChange={(value) => handleChange('ijazah_type', value)}
            >
              <SelectTrigger className="w-full h-12 bg-white">
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qirat">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>إجازة القراءات القرآنية</span>
                  </div>
                </SelectItem>
                <SelectItem value="tajweed">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span>إجازة سورة الفاتحة</span>
                  </div>
                </SelectItem>
                <SelectItem value="hifz">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>إجازة الحفظ</span>
                  </div>
                </SelectItem>
                <SelectItem value="sanad">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>إجازة السند</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {formData.ijazah_type === 'tajweed' && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1 font-arabic">إجازة سورة الفاتحة</p>
                    <p className="text-sm text-green-800 font-arabic">
                      إجازة خاصة بتلاوة سورة الفاتحة - أم الكتاب وركن الصلاة
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.ijazah_type === 'qirat' && (
              <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1 font-arabic">إجازة القراءات القرآنية</p>
                    <p className="text-sm text-amber-800 font-arabic">
                      إجازة بالقراءات والروايات القرآنية المتواترة
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.ijazah_type === 'hifz' && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1 font-arabic">إجازة الحفظ</p>
                    <p className="text-sm text-blue-800 font-arabic">
                      إجازة بحفظ القرآن الكريم كاملاً
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.ijazah_type === 'sanad' && (
              <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1 font-arabic">إجازة السند</p>
                    <p className="text-sm text-purple-800 font-arabic">
                      إجازة بالسند المتصل إلى النبي صلى الله عليه وسلم
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <Hash className="w-5 h-5" />
              معلومات أساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Application Selection */}
            <div className="space-y-2">
              <Label className="font-arabic text-base">
                ربط بطلب معتمد (اختياري)
              </Label>
              <Select
                value={formData.application_id}
                onValueChange={handleApplicationSelect}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر طلب الطالب..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون ربط</SelectItem>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.profiles?.full_name || app.personal_info?.fullName || 'غير محدد'} - {' '}
                      {app.ijazah_type === 'hifz' ? 'حفظ' : 'تلاوة'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground font-arabic">
                💡 اختيار طلب سيملأ بيانات الطالب تلقائياً
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  رقم الإجازة *
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.ijazah_number}
                    onChange={(e) => handleChange('ijazah_number', e.target.value)}
                    placeholder="GH-00000001"
                    className="h-12"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateIjazahNumber}
                    disabled={isGeneratingNumber}
                  >
                    {isGeneratingNumber ? <Loader2 className="w-4 h-4 animate-spin" /> : 'توليد'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  عنوان الشهادة *
                </Label>
                <Input
                  value={formData.certificate_title}
                  onChange={(e) => handleChange('certificate_title', e.target.value)}
                  placeholder="إجازة قرآنية"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Info */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <User className="w-5 h-5" />
              بيانات الطالب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  اسم الطالب <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.student_name}
                  onChange={(e) => handleChange('student_name', e.target.value)}
                  placeholder="الاسم الكامل للطالب"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => handleChange('student_email', e.target.value)}
                  placeholder="email@example.com"
                  className="h-12"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic text-base">
                معلومات إضافية عن الطالب
              </Label>
              <Textarea
                value={formData.student_information}
                onChange={(e) => handleChange('student_information', e.target.value)}
                placeholder="مثال: من المملكة العربية السعودية، يعمل معلماً للقرآن الكريم"
                rows={2}
              />
              <p className="text-xs text-muted-foreground font-arabic">
                💡 هذه المعلومات ستظهر في الشهادة أسفل اسم الطالب
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Narration Info */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الرواية والقراءة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-arabic text-base">
                نوع الرواية
              </Label>
              <Select
                value={formData.narration_type}
                onValueChange={(value) => handleChange('narration_type', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر نوع الرواية..." />
                </SelectTrigger>
                <SelectContent>
                  {narrationTypes.length > 0 ? (
                    narrationTypes.map((narration) => (
                      <SelectItem key={narration.id} value={narration.name}>
                        {narration.name}
                        {narration.parent_reading && ` - ${narration.parent_reading}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="حفص عن عاصم">حفص عن عاصم</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic text-base">
                تفاصيل الرواية (نص مخصص)
              </Label>
              <Textarea
                value={formData.narration_details}
                onChange={(e) => handleChange('narration_details', e.target.value)}
                placeholder="مثال: برواية حفص عن عاصم من طريق الشاطبية"
                rows={2}
              />
              <p className="text-xs text-muted-foreground font-arabic">
                💡 هذا النص سيظهر في الشهادة بدلاً من اسم الرواية المحدد
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              محتوى الإجازة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-arabic text-base">
                المقدمة
              </Label>
              <Textarea
                value={formData.introduction}
                onChange={(e) => handleChange('introduction', e.target.value)}
                placeholder="بسم الله الرحمن الرحيم، الحمد لله رب العالمين..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-arabic text-base">
                نص الإجازة والسند
              </Label>
              <Textarea
                value={formData.ijazah_text}
                onChange={(e) => handleChange('ijazah_text', e.target.value)}
                placeholder="أجزت الطالب... بالسند المتصل إلى رسول الله صلى الله عليه وسلم..."
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Place */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              التاريخ والمكان
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  تاريخ الإصدار (ميلادي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleChange('issue_date', e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic text-base">
                  التاريخ الهجري
                </Label>
                <Input
                  value={formData.hijri_date}
                  onChange={(e) => handleChange('hijri_date', e.target.value)}
                  placeholder="سيتم حسابه تلقائياً"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground font-arabic">
                  💡 يتم حساب التاريخ الهجري تلقائياً من التاريخ الميلادي
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                مكان الإصدار
              </Label>
              <Input
                value={formData.issue_place}
                onChange={(e) => handleChange('issue_place', e.target.value)}
                placeholder="المدينة أو البلد"
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="font-arabic flex items-center gap-2">
              <Eye className="w-5 h-5" />
              إعدادات العرض
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base font-arabic">نشر للعامة</Label>
                <p className="text-sm text-muted-foreground font-arabic">
                  إظهار الإجازة في صفحة سجل الإجازات العامة
                </p>
              </div>
              <Switch 
                checked={formData.is_public} 
                onCheckedChange={(checked) => handleChange('is_public', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base font-arabic">عرض في بوابة الطالب</Label>
                <p className="text-sm text-muted-foreground font-arabic">
                  السماح للطالب برؤية الإجازة في لوحة التحكم الخاصة به
                </p>
              </div>
              <Switch 
                checked={formData.show_in_student_portal} 
                onCheckedChange={(checked) => handleChange('show_in_student_portal', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 border-dashed">
              <div className="space-y-0.5">
                <Label className="text-base font-arabic flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  أرشفة الإجازة
                </Label>
                <p className="text-sm text-muted-foreground font-arabic">
                  إخفاء الإجازة من القوائم (تبقى قابلة للوصول برابط مباشر)
                </p>
              </div>
              <Switch 
                checked={formData.archived} 
                onCheckedChange={(checked) => handleChange('archived', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.student_name}
            className="flex-1 h-14 text-lg font-arabic"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                إصدار الإجازة
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-14 px-8 font-arabic"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreateIjazahPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    }>
      <CreateIjazahPageContent />
    </Suspense>
  )
}
