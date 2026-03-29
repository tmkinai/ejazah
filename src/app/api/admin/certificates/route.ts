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
  return session.user.id
}

// GET /api/admin/certificates - list all certificates
export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const scholarId = searchParams.get('scholarId')

    const certificates = await prisma.ijazahCertificate.findMany({
      where: scholarId ? { scholarId } : {},
      include: {
        userProfile: {
          select: { fullName: true, email: true, phoneNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: certificates })
  } catch (error) {
    console.error('Certificates fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/certificates - update certificate
export async function PATCH(request: NextRequest) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, isPublic } = await request.json()

    const certificate = await prisma.ijazahCertificate.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
    })

    return NextResponse.json({ data: certificate })
  } catch (error) {
    console.error('Certificate update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/certificates?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 })
    }

    await prisma.ijazahCertificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Certificate delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
