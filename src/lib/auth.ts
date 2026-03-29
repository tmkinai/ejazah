import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV !== 'production',
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
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/dashboard',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Fetch roles from profile
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { roles: true },
        })
        ;(session.user as any).roles = profile?.roles ?? ['student']
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth users, ensure a profile exists
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
