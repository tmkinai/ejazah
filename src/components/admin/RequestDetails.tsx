'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Eye, Volume2, Settings, Loader2, Save, CheckCircle2, X, PlayCircle } from 'lucide-react'

const statusConfig: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  submitted: { icon: PlayCircle, color: 'text-yellow-700', label: 'قيد الانتظار', bg: 'bg-yellow-50' },
  under_review: { icon: PlayCircle, color: 'text-blue-700', label: 'قيد المراجعة', bg: 'bg-blue-50' },
  interview_scheduled: { icon: PlayCircle, color: 'text-purple-700', label: 'مقابلة مجدولة', bg: 'bg-purple-50' },
  approved: { icon: CheckCircle2, color: 'text-green-700', label: 'مقبول', bg: 'bg-green-50' },
  rejected: { icon: X, color: 'text-red-700', label: 'مرفوض', bg: 'bg-red-50' },
  completed: { icon: CheckCircle2, color: 'text-emerald-700', label: 'مكتمل', bg: 'bg-emerald-50' },
}

interface RequestDetailsProps {
  request: any
  onUpdateRequest: () => void
}

export default function RequestDetails({ request, onUpdateRequest }: RequestDetailsProps) {
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatedData, setUpdatedData] = useState({
    status: '',
    admin_notes: '',
    scholar_id: '',
  })

  useEffect(() => {
    if (request) {
      setUpdatedData({
        status: request.status || 'submitted',
        admin_notes: request.admin_notes || '',
        scholar_id: request.scholar_id || '',
      })
    }
  }, [request])

  if (!request) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="font-semibold font-arabic">لا يوجد طلب محدد</h3>
          <p className="text-sm font-arabic">اختر طلبًا من القائمة لعرض التفاصيل.</p>
        </div>
      </Card>
    )
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('ijazah_applications')
        .update(updatedData)
        .eq('id', request.id)

      if (error) throw error

      onUpdateRequest()
    } catch (error) {
      console.error('Failed to update request:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[updatedData.status] || statusConfig.submitted
  const StatusIcon = currentConfig.icon

  return (
    <Card className="sticky top-6 shadow-lg">
      <ScrollArea className="h-auto md:h-[calc(100vh-8rem)]">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="font-arabic">
                {request.profiles?.full_name || request.personal_info?.full_name || 'غير محدد'}
              </CardTitle>
              <CardDescription>
                {request.profiles?.email || request.personal_info?.email || 'غير محدد'}
              </CardDescription>
            </div>
            <Badge className={`${statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'}`}>
              {statusConfig[request.status]?.label || request.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="info">
                <Eye className="w-4 h-4 ml-2" />
                تفاصيل الطالب
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="w-4 h-4 ml-2" />
                المقطع الصوتي
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Settings className="w-4 h-4 ml-2" />
                الإجراءات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">الهاتف:</span>
                  <p>{request.profiles?.phone_number || request.personal_info?.phone || 'غير محدد'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">نوع الإجازة:</span>
                  <p>{request.ijazah_type === 'hifz' ? 'حفظ' : request.ijazah_type === 'tilawa' ? 'تلاوة' : 'غير محدد'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">معلومات إضافية:</span>
                  <p className="whitespace-pre-wrap">
                    {request.personal_info ? JSON.stringify(request.personal_info, null, 2) : 'لا توجد معلومات'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <Volume2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-arabic">لا يوجد مقطع صوتي متاح حالياً</p>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6 mt-4">
              {/* Status Overview */}
              <div className={`p-4 rounded-lg border-2 ${currentConfig.bg}`}>
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-6 h-6 ${currentConfig.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">الحالة الحالية</p>
                    <p className={`text-xl font-bold ${currentConfig.color}`}>{currentConfig.label}</p>
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status" className="font-arabic text-base">
                  تحديث حالة الطلب
                </Label>
                <Select value={updatedData.status} onValueChange={(value) => setUpdatedData({ ...updatedData, status: value })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">قيد الانتظار</SelectItem>
                    <SelectItem value="under_review">قيد المراجعة</SelectItem>
                    <SelectItem value="interview_scheduled">مقابلة مجدولة</SelectItem>
                    <SelectItem value="approved">مقبول</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin_notes" className="font-arabic text-base">
                  ملاحظات الإدارة
                </Label>
                <Textarea
                  id="admin_notes"
                  value={updatedData.admin_notes}
                  onChange={(e) => setUpdatedData({ ...updatedData, admin_notes: e.target.value })}
                  rows={5}
                  placeholder="ملاحظات أو توجيهات للطالب..."
                  className="font-arabic"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full h-12 text-base font-arabic"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 ml-2" />
                      حفظ التحديثات
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
