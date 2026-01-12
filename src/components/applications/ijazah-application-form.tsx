'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Upload, X, Mic, FileAudio } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Validation schemas for each step
const ijazahTypeSchema = z.object({
  ijazahType: z.enum(['hifz', 'qirat', 'tajweed', 'sanad'], {
    errorMap: () => ({ message: 'يرجى اختيار نوع الإجازة' })
  }),
})

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().regex(/^[\+]?[0-9\s\-]{8,20}$/, 'رقم الهاتف غير صالح'),
  dateOfBirth: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  country: z.string().min(1, 'الدولة مطلوبة'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  profession: z.string().optional(),
})

const academicBackgroundSchema = z.object({
  educationLevel: z.string().min(1, 'مستوى التعليم مطلوب'),
  quranInstitution: z.string().optional(),
  yearsOfStudy: z.coerce.number().min(0, 'عدد السنوات يجب أن يكون 0 أو أكثر').max(50, 'عدد السنوات غير منطقي'),
  previousSheikhs: z.string().optional(),
  experience: z.string().optional(),
})

const quranExperienceSchema = z.object({
  memorizationLevel: z.string().min(1, 'مستوى الحفظ مطلوب'),
  recitationProficiency: z.string().min(1, 'مستوى التلاوة مطلوب'),
  tajweedKnowledge: z.string().min(1, 'مستوى التجويد مطلوب'),
  previousIjazat: z.string().optional(),
  selectedNarrations: z.array(z.string()).optional(),
})

// Combined schema for full form validation
const fullApplicationSchema = z.object({
  ijazahType: z.enum(['hifz', 'qirat', 'tajweed', 'sanad']),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[\+]?[0-9\s\-]{8,20}$/),
  dateOfBirth: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  profession: z.string().optional(),
  educationLevel: z.string().min(1),
  quranInstitution: z.string().optional(),
  yearsOfStudy: z.coerce.number().min(0).max(50),
  previousSheikhs: z.string().optional(),
  experience: z.string().optional(),
  memorizationLevel: z.string().min(1),
  recitationProficiency: z.string().min(1),
  tajweedKnowledge: z.string().min(1),
  previousIjazat: z.string().optional(),
  selectedNarrations: z.array(z.string()).optional(),
})

type FullApplicationData = z.infer<typeof fullApplicationSchema>

const STEPS = [
  { title: 'نوع الإجازة', description: 'اختر نوع الإجازة التي تريدها', schema: ijazahTypeSchema },
  { title: 'البيانات الشخصية', description: 'أدخل معلوماتك الشخصية', schema: personalInfoSchema },
  { title: 'الخلفية الأكاديمية', description: 'خلفيتك التعليمية وخبرتك', schema: academicBackgroundSchema },
  { title: 'خبرة القرآن', description: 'خبرتك في القرآن والتجويد', schema: quranExperienceSchema },
  { title: 'الملفات المرفقة', description: 'رفع الملفات المطلوبة', schema: null },
  { title: 'المراجعة والتقديم', description: 'راجع المعلومات وقدم طلبك', schema: null },
]

const IJAZAH_TYPES = [
  { value: 'hifz', label: 'إجازة الحفظ', description: 'الحصول على إجازة في حفظ القرآن الكريم' },
  { value: 'qirat', label: 'إجازة القراءات', description: 'الحصول على إجازة في القراءات القرآنية' },
  { value: 'tajweed', label: 'إجازة التجويد', description: 'الحصول على إجازة في التجويد والنطق' },
  { value: 'sanad', label: 'إجازة مع السند', description: 'الحصول على إجازة مع سند معترف به' },
] as const

const EDUCATION_LEVELS = [
  { value: 'primary', label: 'ابتدائي' },
  { value: 'middle', label: 'متوسط' },
  { value: 'high', label: 'ثانوي' },
  { value: 'bachelor', label: 'بكالوريوس' },
  { value: 'master', label: 'ماجستير' },
  { value: 'phd', label: 'دكتوراه' },
]

const MEMORIZATION_LEVELS = [
  { value: 'none', label: 'لم أحفظ' },
  { value: 'partial', label: 'حفظت أجزاء' },
  { value: 'half', label: 'حفظت نصف القرآن' },
  { value: 'most', label: 'حفظت معظم القرآن' },
  { value: 'complete', label: 'حفظت القرآن كاملاً' },
]

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
  { value: 'expert', label: 'ماهر جداً' },
]

