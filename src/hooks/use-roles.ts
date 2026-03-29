'use client'

import { useSession } from 'next-auth/react'

export type UserRole = 'student' | 'scholar' | 'admin'

interface UseRolesReturn {
  roles: UserRole[]
  isLoading: boolean
  isStudent: boolean
  isScholar: boolean
  isAdmin: boolean
  hasRole: (role: UserRole) => boolean
  userId: string | null
}

export function useRoles(): UseRolesReturn {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  const roles: UserRole[] = (() => {
    const r = (session?.user as any)?.roles
    if (!r) return ['student']
    if (typeof r === 'string') {
      try { return JSON.parse(r) } catch { return ['student'] }
    }
    if (Array.isArray(r)) return r
    return ['student']
  })()

  const hasRole = (role: UserRole) => roles.includes(role)

  return {
    roles,
    isLoading,
    isStudent: hasRole('student'),
    isScholar: hasRole('scholar') || hasRole('admin'),
    isAdmin: hasRole('admin'),
    hasRole,
    userId: session?.user?.id ?? null,
  }
}
