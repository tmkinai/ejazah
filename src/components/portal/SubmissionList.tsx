'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Volume2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface SubmissionListProps {
  submissions: any[]
  viewMode?: 'list' | 'grid'
  onMarkAsSeen?: (id: string) => void
}

export default function SubmissionList({ submissions, viewMode = 'list', onMarkAsSeen }: SubmissionListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Volume2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2 font-arabic">لا توجد تلاوات</h3>
          <p className="text-muted-foreground font-arabic">لم تقم برفع أي تلاوات بعد</p>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-arabic">
                  {format(new Date(submission.created_at), 'd MMM yyyy', { locale: ar })}
                </CardTitle>
                <Badge className={submission.is_reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {submission.is_reviewed ? (
                    <>
                      <CheckCircle className="w-3 h-3 ml-1" />
                      تمت المراجعة
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 ml-1" />
                      قيد المراجعة
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {submission.student_notes && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {submission.student_notes}
                </p>
              )}
              {submission.is_reviewed && submission.sheikh_notes && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm font-semibold text-primary-900 mb-1 font-arabic">ملاحظات الشيخ:</p>
                  <p className="text-sm text-primary-800">{submission.sheikh_notes}</p>
                </div>
              )}
              {submission.audio_url && (
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Volume2 className="w-4 h-4 ml-2" />
                  استماع
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    {format(new Date(submission.created_at), 'd MMMM yyyy', { locale: ar })}
                  </h3>
                  <Badge className={submission.is_reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {submission.is_reviewed ? (
                      <>
                        <CheckCircle className="w-3 h-3 ml-1" />
                        تمت المراجعة
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 ml-1" />
                        قيد المراجعة
                      </>
                    )}
                  </Badge>
                  {submission.is_reviewed && !submission.student_seen_review && (
                    <Badge className="bg-orange-500 text-white animate-pulse">جديد</Badge>
                  )}
                </div>

                {submission.student_notes && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground font-arabic">ملاحظاتك:</p>
                    <p className="text-sm">{submission.student_notes}</p>
                  </div>
                )}

                {submission.is_reviewed && submission.sheikh_notes && (
                  <div className="p-4 bg-primary-50 rounded-lg border-r-4 border-primary-600">
                    <p className="text-sm font-semibold text-primary-900 mb-2 font-arabic">ملاحظات الشيخ:</p>
                    <p className="text-sm text-primary-800 whitespace-pre-wrap">{submission.sheikh_notes}</p>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col gap-2">
                {submission.audio_url && (
                  <Button variant="outline" size="sm">
                    <Volume2 className="w-4 h-4 md:ml-1" />
                    <span className="hidden md:inline">استماع</span>
                  </Button>
                )}
                {submission.is_reviewed && !submission.student_seen_review && onMarkAsSeen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsSeen(submission.id)}
                  >
                    <Eye className="w-4 h-4 md:ml-1" />
                    <span className="hidden md:inline">تمت القراءة</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
