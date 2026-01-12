'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Loader2, Inbox, MailCheck, ShieldAlert } from 'lucide-react'
import RequestListItem from '@/components/admin/RequestListItem'
import RequestDetails from '@/components/admin/RequestDetails'

export default function RequestManagement() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [loadingState, setLoadingState] = useState<'loading-auth' | 'loading-data' | 'idle' | 'error'>('loading-auth')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setErrorMessage('المستخدم غير مسجل.')
        setLoadingState('error')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.roles?.includes('admin')) {
        setErrorMessage('وصول مرفوض. حسابك ليس لديه صلاحيات المدير.')
        setLoadingState('error')
        return
      }

      setLoadingState('loading-data')
    } catch (error) {
      setErrorMessage('فشل التحقق من هوية المستخدم.')
      setLoadingState('error')
    }
  }

  const loadRequests = useCallback(async () => {
    setLoadingState('loading-data')
    try {
      const { data: allRequests, error } = await supabase
        .from('ijazah_applications')
        .select(`
          *,
          profiles!ijazah_applications_user_id_fkey (
            id,
            full_name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(allRequests || [])
      if ((allRequests?.length || 0) > 0 && !selectedRequest) {
        setSelectedRequest(allRequests![0])
      }
      setLoadingState('idle')
    } catch (error) {
      console.error('Error loading requests:', error)
      setErrorMessage('فشل جلب الطلبات من قاعدة البيانات.')
      setLoadingState('error')
    }
  }, [selectedRequest])

  useEffect(() => {
    if (loadingState === 'loading-data') {
      loadRequests()
    }
  }, [loadingState, loadRequests])

  const handleUpdateRequest = () => {
    loadRequests()
  }

  return (
    <div className="space-y-6">
      {(loadingState === 'loading-auth' || loadingState === 'loading-data') && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary-700" />
          <p className="mr-4 font-arabic">
            {loadingState === 'loading-auth' ? 'جاري التحقق من الصلاحيات...' : 'جاري جلب الطلبات...'}
          </p>
        </div>
      )}

      {loadingState === 'error' && (
        <Card className="max-w-lg mx-auto bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 font-arabic text-red-700">
              <ShieldAlert className="w-6 h-6" />
              خطأ في الوصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-arabic mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      )}

      {loadingState === 'idle' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary-900 font-arabic">إدارة طلبات الإجازة</h1>
            <p className="text-muted-foreground font-arabic">مراجعة الطلبات الجديدة واتخاذ الإجراءات اللازمة.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-20rem)]">
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="font-arabic flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-700" />
                  الطلبات الواردة ({requests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <RequestListItem
                        key={request.id}
                        request={request}
                        isSelected={selectedRequest?.id === request.id}
                        onClick={() => setSelectedRequest(request)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <MailCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-semibold font-arabic">لا توجد طلبات جديدة</h3>
                      <p className="text-sm font-arabic">سيتم عرض الطلبات هنا عند وصولها.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <RequestDetails
                key={selectedRequest?.id || 'empty'}
                request={selectedRequest}
                onUpdateRequest={handleUpdateRequest}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
