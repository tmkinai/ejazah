// Toast hook for notifications
import { useState, useCallback } from 'react'

export interface Toast {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: Toast) {
  // For now, use console.log
  // In production, integrate with a toast library like Sonner or Radix Toast
  if (variant === 'destructive') {
    console.error(`❌ ${title}`, description)
  } else {
    console.log(`✅ ${title}`, description)
  }
  
  // You can also use window.alert for now
  // alert(`${title}\n${description}`)
}

export function useToast() {
  return { toast }
}
