'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck, X, AlertCircle, Info, Award, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
  priority: string
  related_application_id?: string
  related_certificate_id?: string
}

interface NotificationCenterProps {
  onClose?: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      })

      if (error) throw error
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_read')
      if (error) throw error
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return <FileText className="h-5 w-5 text-primary-700" />
      case 'certificate_issued':
        return <Award className="h-5 w-5 text-gold-600" />
      case 'review_request':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'system':
        return <Info className="h-5 w-5 text-muted-foreground" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-600 bg-red-50/50'
      case 'high':
        return 'border-l-4 border-l-orange-600 bg-orange-50/50'
      case 'normal':
        return 'border-l-4 border-l-primary-600'
      case 'low':
        return 'border-l-4 border-l-gray-400'
      default:
        return 'border-l-4 border-l-primary-600'
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md p-6 text-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white/80 backdrop-blur-lg flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary-900" />
          <div>
            <h3 className="font-semibold text-primary-900">الإشعارات</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} غير مقروء
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              title="تحديد الكل كمقروء"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors hover:bg-muted/30 ${
                  !notification.is_read ? 'bg-primary-50/30' : ''
                } ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${
                        !notification.is_read ? 'text-primary-900' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">
                          جديد
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                      
                      <div className="flex gap-2">
                        {notification.action_url && notification.action_label && (
                          <Link href={notification.action_url}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => markAsRead(notification.id)}
                            >
                              {notification.action_label}
                            </Button>
                          </Link>
                        )}
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => markAsRead(notification.id)}
                            title="تحديد كمقروء"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border bg-white/80 backdrop-blur-lg text-center">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="text-xs">
              عرض جميع الإشعارات
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
