import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ijazahType, personalInfo, academicBackground, quranExperience } = body

    if (!ijazahType?.ijazahType || !personalInfo || !academicBackground || !quranExperience) {
      return NextResponse.json(
        { error: 'بيانات ناقصة. يرجى ملء جميع الحقول المطلوبة.' },
        { status: 400 }
      )
    }

    const applicationNumber = `IJZ-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`

    const application = await prisma.ijazahApplication.create({
      data: {
        userId: session.user.id,
        applicationNumber,
        ijazahType: ijazahType.ijazahType,
        status: 'submitted',
        personalInfo,
        academicBackground,
        quranExperience,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
