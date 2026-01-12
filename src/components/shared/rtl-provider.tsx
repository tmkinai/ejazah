'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface RTLContextType {
  isRTL: boolean
  toggleRTL: () => void
  direction: 'rtl' | 'ltr'
  locale: 'ar' | 'en'
}

const RTLContext = createContext<RTLContextType | undefined>(undefined)

interface RTLProviderProps {
  children: ReactNode
  defaultRTL?: boolean
}

export function RTLProvider({ children, defaultRTL = true }: RTLProviderProps) {
  const [isRTL, setIsRTL] = useState(defaultRTL)

  const toggleRTL = useCallback(() => {
    setIsRTL((prev) => !prev)
  }, [])

  const direction = isRTL ? 'rtl' : 'ltr'
  const locale = isRTL ? 'ar' : 'en'

  return (
    <RTLContext.Provider value={{ isRTL, toggleRTL, direction, locale }}>
      {children}
    </RTLContext.Provider>
  )
}

export function useRTL() {
  const context = useContext(RTLContext)
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider')
  }
  return context
}
