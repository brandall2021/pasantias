import type { DefaultSession } from "next-auth"
import type { Role, EstadoPasantia, PostulacionEstado } from "@prisma/client"

export type UserRole = Role

export type { Role, EstadoPasantia, PostulacionEstado }

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      empresaId?: string | null
      universidadId?: string | null
      carreraId?: string | null
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: UserRole
    empresaId?: string | null
    universidadId?: string | null
    carreraId?: string | null
  }
}
