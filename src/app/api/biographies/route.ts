import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'

// GET /api/biographies?scholarId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scholarId = searchParams.get('scholarId')

    if (!scholarId) {
      // Get current user's biography
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const bio = await prisma.biography.findUnique({
        where: { scholarId: session.user.id },
      })
      return NextResponse.json({ data: bio })
    }

    const bio = await prisma.biography.findUnique({
      where: { scholarId },
    })
    return NextResponse.json({ data: bio })
  } catch (error) {
    console.error('Biography fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/biographies - create or update biography
export async function PUT(request: NextRequest) {
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

    const bio = await prisma.biography.upsert({
      where: { scholarId: session.user.id },
      update: body,
      create: {
        scholarId: session.user.id,
        ...body,
      },
    })

    return NextResponse.json({ data: bio })
  } catch (error) {
    console.error('Biography update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
