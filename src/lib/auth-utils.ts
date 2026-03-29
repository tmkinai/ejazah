import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type UserRole = 'student' | 'scholar' | 'admin'

export async function getServerSession() {
  return auth()
}

export async function getServerUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
}

export async function getServerUserWithRoles() {
  const session = await auth()
  if (!session?.user?.id) return null

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { roles: true },
  })

  const roles = parseRoles(profile?.roles)

  return {
    ...session.user,
    roles,
  }
}

export function parseRoles(roles: unknown): UserRole[] {
  if (!roles) return ['student']
  if (typeof roles === 'string') {
    try {
      return JSON.parse(roles)
    } catch {
      return ['student']
    }
  }
  if (Array.isArray(roles)) return roles as UserRole[]
  return ['student']
}

export function hasRole(roles: UserRole[], role: UserRole): boolean {
  return roles.includes(role)
}
