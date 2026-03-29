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
  if (!roles.includes('admin') && !roles.includes('scholar')) return null

  return { userId: session.user.id, roles }
}

// GET /api/admin/requests - list all applications
export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const applications = await prisma.ijazahApplication.findMany({
      include: {
        userProfile: {
          select: { fullName: true, email: true, phoneNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: applications })
  } catch (error) {
    console.error('Admin requests fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/requests - update application status
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, adminNotes, scholarId } = await request.json()

    const application = await prisma.ijazahApplication.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(scholarId !== undefined ? { scholarId } : {}),
        ...(status === 'under_review' ? { reviewedAt: new Date() } : {}),
        ...(status === 'approved' || status === 'rejected' ? { decidedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error('Admin request update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
