'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  draft: { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'مسودة' },
  submitted: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'قيد الانتظار' },
  under_review: { icon: AlertCircle, color: 'bg-blue-100 text-blue-800', label: 'قيد المراجعة' },
  interview_scheduled: { icon: AlertCircle, color: 'bg-purple-100 text-purple-800', label: 'مقابلة مجدولة' },
  approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'مقبول' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'مرفوض' },
  completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800', label: 'مكتمل' },
}

interface Stats {
  total: number
  submitted: number
  under_review: number
  interview_scheduled: number
  approved: number
  rejected: number
  completed: number
  thisWeek: number
  thisMonth: number
}

export default function RequestsDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    interview_scheduled: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: allRequests, error } = await supabase
        .from('ijazah_applications')
        .select(`
          *,
          profiles!ijazah_applications_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(allRequests || [])

      // Calculate statistics
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const statistics = {
        total: allRequests?.length || 0,
        submitted: allRequests?.filter((r: any) => r.status === 'submitted').length || 0,
        under_review: allRequests?.filter((r: any) => r.status === 'under_review').length || 0,
        interview_scheduled: allRequests?.filter((r: any) => r.status === 'interview_scheduled').length || 0,
        approved: allRequests?.filter((r: any) => r.status === 'approved').length || 0,
        rejected: allRequests?.filter((r: any) => r.status === 'rejected').length || 0,
        completed: allRequests?.filter((r: any) => r.status === 'completed').length || 0,
        thisWeek: allRequests?.filter((r: any) => new Date(r.created_at) >= weekAgo).length || 0,
        thisMonth: allRequests?.filter((r: any) => new Date(r.created_at) >= monthAgo).length || 0,
      }

      setStats(statistics)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    onClick,
  }: {
    title: string
    value: number
    icon: any
    color: string
    bgColor: string
    onClick?: () => void
  }) => (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground font-arabic mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <div className={`p-4 rounded-full ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary-700" />
      </div>
    )
  }

  const recentRequests = requests.slice(0, 10)

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 font-arabic flex items-center gap-2">
          <ClipboardList className="w-8 h-8" />
          لوحة الطلبات
        </h1>
        <p className="text-muted-foreground mt-2 font-arabic">نظرة شاملة على طلبات الإجازة</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.total}
          icon={ClipboardList}
          color="text-amber-700"
          bgColor="bg-amber-100"
        />
        <StatCard
          title="قيد الانتظار"
          value={stats.submitted}
          icon={Clock}
          color="text-yellow-700"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="قيد المراجعة"
          value={stats.under_review}
          icon={AlertCircle}
          bgColor="bg-blue-100"
          color="text-blue-700"
        />
        <StatCard
          title="مقبول"
          value={stats.approved}
          icon={CheckCircle}
          color="text-green-700"
          bgColor="bg-green-100"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="مقابلة مجدولة"
          value={stats.interview_scheduled}
          icon={Calendar}
          color="text-purple-700"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="مكتملة"
          value={stats.completed}
          icon={CheckCircle}
          color="text-emerald-700"
          bgColor="bg-emerald-100"
        />
        <StatCard
          title="طلبات هذا الشهر"
          value={stats.thisMonth}
          icon={TrendingUp}
          color="text-indigo-700"
          bgColor="bg-indigo-100"
        />
      </div>

      {/* Recent Requests Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="font-arabic">آخر الطلبات</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
                    نوع الإجازة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {recentRequests.length > 0 ? (
                  recentRequests.map((request) => {
                    const StatusIcon = statusConfig[request.status]?.icon || Clock
                    const statusColor = statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'
                    const statusLabel = statusConfig[request.status]?.label || request.status

                    return (
                      <tr
                        key={request.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push('/admin/request-management')}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-muted-foreground ml-2" />
                            <div className="font-medium text-foreground">
                              {request.profiles?.full_name || request.personal_info?.full_name || 'غير محدد'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {request.profiles?.email || request.personal_info?.email || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">
                            {request.ijazah_type === 'hifz' ? 'حفظ' : request.ijazah_type === 'tilawa' ? 'تلاوة' : 'غير محدد'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${statusColor} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(request.created_at), 'd MMM yyyy', { locale: ar })}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-arabic">
                      لا توجد طلبات حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">توزيع الحالات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries({
                'قيد الانتظار': { count: stats.submitted, color: 'bg-yellow-500' },
                'قيد المراجعة': { count: stats.under_review, color: 'bg-blue-500' },
                'مقابلة مجدولة': { count: stats.interview_scheduled, color: 'bg-purple-500' },
                'مقبول': { count: stats.approved, color: 'bg-green-500' },
                'مكتمل': { count: stats.completed, color: 'bg-emerald-500' },
                'مرفوض': { count: stats.rejected, color: 'bg-red-500' },
              }).map(([label, data]) => {
                const percentage = stats.total > 0 ? ((data.count / stats.total) * 100).toFixed(1) : '0'
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground font-arabic">{label}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className={`${data.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">إحصائيات زمنية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">طلبات هذا الأسبوع</p>
                    <p className="text-2xl font-bold text-amber-800">{stats.thisWeek}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">طلبات هذا الشهر</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.thisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">معدل القبول</p>
                    <p className="text-2xl font-bold text-green-800">
                      {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
