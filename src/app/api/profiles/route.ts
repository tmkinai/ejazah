import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profiles - get current user's profile or ?id=xxx for specific profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If specific ID requested, return public profile
    if (id) {
      const profile = await prisma.profile.findUnique({ where: { id } })
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      return NextResponse.json({ data: profile })
    }

    // Otherwise return current user's profile
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/profiles - update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Remove fields that shouldn't be updated directly
    const { id, roles, isVerified, verificationLevel, createdAt, ...updateData } = body

    const profile = await prisma.profile.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
