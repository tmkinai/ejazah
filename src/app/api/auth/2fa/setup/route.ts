import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// GET: generate secret + QR code for setup
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true, email: true },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.totpEnabled) return NextResponse.json({ error: 'المصادقة الثنائية مفعّلة بالفعل' }, { status: 400 })

  const secret = authenticator.generateSecret()
  const keyUri = authenticator.keyuri(profile.email, 'نظام الإجازة', secret)
  const qrCode = await QRCode.toDataURL(keyUri)

  // Store pending secret in metadata — only committed when user verifies
  await prisma.profile.update({
    where: { id: session.user.id },
    data: { metadata: { totpPendingSecret: secret } },
  })

  return NextResponse.json({ secret, qrCode })
}

// POST: verify code and enable 2FA
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'رمز التحقق مطلوب' }, { status: 400 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true, metadata: true },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.totpEnabled) return NextResponse.json({ error: 'المصادقة الثنائية مفعّلة بالفعل' }, { status: 400 })

  const pendingSecret = (profile.metadata as any)?.totpPendingSecret
  if (!pendingSecret) {
    return NextResponse.json({ error: 'ابدأ الإعداد أولاً' }, { status: 400 })
  }

  const isValid = authenticator.verify({ token: code, secret: pendingSecret })
  if (!isValid) {
    return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 })
  }

  // Activate 2FA and clear the pending secret from metadata
  await prisma.profile.update({
    where: { id: session.user.id },
    data: {
      totpSecret: pendingSecret,
      totpEnabled: true,
      metadata: {},
    },
  })

  return NextResponse.json({ success: true })
}
