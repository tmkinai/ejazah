import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks: Record<string, any> = {}

  // 1. Check env vars
  checks.env = {
    AUTH_SECRET: process.env.AUTH_SECRET ? `SET (${process.env.AUTH_SECRET.length} chars)` : 'MISSING',
    AUTH_URL: process.env.AUTH_URL || 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `SET (${process.env.GOOGLE_CLIENT_ID.length} chars, starts: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...)` : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? `SET (${process.env.GOOGLE_CLIENT_SECRET.length} chars)` : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT SET',
  }

  // 2. Check DB connection
  try {
    const userCount = await prisma.user.count()
    const accountCount = await prisma.account.count()
    const sessionCount = await prisma.session.count()
    checks.db = { status: 'OK', users: userCount, accounts: accountCount, sessions: sessionCount }
  } catch (e: any) {
    checks.db = { status: 'ERROR', message: e.message }
  }

  // 3. Check tables exist
  try {
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`
    await prisma.$queryRaw`SELECT 1 FROM accounts LIMIT 1`
    await prisma.$queryRaw`SELECT 1 FROM sessions LIMIT 1`
    await prisma.$queryRaw`SELECT 1 FROM verification_tokens LIMIT 1`
    checks.tables = 'All Auth.js tables exist'
  } catch (e: any) {
    checks.tables = { status: 'MISSING TABLE', message: e.message }
  }

  // 4. Try importing auth
  try {
    const { auth } = await import('@/lib/auth')
    checks.authModule = 'Loaded OK'
  } catch (e: any) {
    checks.authModule = { status: 'ERROR', message: e.message, stack: e.stack?.split('\n').slice(0, 5) }
  }

  return NextResponse.json(checks, { status: 200 })
}
