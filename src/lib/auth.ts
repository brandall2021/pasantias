import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { logAudit } from "./audit"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { empresa: true, universidad: true, carrera: { include: { facultad: { include: { universidad: true } } } } },
        })

        if (!user) return null
        if (user.baneado) return null
        if (!user.password) return null

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          empresaId: user.empresaId,
          universidadId: user.universidadId,
          carreraId: user.carreraId,
        }
      },
    }),
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user.id) {
        const provider = account?.provider || "credentials"
        await logAudit(user.id, "LOGIN", `Inicio de sesión via ${provider}`, "User", user.id)
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.empresaId = (user as any).empresaId
        token.universidadId = (user as any).universidadId
        token.carreraId = (user as any).carreraId
      }
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        ;(session.user as any).empresaId = token.empresaId as string
        ;(session.user as any).universidadId = token.universidadId as string
        ;(session.user as any).carreraId = token.carreraId as string
      }
      return session
    },
  },
})
