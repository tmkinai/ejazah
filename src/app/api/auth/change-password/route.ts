import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  })
  if (!user?.hashedPassword) {
    return NextResponse.json({ error: 'لا يمكن تغيير كلمة المرور لحسابات OAuth' }, { status: 400 })
  }

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!isValid) {
    return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { hashedPassword } })

  return NextResponse.json({ success: true })
}
