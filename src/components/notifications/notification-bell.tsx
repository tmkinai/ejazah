'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell } from 'lucide-react'
import { NotificationCenter } from './notification-center'

export function NotificationBell() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    loadUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [session?.user])

  async function loadUnreadCount() {
    try {
      const res = await fetch('/api/notifications?count=true&unread=true')
      if (!res.ok) throw new Error('Failed to load unread count')
      const data = await res.json()

      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 border-0 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <NotificationCenter onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
