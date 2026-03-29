import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { roles: true },
  })
  const roles = parseRoles(profile?.roles)
  if (!roles.includes('admin')) return null
  return session.user.id
}

// GET /api/admin/students - list all profiles
export async function GET() {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: profiles })
  } catch (error) {
    console.error('Admin students fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/students?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Delete profile (cascades to user via relation)
    await prisma.profile.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin student delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
