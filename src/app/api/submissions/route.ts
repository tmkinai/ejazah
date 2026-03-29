import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/submissions - create a submission (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, studentEmail, audioUrl, studentNotes } = body

    const submission = await prisma.submission.create({
      data: {
        requestId,
        studentEmail,
        audioUrl,
        studentNotes,
      },
    })

    return NextResponse.json({ data: submission }, { status: 201 })
  } catch (error) {
    console.error('Submission create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
