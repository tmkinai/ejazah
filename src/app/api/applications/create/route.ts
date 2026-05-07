import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendApplicationSubmittedEmail } from '@/lib/email-service'

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

    const applicationNumber = `IJZ-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`

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

    // Send confirmation email (non-blocking)
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { fullName: true, email: true },
    })
    if (profile?.email) {
      sendApplicationSubmittedEmail({
        email: profile.email,
        name: profile.fullName || 'المتقدم',
        applicationNumber,
        ijazahType: ijazahType.ijazahType,
        submittedDate: new Date().toLocaleDateString('ar-SA'),
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/applications`,
      }).catch(console.error)
    }

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
