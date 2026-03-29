import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/scholar-applications - get current user's application
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.scholarApplication.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error('Scholar application fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/scholar-applications - submit new scholar application
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { specialization, bio, credentials, sanadChain, documents } = body

    const application = await prisma.scholarApplication.create({
      data: {
        userId: session.user.id,
        specialization,
        bio,
        credentials: credentials || {},
        sanadChain: sanadChain || {},
        documents: documents || [],
        status: 'pending',
      },
    })

    return NextResponse.json({ data: application }, { status: 201 })
  } catch (error) {
    console.error('Scholar application create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
