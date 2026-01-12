'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldAlert, Settings, TrendingUp, UserCircle, FolderKanban, LayoutDashboard, ClipboardList, Users, FileCheck, Plus, BookOpen, BookMarked } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'

// Lazy load heavy components
const StatsOverview = lazy(() => import('@/components/admin/StatsOverview'))
const RequestsDashboard = lazy(() => import('@/components/admin/RequestsDashboard'))
const RequestManagement = lazy(() => import('@/components/admin/RequestManagement'))
const StudentsManagement = lazy(() => import('@/components/admin/StudentsManagement'))
const IjazahList = lazy(() => import('@/components/admin/IjazahList'))
const SettingsPanel = lazy(() => import('@/components/admin/SettingsPanel'))

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')
  const [activeSection, setActiveSection] = useState('overview')
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    checkAuthAndLoadSettings()
  }, [])

  const checkAuthAndLoadSettings = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setAuthStatus('unauthorized')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.roles?.includes('admin')) {
        setAuthStatus('unauthorized')
        return
      }

      setAuthStatus('authorized')
      await loadSettings()
    } catch (error) {
      console.error('Error checking auth:', error)
      setAuthStatus('unauthorized')
    }
  }

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single()

      if (!error && data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const sections = [
    {
      title: 'نظام المنصة',
      icon: Settings,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      items: [
        {
          title: 'نظرة عامة',
          description: 'إحصائيات وملخص شامل للمنصة',
          icon: TrendingUp,
          id: 'overview',
        },
        {
          title: 'الإعدادات',
          description: 'إعدادات التصميم والمحتوى',
          icon: Settings,
          id: 'settings',
        },
        {
          title: 'السيرة الذاتية',
          description: 'تحرير صفحة السيرة الذاتية',
          icon: UserCircle,
          id: 'biography',
        },
        {
          title: 'المكتبة',
          description: 'إدارة الملفات والوسائط',
          icon: FolderKanban,
          id: 'media',
        },
      ],
    },
    {
      title: 'الطلاب والطلبات',
      icon: Users,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      items: [
        {
          title: 'لوحة الطلبات',
          description: 'نظرة شاملة على طلبات الإجازة',
          icon: LayoutDashboard,
          id: 'requests-dashboard',
        },
        {
          title: 'إدارة الطلبات',
          description: 'مراجعة الطلبات واتخاذ الإجراءات',
          icon: ClipboardList,
          id: 'request-management',
        },
        {
          title: 'طلبات الفاتحة',
          description: 'طلبات إجازة سورة الفاتحة',
          icon: BookMarked,
          id: 'fatiha-applications',
        },
        {
          title: 'إدارة الطلاب',
          description: 'إدارة سجلات الطلاب ومعلوماتهم',
          icon: Users,
          id: 'students',
        },
      ],
    },
    {
      title: 'الإجازات',
      icon: FileCheck,
      color: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      items: [
        {
          title: 'الإجازات المصدرة',
          description: 'إدارة وعرض الإجازات',
          icon: FileCheck,
          id: 'ijazah-list',
        },
        {
          title: 'إجازة جديدة',
          description: 'إصدار إجازة قرآنية جديدة',
          icon: Plus,
          id: 'create-ijazah',
          action: () => router.push('/admin/create-ijazah'),
        },
      ],
    },
  ]

  const renderActiveContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StatsOverview />
          </Suspense>
        )
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPanel settings={settings} onSettingsUpdate={loadSettings} />
          </Suspense>
        )
      case 'requests-dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RequestsDashboard />
          </Suspense>
        )
      case 'request-management':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RequestManagement />
          </Suspense>
        )
      case 'students':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentsManagement />
          </Suspense>
        )
      case 'ijazah-list':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <IjazahList />
          </Suspense>
        )
      case 'biography':
        return <BiographyEditor />
      case 'media':
        return <MediaLibrary />
      case 'fatiha-applications':
        return <FatihaApplications />
      default:
        return null
    }
  }

  const currentSection = sections
    .flatMap((s) => s.items)
    .find((i) => i.id === activeSection)

  if (authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary-700" />
      </div>
    )
  }

  if (authStatus === 'unauthorized') {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="max-w-lg mx-auto bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 font-arabic text-red-700">
              <ShieldAlert className="w-6 h-6" />
              وصول مرفوض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-arabic">
              ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4"
              variant="outline"
            >
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 font-arabic">
            لوحة التحكم
          </h1>
          <p className="text-amber-600 font-arabic">إدارة المنصة والإجازات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            sections={sections}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">{currentSection?.title}</CardTitle>
              <p className="text-sm text-muted-foreground font-arabic">
                {currentSection?.description}
              </p>
            </CardHeader>
            <CardContent>{renderActiveContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
    </div>
  )
}

