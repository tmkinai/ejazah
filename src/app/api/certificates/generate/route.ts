import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseRoles } from '@/lib/auth-utils'
import { randomBytes } from 'crypto'
import QRCode from 'qrcode'
import { sendCertificateIssuedEmail } from '@/lib/email-service'

function generateCertificateNumber(ijazahType: string): string {
  const prefix = ijazahType.toUpperCase().substring(0, 3)
  const year = new Date().getFullYear()
  const random = randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${year}-${random}`
}

export async function POST(request: NextRequest) {
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
    const isAdmin = roles.includes('admin')
    const isScholar = roles.includes('scholar')

    if (!isScholar && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const application = await prisma.ijazahApplication.findFirst({
      where: { id: application_id, status: 'approved' },
      include: {
        userProfile: {
          select: { id: true, fullName: true, fullNameArabic: true, email: true },
        },
        scholar: {
          include: {
            profile: {
              select: { fullName: true, fullNameArabic: true },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found or not approved' }, { status: 404 })
    }

    // Scholars may only generate certificates for their own assigned applications
    if (isScholar && !isAdmin && application.scholarId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existingCert = await prisma.ijazahCertificate.findFirst({
      where: { applicationId: application_id },
      select: { id: true, certificateNumber: true },
    })

    if (existingCert) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificate_number: existingCert.certificateNumber,
        certificate_id: existingCert.id,
      })
    }

    const certificateNumber = generateCertificateNumber(application.ijazahType)
    const verificationHash = `${certificateNumber}-${randomBytes(8).toString('hex')}`

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijazah.app'
    const verificationUrl = `${appUrl}/verify/${certificateNumber}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 1,
      color: { dark: '#1B4332', light: '#FFFFFF' },
    })

    const quranExp = application.quranExperience as Record<string, any> | null

    const certificate = await prisma.ijazahCertificate.create({
      data: {
        applicationId: application.id,
        userId: application.userId,
        scholarId: application.scholarId,
        certificateNumber,
        ijazahType: application.ijazahType,
        status: 'active',
        recitation: quranExp?.recitation || null,
        memorializationLevel: quranExp?.memorization_level || null,
        sanadChain: application.scholar?.sanadChain || {},
        issueDate: new Date().toISOString().split('T')[0],
        qrCodeData: qrCodeDataUrl,
        qrCodeUrl: qrCodeDataUrl,
        verificationHash,
        metadata: {
          issued_by: session.user.id,
          issued_at: new Date().toISOString(),
        },
      },
    })

    if (application.scholarId) {
      await prisma.scholar.update({
        where: { id: application.scholarId },
        data: { totalIjazatIssued: { increment: 1 } },
      })
    }

    // Send certificate issued email (non-blocking)
    if (application.userProfile?.email) {
      sendCertificateIssuedEmail({
        email: application.userProfile.email,
        name: application.userProfile.fullName || application.userProfile.fullNameArabic || 'الطالب',
        certificateNumber,
        scholarName: application.scholar?.profile?.fullName || application.scholar?.profile?.fullNameArabic || 'الشيخ',
        ijazahType: application.ijazahType,
        certificateUrl: `${appUrl}/certificates/${certificate.id}`,
        downloadUrl: `${appUrl}/certificates/${certificate.id}`,
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate.id,
        certificate_number: certificate.certificateNumber,
        qr_code_url: certificate.qrCodeUrl,
        verification_url: verificationUrl,
      },
    })
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
