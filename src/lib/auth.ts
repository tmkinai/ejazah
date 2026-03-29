import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/dashboard',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      if (token.id) {
        try {
          const profile = await prisma.profile.findUnique({
            where: { id: token.id as string },
            select: { roles: true },
          })
          token.roles = profile?.roles ?? ['student']
        } catch {
          token.roles = ['student']
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).roles = token.roles
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials' && user.id) {
        try {
          const existing = await prisma.profile.findUnique({
            where: { id: user.id },
          })
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
          console.error('Error creating profile during signIn:', e)
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id && user.email) {
        try {
          const existing = await prisma.profile.findUnique({
            where: { id: user.id },
          })
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
          console.error('Error creating profile during createUser:', e)
        }
      }
    },
  },
})
