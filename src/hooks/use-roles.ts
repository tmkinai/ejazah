'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const [roles, setRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()

        if (profile?.roles) {
          setRoles(profile.roles as UserRole[])
        } else {
          setRoles(['student'])
        }
      } catch (error) {
        console.error('Error loading roles:', error)
        setRoles(['student'])
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [supabase])

  const hasRole = (role: UserRole) => roles.includes(role)

  return {
    roles,
    isLoading,
    isStudent: hasRole('student'),
    isScholar: hasRole('scholar') || hasRole('admin'),
    isAdmin: hasRole('admin'),
    hasRole,
    userId,
  }
}
