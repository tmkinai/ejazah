import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'

// GET /api/admin/stats - dashboard statistics
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { roles: true },
    })
    const roles = parseRoles(profile?.roles)
    if (!roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [
      totalProfiles,
      totalScholars,
      totalApplications,
      totalCertificates,
      pendingApplications,
      certificates,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.scholar.count({ where: { isActive: true } }),
      prisma.ijazahApplication.count(),
      prisma.ijazahCertificate.count(),
      prisma.ijazahApplication.count({ where: { status: 'submitted' } }),
      prisma.ijazahCertificate.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      data: {
        totalProfiles,
        totalScholars,
        totalApplications,
        totalCertificates,
        pendingApplications,
        certificates,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