export function IjazahApplicationForm() {
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({})
  
  // File uploads
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [previousIjazahFiles, setPreviousIjazahFiles] = useState<File[]>([])
  const [previousIjazahUrls, setPreviousIjazahUrls] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  
  // Narration types from database
  const [narrationTypes, setNarrationTypes] = useState<any[]>([])

  useEffect(() => {
    loadNarrationTypes()
  }, [])

  const loadNarrationTypes = async () => {
    const { data } = await supabase
      .from('narration_types')
      .select('*')
      .eq('active', true)
      .order('display_order')
    
    if (data) {
      setNarrationTypes(data)
    }
  }

  const form = useForm<FullApplicationData>({
    resolver: zodResolver(fullApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      ijazahType: undefined,
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      country: '',
      city: '',
      profession: '',
      educationLevel: '',
      quranInstitution: '',
      yearsOfStudy: 0,
      previousSheikhs: '',
      experience: '',
      memorizationLevel: '',
      recitationProficiency: '',
      tajweedKnowledge: '',
      previousIjazat: '',
      selectedNarrations: [],
    },
  })

  const { register, watch, setValue, formState: { errors }, trigger } = form
  const formValues = watch()

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStepSchema = STEPS[step].schema
    if (!currentStepSchema) return true // Review/Files step has no schema

    let fieldsToValidate: (keyof FullApplicationData)[] = []
    
    switch (step) {
      case 0:
        fieldsToValidate = ['ijazahType']
        break
      case 1:
        fieldsToValidate = ['fullName', 'email', 'phone', 'dateOfBirth', 'country', 'city']
        break
      case 2:
        fieldsToValidate = ['educationLevel', 'yearsOfStudy']
        break
      case 3:
        fieldsToValidate = ['memorizationLevel', 'recitationProficiency', 'tajweedKnowledge']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    setStepErrors(prev => ({ ...prev, [step]: !isValid }))
    return isValid
  }, [step, trigger])

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    
    if (!isValid) {
      return
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      await handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // Handle audio file upload
  const handleAudioUpload = async (file: File) => {
    if (!file) return
    
    setUploadingAudio(true)
    setAudioFile(file)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `audio_${Date.now()}.${fileExt}`
      const filePath = `applications/audio/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setAudioUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading audio:', error)
      setError('فشل رفع الملف الصوتي')
    } finally {
      setUploadingAudio(false)
    }
  }

  // Handle previous ijazah files upload
  const handleIjazahFilesUpload = async (files: FileList) => {
    if (!files.length) return
    
    setUploadingFiles(true)
    const newFiles = Array.from(files)
    setPreviousIjazahFiles(prev => [...prev, ...newFiles])
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `ijazah_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `applications/ijazahs/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }
      
      setPreviousIjazahUrls(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Error uploading files:', error)
      setError('فشل رفع بعض الملفات')
    } finally {
      setUploadingFiles(false)
    }
  }

  const removeIjazahFile = (index: number) => {
    setPreviousIjazahFiles(prev => prev.filter((_, i) => i !== index))
    setPreviousIjazahUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Structure data for API
      const applicationData = {
        ijazahType: { ijazahType: formValues.ijazahType },
        personalInfo: {
          fullName: formValues.fullName,
          email: formValues.email,
          phone: formValues.phone,
          dateOfBirth: formValues.dateOfBirth,
          country: formValues.country,
          city: formValues.city,
          profession: formValues.profession,
        },
        academicBackground: {
          educationLevel: formValues.educationLevel,
          quranInstitution: formValues.quranInstitution,
          yearsOfStudy: formValues.yearsOfStudy,
          previousSheikhs: formValues.previousSheikhs,
          experience: formValues.experience,
        },
        quranExperience: {
          memorizationLevel: formValues.memorizationLevel,
          recitationProficiency: formValues.recitationProficiency,
          tajweedKnowledge: formValues.tajweedKnowledge,
          previousIjazat: formValues.previousIjazat,
          selectedNarrations: formValues.selectedNarrations,
        },
        files: {
          sampleAudioUrl: audioUrl,
          previousIjazahUrls: previousIjazahUrls,
        },
      }

      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل تقديم الطلب')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-900">تم تقديم الطلب بنجاح!</h2>
            <p className="text-green-700">سيتم مراجعة طلبك قريباً. يمكنك متابعة حالة الطلب من لوحة التحكم.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="mt-4"
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, index) => (
            <div key={index} className="flex items-center flex-1">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  index < step
                    ? 'bg-primary text-white'
                    : index === step
                    ? stepErrors[index] 
                      ? 'bg-destructive text-white' 
                      : 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < step ? '✓' : stepErrors[index] ? <AlertCircle className="h-5 w-5" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{STEPS[step].title}</h3>
          <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <Step0IjazahType 
              value={formValues.ijazahType} 
              onChange={(val) => setValue('ijazahType', val)}
              error={errors.ijazahType?.message}
            />
          )}
          {step === 1 && (
            <Step1PersonalInfo 
              register={register} 
              errors={errors}
              values={formValues}
            />
          )}
          {step === 2 && (
            <Step2AcademicBackground 
              register={register} 
              errors={errors}
              value={formValues.educationLevel}
              onChange={(val) => setValue('educationLevel', val)}
            />
          )}
          {step === 3 && (
            <Step3QuranExperience 
              register={register} 
              errors={errors}
              values={formValues}
              onChange={(field, val) => setValue(field as keyof FullApplicationData, val)}
              narrationTypes={narrationTypes}
            />
          )}
          {step === 4 && (
            <Step4Files
              audioFile={audioFile}
              audioUrl={audioUrl}
              uploadingAudio={uploadingAudio}
              onAudioUpload={handleAudioUpload}
              onAudioRemove={() => { setAudioFile(null); setAudioUrl('') }}
              previousIjazahFiles={previousIjazahFiles}
              previousIjazahUrls={previousIjazahUrls}
              uploadingFiles={uploadingFiles}
              onFilesUpload={handleIjazahFilesUpload}
              onFileRemove={removeIjazahFile}
            />
          )}
          {step === 5 && (
            <Step5Review 
              formValues={formValues} 
              audioUrl={audioUrl}
              previousIjazahUrls={previousIjazahUrls}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={step === 0 || loading}
        >
          <ChevronRight className="h-4 w-4 ml-2" />
          السابق
        </Button>

        <div className="text-sm text-muted-foreground">
          {step + 1} من {STEPS.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : step === STEPS.length - 1 ? (
            'تقديم الطلب'
          ) : (
            <>
              التالي
              <ChevronLeft className="h-4 w-4 mr-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Step Components
function Step0IjazahType({ 
  value, 
  onChange, 
  error 
}: { 
  value: string | undefined
  onChange: (val: 'hifz' | 'qirat' | 'tajweed' | 'sanad') => void
  error?: string 
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">اختر نوع الإجازة التي تريد الحصول عليها:</p>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      <div className="grid gap-4">
        {IJAZAH_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`p-4 border-2 rounded-lg text-right transition-colors ${
              value === type.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <h4 className="font-semibold">{type.label}</h4>
            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step1PersonalInfo({ 
  register, 
  errors,
  values,
}: { 
  register: ReturnType<typeof useForm<FullApplicationData>>['register']
  errors: ReturnType<typeof useForm<FullApplicationData>>['formState']['errors']
  values: FullApplicationData
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">الاسم الكامل *</Label>
        <Input
          id="fullName"
          placeholder="أحمد محمد"
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            dir="ltr"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف / واتساب *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+966 50 000 0000"
            dir="ltr"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">تاريخ الميلاد *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register('dateOfBirth')}
        />
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">الدولة *</Label>
          <Input
            id="country"
            placeholder="السعودية"
            {...register('country')}
          />
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">المدينة *</Label>
          <Input
            id="city"
            placeholder="الرياض"
            {...register('city')}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">المهنة أو الصفة</Label>
        <Input
          id="profession"
          placeholder="معلم قرآن، إمام مسجد، طالب علم..."
          {...register('profession')}
        />
      </div>
    </div>
  )
}

function Step2AcademicBackground({ 
  register, 
  errors,
  value,
  onChange,
}: { 
  register: ReturnType<typeof useForm<FullApplicationData>>['register']
  errors: ReturnType<typeof useForm<FullApplicationData>>['formState']['errors']
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="educationLevel">مستوى التعليم *</Label>
        <select
          id="educationLevel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">اختر مستوى التعليم</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.educationLevel && (
          <p className="text-xs text-destructive">{errors.educationLevel.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quranInstitution">المؤسسة القرآنية (اختياري)</Label>
        <Input
          id="quranInstitution"
          placeholder="اسم المؤسسة أو المسجد"
          {...register('quranInstitution')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfStudy">عدد سنوات الدراسة *</Label>
        <Input
          id="yearsOfStudy"
          type="number"
          min="0"
          max="50"
          placeholder="5"
          {...register('yearsOfStudy')}
        />
        {errors.yearsOfStudy && (
          <p className="text-xs text-destructive">{errors.yearsOfStudy.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousSheikhs">الشيوخ الذين قرأت عليهم سابقاً</Label>
        <textarea
          id="previousSheikhs"
          placeholder="اذكر أسماء الشيوخ الذين تلقيت عنهم القرآن..."
          {...register('previousSheikhs')}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">خبراتك في التدريس أو الإمامة</Label>
        <textarea
          id="experience"
          placeholder="اذكر خبراتك في تدريس القرآن أو الإمامة إن وجدت..."
          {...register('experience')}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>
    </div>
  )
}

function Step3QuranExperience({ 
  register, 
  errors,
  values,
  onChange,
  narrationTypes,
}: { 
  register: ReturnType<typeof useForm<FullApplicationData>>['register']
  errors: ReturnType<typeof useForm<FullApplicationData>>['formState']['errors']
  values: FullApplicationData
  onChange: (field: string, val: string | string[]) => void
  narrationTypes: any[]
}) {
  const handleNarrationToggle = (narration: string) => {
    const current = values.selectedNarrations || []
    const updated = current.includes(narration)
      ? current.filter(n => n !== narration)
      : [...current, narration]
    onChange('selectedNarrations', updated)
  }

  // Group narrations by parent reading
  const groupedNarrations = narrationTypes.reduce((acc: any, type) => {
    const parent = type.parent_reading || 'أخرى'
    if (!acc[parent]) acc[parent] = []
    acc[parent].push(type)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="memorizationLevel">مستوى الحفظ *</Label>
        <select
          id="memorizationLevel"
          value={values.memorizationLevel}
          onChange={(e) => onChange('memorizationLevel', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">اختر مستوى الحفظ</option>
          {MEMORIZATION_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.memorizationLevel && (
          <p className="text-xs text-destructive">{errors.memorizationLevel.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recitationProficiency">مستوى التلاوة *</Label>
        <select
          id="recitationProficiency"
          value={values.recitationProficiency}
          onChange={(e) => onChange('recitationProficiency', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">اختر مستوى التلاوة</option>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.recitationProficiency && (
          <p className="text-xs text-destructive">{errors.recitationProficiency.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tajweedKnowledge">معرفة التجويد *</Label>
        <select
          id="tajweedKnowledge"
          value={values.tajweedKnowledge}
          onChange={(e) => onChange('tajweedKnowledge', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">اختر مستوى التجويد</option>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.tajweedKnowledge && (
          <p className="text-xs text-destructive">{errors.tajweedKnowledge.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousIjazat">الإجازات السابقة (اختياري)</Label>
        <textarea
          id="previousIjazat"
          placeholder="إن وجدت... اكتب اسم الشيخ والتاريخ"
          {...register('previousIjazat')}
          className="w-full px-3 py-2 border border-border rounded-md text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      {/* Narration Selection */}
      {narrationTypes.length > 0 && (
        <div className="space-y-3">
          <Label>الروايات المطلوب الإجازة بها</Label>
          <p className="text-xs text-muted-foreground">اختر الرواية أو الروايات التي تريد الإجازة بها</p>
          
          <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-4">
            {Object.entries(groupedNarrations).map(([reading, narrators]: [string, any]) => (
              <div key={reading} className="space-y-2">
                <h5 className="font-semibold text-sm text-primary">{reading}</h5>
                <div className="grid grid-cols-2 gap-2 pr-4">
                  {narrators.map((type: any) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={(values.selectedNarrations || []).includes(type.name)}
                        onCheckedChange={() => handleNarrationToggle(type.name)}
                      />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {(values.selectedNarrations?.length ?? 0) > 0 && (
            <div className="p-2 bg-primary/10 rounded text-sm">
              الروايات المختارة: {values.selectedNarrations?.join('، ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Step4Files({
  audioFile,
  audioUrl,
  uploadingAudio,
  onAudioUpload,
  onAudioRemove,
  previousIjazahFiles,
  previousIjazahUrls,
  uploadingFiles,
  onFilesUpload,
  onFileRemove,
}: {
  audioFile: File | null
  audioUrl: string
  uploadingAudio: boolean
  onAudioUpload: (file: File) => void
  onAudioRemove: () => void
  previousIjazahFiles: File[]
  previousIjazahUrls: string[]
  uploadingFiles: boolean
  onFilesUpload: (files: FileList) => void
  onFileRemove: (index: number) => void
}) {
  return (
    <div className="space-y-6">
      {/* Audio Sample */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <Label className="text-base">مقطع صوتي تجريبي</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          أرفق مقطعاً صوتياً من تلاوتك (يفضل أن يكون من سورة الفاتحة أو جزء عم)
        </p>
        
        {!audioUrl ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && onAudioUpload(e.target.files[0])}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              {uploadingAudio ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              ) : (
                <>
                  <FileAudio className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">اضغط لرفع ملف صوتي</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A (حد أقصى 10MB)</p>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileAudio className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-medium">{audioFile?.name || 'ملف صوتي'}</p>
                  <p className="text-xs text-muted-foreground">تم الرفع بنجاح</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onAudioRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <audio controls className="w-full mt-3">
              <source src={audioUrl} />
            </audio>
          </div>
        )}
      </div>

      {/* Previous Ijazat Files */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <Label className="text-base">صور الإجازات السابقة (اختياري)</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          أرفق صور أو ملفات PDF للإجازات السابقة إن وجدت
        </p>
        
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => e.target.files && onFilesUpload(e.target.files)}
            className="hidden"
            id="ijazah-files-upload"
          />
          <label htmlFor="ijazah-files-upload" className="cursor-pointer">
            {uploadingFiles ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">اضغط لرفع ملفات</p>
                <p className="text-xs text-muted-foreground mt-1">صور أو PDF</p>
              </>
            )}
          </label>
        </div>

        {previousIjazahFiles.length > 0 && (
          <div className="space-y-2">
            {previousIjazahFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => onFileRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Step5Review({ 
  formValues, 
  audioUrl,
  previousIjazahUrls,
}: { 
  formValues: FullApplicationData
  audioUrl: string
  previousIjazahUrls: string[]
}) {
  const getIjazahTypeLabel = (type: string) => {
    return IJAZAH_TYPES.find(t => t.value === type)?.label || type
  }

  const getEducationLabel = (val: string) => {
    return EDUCATION_LEVELS.find(l => l.value === val)?.label || val
  }

  const getMemorizationLabel = (val: string) => {
    return MEMORIZATION_LEVELS.find(l => l.value === val)?.label || val
  }

  const getProficiencyLabel = (val: string) => {
    return PROFICIENCY_LEVELS.find(l => l.value === val)?.label || val
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">نوع الإجازة</h4>
          <p className="text-sm">{getIjazahTypeLabel(formValues.ijazahType)}</p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">البيانات الشخصية</h4>
          <div className="text-sm space-y-1">
            <p>الاسم: {formValues.fullName}</p>
            <p dir="ltr" className="text-left">البريد: {formValues.email}</p>
            <p dir="ltr" className="text-left">الهاتف: {formValues.phone}</p>
            <p>تاريخ الميلاد: {formValues.dateOfBirth}</p>
            <p>الدولة: {formValues.country}</p>
            <p>المدينة: {formValues.city}</p>
            {formValues.profession && <p>المهنة: {formValues.profession}</p>}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">الخلفية الأكاديمية</h4>
          <div className="text-sm space-y-1">
            <p>مستوى التعليم: {getEducationLabel(formValues.educationLevel)}</p>
            {formValues.quranInstitution && (
              <p>المؤسسة القرآنية: {formValues.quranInstitution}</p>
            )}
            <p>سنوات الدراسة: {formValues.yearsOfStudy}</p>
            {formValues.previousSheikhs && (
              <p>الشيوخ السابقون: {formValues.previousSheikhs}</p>
            )}
            {formValues.experience && (
              <p>الخبرات: {formValues.experience}</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">خبرة القرآن</h4>
          <div className="text-sm space-y-1">
            <p>مستوى الحفظ: {getMemorizationLabel(formValues.memorizationLevel)}</p>
            <p>مستوى التلاوة: {getProficiencyLabel(formValues.recitationProficiency)}</p>
            <p>معرفة التجويد: {getProficiencyLabel(formValues.tajweedKnowledge)}</p>
            {formValues.previousIjazat && (
              <p>الإجازات السابقة: {formValues.previousIjazat}</p>
            )}
            {formValues.selectedNarrations && formValues.selectedNarrations.length > 0 && (
              <p>الروايات المطلوبة: {formValues.selectedNarrations.join('، ')}</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">الملفات المرفقة</h4>
          <div className="text-sm space-y-1">
            <p>مقطع صوتي: {audioUrl ? '✓ تم الرفع' : '✗ لم يتم الرفع'}</p>
            <p>إجازات سابقة: {previousIjazahUrls.length > 0 ? `✓ ${previousIjazahUrls.length} ملف(ات)` : '✗ لم يتم الرفع'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p>
          بالضغط على &quot;تقديم الطلب&quot;، فإنك توافق على أن جميع المعلومات المقدمة صحيحة وكاملة وتلتزم بقواعد وشروط النظام.
        </p>
      </div>
    </div>
  )
}