// Biography Editor Component
function BiographyEditor() {
  const supabase = createClient()
  const [biography, setBiography] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBiography()
  }, [])

  const loadBiography = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('biography_text')
        .limit(1)
        .single()
      
      if (data?.biography_text) {
        setBiography(data.biography_text)
      }
    } catch (error) {
      console.error('Error loading biography:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBiography = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ biography_text: biography, updated_at: new Date().toISOString() })
        .not('id', 'is', null)
      
      if (error) throw error
      alert('تم حفظ السيرة الذاتية بنجاح')
    } catch (error) {
      console.error('Error saving biography:', error)
      alert('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2 font-arabic">تحرير السيرة الذاتية</h3>
        <p className="text-sm text-amber-700 font-arabic">
          أضف نبذة عن الشيخ المُجيز وتاريخه في تدريس القرآن الكريم
        </p>
      </div>
      
      <textarea
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        placeholder="اكتب السيرة الذاتية هنا..."
        className="w-full h-96 p-4 border rounded-lg font-arabic text-right resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
        dir="rtl"
      />
      
      <Button 
        onClick={saveBiography} 
        disabled={saving}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
        حفظ السيرة الذاتية
      </Button>
    </div>
  )
}

// Media Library Component
function MediaLibrary() {
  const supabase = createClient()
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list('library', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      
      if (!error && data) {
        setFiles(data)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `library/${Date.now()}_${file.name}`
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file)
      
      if (error) throw error
      await loadFiles()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('فشل رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (name: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return
    
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`library/${name}`])
      
      if (error) throw error
      await loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(`library/${name}`)
    return data.publicUrl
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-amber-900 font-arabic">المكتبة</h3>
          <p className="text-sm text-amber-700 font-arabic">إدارة الملفات والوسائط</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} />
          <Button disabled={uploading} className="bg-amber-600 hover:bg-amber-700 text-white">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
            رفع ملف
          </Button>
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-arabic">
          لا توجد ملفات بعد. قم برفع ملفات لإضافتها للمكتبة.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.name} className="border rounded-lg p-2 group relative">
              {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={getPublicUrl(file.name)} alt={file.name} className="w-full h-24 object-cover rounded" />
              ) : (
                <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <p className="text-xs truncate mt-2 text-center">{file.name}</p>
              <button
                onClick={() => deleteFile(file.name)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Fatiha Applications Component
function FatihaApplications() {
  const supabase = createClient()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('ijazah_applications')
        .select(`
          *,
          profiles!ijazah_applications_user_id_fkey (full_name, email)
        `)
        .eq('ijazah_type', 'fatiha')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setApplications(data)
      }
    } catch (error) {
      console.error('Error loading fatiha applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    }
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      approved: 'معتمد',
      rejected: 'مرفوض',
      completed: 'مكتمل',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-arabic ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-900 font-arabic">طلبات إجازة سورة الفاتحة</h3>
        </div>
        <p className="text-sm text-green-700 font-arabic mt-1">
          إدارة طلبات الإجازة الخاصة بسورة الفاتحة
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-arabic">
          لا توجد طلبات إجازة فاتحة بعد.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold font-arabic">
                    {app.profiles?.full_name || app.personal_info?.fullName || 'غير محدد'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {app.profiles?.email || app.personal_info?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(app.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                  >
                    عرض
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
