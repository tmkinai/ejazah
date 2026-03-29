import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'

// GET /api/admin/settings - get app settings (public for some, admin for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const setting = await prisma.appSettings.findUnique({ where: { key } })
      return NextResponse.json({ data: setting })
    }

    const settings = await prisma.appSettings.findMany()
    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/settings - update settings (admin only)
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
    if (!roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { key, value } = await request.json()

    const setting = await prisma.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json({ data: setting })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
