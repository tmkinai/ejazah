'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
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

interface RequestListItemProps {
  request: any
  isSelected: boolean
  onClick: () => void
}

export default function RequestListItem({ request, isSelected, onClick }: RequestListItemProps) {
  const StatusIcon = statusConfig[request.status]?.icon || Clock
  const statusColor = statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'
  const statusLabel = statusConfig[request.status]?.label || request.status

  return (
    <div
      className={`p-4 border-b cursor-pointer transition-colors ${
        isSelected ? 'bg-primary-50 border-r-4 border-r-primary-600' : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-foreground">
            {request.profiles?.full_name || request.personal_info?.full_name || 'غير محدد'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {request.profiles?.email || request.personal_info?.email || 'غير محدد'}
          </p>
        </div>
        <Badge className={`${statusColor} flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {statusLabel}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {request.ijazah_type === 'hifz' ? '📖 حفظ' : request.ijazah_type === 'tilawa' ? '📚 تلاوة' : 'غير محدد'}
        </span>
        <span>{format(new Date(request.created_at), 'd MMM', { locale: ar })}</span>
      </div>
    </div>
  )
}
