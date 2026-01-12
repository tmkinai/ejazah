'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Edit, Archive, Trash2, Eye, AlertCircle, CheckSquare, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
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

export default function IjazahList() {
  const router = useRouter()
  const supabase = createClient()
  const [ijazat, setIjazat] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as string | null })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('ijazah_certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIjazat(data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePublic = async (id: string, is_public: boolean) => {
    try {
      const { error } = await supabase
        .from('ijazah_certificates')
        .update({ is_public: !is_public })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error updating public status:', error)
    }
  }

  const handleArchiveToggle = async (id: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('ijazah_certificates')
        .update({ status: archived ? 'active' : 'revoked' })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error updating archive status:', error)
    }
  }

  const handleDeleteIjazah = async () => {
    if (!deleteDialog.id) return

    try {
      const { error } = await supabase
        .from('ijazah_certificates')
        .delete()
        .eq('id', deleteDialog.id)

      if (error) throw error
      setDeleteDialog({ open: false, id: null })
      await loadData()
    } catch (error) {
      console.error('Error deleting ijazah:', error)
    }
  }

  const filteredIjazat = ijazat.filter((ijazah) => {
    const matchesSearch =
      ijazah.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ijazah.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ijazah.narration_type?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterType === 'all') return matchesSearch
    else if (filterType === 'archived') return matchesSearch && ijazah.status === 'revoked'
    else if (filterType === 'public') return matchesSearch && ijazah.is_public
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-arabic">الإجازات المصدرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="بحث بالاسم أو الرقم أو الرواية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="تصفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإجازات</SelectItem>
              <SelectItem value="public">المنشورة فقط</SelectItem>
              <SelectItem value="archived">الإجازات المؤرشفة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredIjazat.map((ijazah) => {
            const isArchived = ijazah.status === 'revoked'

            return (
              <div
                key={ijazah.id}
                className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border transition-all ${
                  isArchived ? 'bg-muted border-muted-foreground' : 'bg-white hover:border-primary-200'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{ijazah.student_name || 'غير محدد'}</h3>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                    <span className="font-mono">رقم الإجازة: {ijazah.certificate_number || 'غير محدد'}</span>
                    <span>•</span>
                    <Badge variant="outline" className="font-medium">
                      {ijazah.narration_type || 'غير محدد'}
                    </Badge>
                    {isArchived && (
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                        مؤرشفة
                      </Badge>
                    )}
                    {ijazah.is_public && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        منشورة
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تاريخ الإصدار:{' '}
                    {ijazah.issued_at ? format(new Date(ijazah.issued_at), 'yyyy/MM/dd', { locale: ar }) : 'غير محدد'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/certificates/${ijazah.id}`)}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={ijazah.is_public ? 'border-green-300 text-green-700' : 'border-gray-200 text-gray-700'}
                    onClick={() => handleTogglePublic(ijazah.id, ijazah.is_public)}
                  >
                    {ijazah.is_public ? <CheckSquare className="w-4 h-4 ml-1" /> : <Square className="w-4 h-4 ml-1" />}
                    {ijazah.is_public ? 'إخفاء' : 'نشر'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={isArchived ? 'border-amber-200 text-amber-700' : 'border-gray-200 text-gray-700'}
                    onClick={() => handleArchiveToggle(ijazah.id, isArchived)}
                  >
                    <Archive className="w-4 h-4 ml-1" />
                    {isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteDialog({ open: true, id: ijazah.id })}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            )
          })}

          {filteredIjazat.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-arabic">
              لا توجد إجازات مطابقة لبحثك
            </div>
          )}
        </div>

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 font-arabic">
                <AlertCircle className="w-5 h-5 text-red-500" />
                تأكيد الحذف
              </AlertDialogTitle>
              <AlertDialogDescription className="font-arabic">
                هل أنت متأكد من رغبتك في حذف هذه الإجازة؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteIjazah} className="bg-red-600 hover:bg-red-700 font-arabic">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
