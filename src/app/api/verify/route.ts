import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/verify?number=xxx - verify a certificate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certNumber = searchParams.get('number')

    if (!certNumber) {
      return NextResponse.json({ error: 'Certificate number is required' }, { status: 400 })
    }

    const certificate = await prisma.ijazahCertificate.findUnique({
      where: { certificateNumber: certNumber.trim().toUpperCase() },
      select: {
        id: true,
        certificateNumber: true,
        ijazahType: true,
        status: true,
        issueDate: true,
        verificationCount: true,
        lastVerifiedAt: true,
      },
    })

    // Log verification attempt
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const ua = request.headers.get('user-agent') || 'unknown'

    if (certificate) {
      // Success - increment count and log
      await prisma.$transaction([
        prisma.ijazahCertificate.update({
          where: { id: certificate.id },
          data: {
            verificationCount: { increment: 1 },
            lastVerifiedAt: new Date(),
          },
        }),
        prisma.verificationLog.create({
          data: {
            certificateId: certificate.id,
            verifierIp: ip,
            verifierUserAgent: ua,
            verificationMethod: 'manual',
            success: true,
          },
        }),
      ])

      return NextResponse.json({ data: certificate, verified: true })
    }

    // Failure - log attempt
    await prisma.verificationLog.create({
      data: {
        verifierIp: ip,
        verifierUserAgent: ua,
        verificationMethod: 'manual',
        success: false,
        failureReason: 'Certificate not found',
      },
    })

    return NextResponse.json({ verified: false, error: 'Certificate not found' }, { status: 404 })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
