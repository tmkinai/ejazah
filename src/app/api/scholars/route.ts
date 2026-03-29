import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'

// GET /api/scholars - list scholars (public) or get specific scholar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const scholar = await prisma.scholar.findUnique({
        where: { id },
        include: { profile: true },
      })
      if (!scholar) {
        return NextResponse.json({ error: 'Scholar not found' }, { status: 404 })
      }
      return NextResponse.json({ data: scholar })
    }

    const scholars = await prisma.scholar.findMany({
      where: { isActive: true },
      include: {
        profile: {
          select: { fullName: true, fullNameArabic: true, avatarUrl: true, country: true, city: true },
        },
      },
      orderBy: { certificatesIssued: 'desc' },
    })

    return NextResponse.json({ data: scholars })
  } catch (error) {
    console.error('Scholars fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/scholars - update scholar settings (scholar only)
export async function PATCH(request: NextRequest) {
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
    if (!roles.includes('scholar') && !roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { metadata, profileVisibility } = body

    const scholar = await prisma.scholar.update({
      where: { id: session.user.id },
      data: {
        ...(metadata !== undefined ? { metadata } : {}),
        ...(profileVisibility !== undefined ? { profileVisibility } : {}),
      },
    })

    return NextResponse.json({ data: scholar })
  } catch (error) {
    console.error('Scholar update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
