import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import type { Adapter } from 'next-auth/adapters'

function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(data) {
      const user = await prisma.user.create({
        data: { name: data.name, email: data.email!, image: data.image, emailVerified: data.emailVerified },
      })
      return user as any
    },
    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } })
      return user as any
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } })
      return user as any
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        select: { user: true },
      })
      return (account?.user ?? null) as any
    },
    async updateUser(data) {
      const user = await prisma.user.update({ where: { id: data.id }, data })
      return user as any
    },
    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: userId } })
    },
    async linkAccount(data) {
      const account = await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          expires_in: (data as any).expires_in,
          token_type: data.token_type,
          scope: data.scope as string | undefined,
          id_token: data.id_token as string | undefined,
          session_state: data.session_state as string | undefined,
        },
      })
      return account as any
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.account.delete({ where: { provider_providerAccountId: { provider, providerAccountId } } })
    },
    async createSession(data) {
      const session = await prisma.session.create({ data })
      return session as any
    },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({ where: { sessionToken }, include: { user: true } })
      if (!session) return null
      return { session, user: session.user } as any
    },
    async updateSession(data) {
      const session = await prisma.session.update({ where: { sessionToken: data.sessionToken }, data })
      return session as any
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } })
    },
    async createVerificationToken(data) {
      const token = await prisma.verificationToken.create({ data })
      return token as any
    },
    async useVerificationToken({ identifier, token }) {
      const vt = await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } })
      return vt as any
    },
  }
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  adapter: CustomPrismaAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.hashedPassword)
        if (!isValid) return null

        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { totpEnabled: true },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          requiresTwoFactor: profile?.totpEnabled ?? false,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login', newUser: '/dashboard' },
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      // Initial sign-in — load profile data from DB once
      if (user) {
        token.id = user.id
        try {
          const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { roles: true },
          })
          token.roles = (profile?.roles as string[]) ?? ['student']
        } catch {
          token.roles = ['student']
        }
        token.requiresTwoFactor = (user as any).requiresTwoFactor ?? false
        token.totpAttempts = 0
      }

      // Handle TOTP verification — called by useSession().update({ totpCode })
      if (trigger === 'update' && (updateData as any)?.totpCode && token.requiresTwoFactor && token.id) {
        const attempts = (token.totpAttempts as number) ?? 0
        if (attempts >= 5) return token // rate limit

        try {
          const profile = await prisma.profile.findUnique({
            where: { id: token.id as string },
            select: { totpSecret: true, totpEnabled: true },
          })
          if (profile?.totpSecret && profile.totpEnabled) {
            const isValid = authenticator.verify({
              token: (updateData as any).totpCode,
              secret: profile.totpSecret,
            })
            if (isValid) {
              token.requiresTwoFactor = false
              token.totpAttempts = 0
            } else {
              token.totpAttempts = attempts + 1
            }
          }
        } catch {
          // leave token unchanged
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).roles = token.roles
        ;(session.user as any).requiresTwoFactor = token.requiresTwoFactor ?? false
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials' && user.id) {
        try {
          const existing = await prisma.profile.findUnique({ where: { id: user.id } })
          if (!existing) {
            await prisma.profile.create({
              data: {
                id: user.id,
                fullName: user.name,
                email: user.email || '',
                avatarUrl: user.image,
                roles: JSON.stringify(['student']),
              },
            })
          }
        } catch (e) {
          console.error('Profile create error on signIn:', e)
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id && user.email) {
        try {
          const existing = await prisma.profile.findUnique({ where: { id: user.id } })
          if (!existing) {
            await prisma.profile.create({
              data: {
                id: user.id,
                fullName: user.name,
                email: user.email,
                avatarUrl: user.image,
                roles: JSON.stringify(['student']),
              },
            })
          }
        } catch (e) {
          console.error('Profile create error on createUser event:', e)
        }
      }
    },
  },
})
