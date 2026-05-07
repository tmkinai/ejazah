import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true },
    })

    // Always return 200 to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Delete any existing token for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${user.email}` },
    })

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${user.email}`,
        token,
        expires,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

    await sendEmail({
      to: user.email,
      type: 'applicationStatusChanged',
      data: {
        recipientName: user.name || 'المستخدم',
        recipientEmail: user.email,
        applicationNumber: '',
        statusArabic: 'إعادة تعيين كلمة المرور',
        statusColor: '#1B4332',
        notes: `انقر على الرابط التالي لإعادة تعيين كلمة مرورك (صالح لمدة ساعة واحدة):\n${resetUrl}`,
        applicationUrl: resetUrl,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}
