'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Book, Users, Calendar, Award, Bookmark, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface Stats {
  total: number
  thisMonth: number
  uniqueStudents: number
  narrationTypes: Record<string, number>
  recent: any[]
}

export default function StatsOverview() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    total: 0,
    thisMonth: 0,
    uniqueStudents: 0,
    narrationTypes: {},
    recent: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = async () => {
    try {
      const { data: ijazat, error } = await supabase
        .from('ijazah_certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const thisMonth = ijazat?.filter((ijazah) => {
        const ijazahDate = new Date(ijazah.created_at)
        return (
          ijazahDate.getMonth() === now.getMonth() &&
          ijazahDate.getFullYear() === now.getFullYear()
        )
      }) || []

      const uniqueStudents = new Set(
        ijazat?.map((i) => i.student_id) || []
      ).size

      const narrationTypes = (ijazat || []).reduce((acc: Record<string, number>, ijazah) => {
        const type = ijazah.narration_type || 'غير محدد'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      setStats({
        total: ijazat?.length || 0,
        thisMonth: thisMonth.length,
        uniqueStudents,
        narrationTypes,
        recent: ijazat?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string
    value: number
    icon: any
    color: string
  }) => (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground font-arabic mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الإجازات"
          value={stats.total}
          icon={Book}
          color="bg-amber-600"
        />
        <StatCard
          title="إجازات هذا الشهر"
          value={stats.thisMonth}
          icon={Calendar}
          color="bg-green-600"
        />
        <StatCard
          title="عدد الطلاب"
          value={stats.uniqueStudents}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="عدد الروايات"
          value={Object.keys(stats.narrationTypes).length}
          icon={Award}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="font-arabic">توزيع الروايات</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {Object.entries(stats.narrationTypes)
                  .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                  .map(([type, count]) => {
                    const percentage =
                      stats.total > 0 ? ((count as number) / stats.total) * 100 : 0
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium flex items-center gap-2 text-sm">
                            <Bookmark className="w-4 h-4 text-amber-600" /> {type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                {Object.keys(stats.narrationTypes).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground font-arabic">
                    لا توجد إحصاءات متاحة
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="font-arabic">آخر الإجازات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {stats.recent.map((ijazah) => (
                  <div
                    key={ijazah.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/certificates/${ijazah.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-semibold">{ijazah.student_name || 'غير محدد'}</div>
                          <div className="text-sm text-muted-foreground">
                            {ijazah.narration_type || 'غير محدد'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(ijazah.created_at), 'yyyy/MM/dd', { locale: ar })}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recent.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground font-arabic">
                    لا توجد إجازات حديثة
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full text-amber-700 hover:text-amber-900 hover:bg-amber-50 font-arabic"
              onClick={() => router.push('/admin/ijazah-list')}
            >
              عرض كافة الإجازات
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
