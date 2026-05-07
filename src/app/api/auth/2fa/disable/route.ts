import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'رمز التحقق مطلوب' }, { status: 400 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true, totpSecret: true },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!profile.totpEnabled || !profile.totpSecret) {
    return NextResponse.json({ error: 'المصادقة الثنائية غير مفعّلة' }, { status: 400 })
  }

  const isValid = authenticator.verify({ token: code, secret: profile.totpSecret })
  if (!isValid) {
    return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 })
  }

  await prisma.profile.update({
    where: { id: session.user.id },
    data: { totpSecret: null, totpEnabled: false },
  })

  return NextResponse.json({ success: true })
}
