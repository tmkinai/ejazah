'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Search, Edit, Trash2, Eye, UserPlus } from 'lucide-react'
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

export default function StudentsManagement() {
  const supabase = createClient()
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as string | null })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteDialog.id)

      if (error) throw error

      setDeleteDialog({ open: false, id: null })
      await loadStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
      setDeleteDialog({ open: false, id: null })
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone_number?.includes(searchTerm)

    const matchesRole =
      roleFilter === 'all' || student.roles?.includes(roleFilter)

    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 font-arabic">إدارة الطلاب</h1>
          <p className="text-muted-foreground mt-1 font-arabic">إدارة سجلات الطلاب ومعلوماتهم</p>
        </div>
        <Button className="font-arabic">
          <Plus className="w-4 h-4 ml-2" />
          إضافة طالب جديد
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="بحث بالاسم، البريد، أو الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="scholar">شيخ</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt={student.full_name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-primary-700" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-primary-900">{student.full_name || 'غير محدد'}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {student.roles?.map((role: string) => (
                          <Badge key={role} variant="outline">
                            {role === 'admin' ? 'مدير' : role === 'scholar' ? 'شيخ' : 'طالب'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      {student.phone_number && (
                        <div>
                          <span className="font-semibold">الجوال:</span> {student.phone_number}
                        </div>
                      )}
                      {student.country && (
                        <div>
                          <span className="font-semibold">الدولة:</span> {student.country}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 md:ml-1" />
                      <span className="hidden md:inline">عرض</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 md:ml-1" />
                      <span className="hidden md:inline">تعديل</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialog({ open: true, id: student.id })}
                    >
                      <Trash2 className="w-4 h-4 md:ml-1" />
                      <span className="hidden md:inline">حذف</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2 font-arabic">لا توجد نتائج</h3>
              <p className="text-muted-foreground font-arabic">لم يتم العثور على طلاب مطابقين لمعايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              هل أنت متأكد من رغبتك في حذف سجل هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-arabic">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
