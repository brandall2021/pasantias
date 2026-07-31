import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { logAudit } from "./audit"
import type { Role } from "@/types"

interface AuthUser {
  id: string
  email: string
  name: string
  image?: string | null
  role: Role
  empresaId?: string | null
  universidadId?: string | null
  carreraId?: string | null
}

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
        if (user.deletedAt) return null
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
        } as AuthUser
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
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as unknown as AuthUser
        token.id = authUser.id
        token.role = authUser.role
        token.empresaId = authUser.empresaId
        token.universidadId = authUser.universidadId
        token.carreraId = authUser.carreraId
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.empresaId = token.empresaId
        session.user.universidadId = token.universidadId
        session.user.carreraId = token.carreraId
      }
      return session
    },
  },
})
