import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      empresaId?: string
      universidadId?: string
      carreraId?: string
    } & DefaultSession["user"]
  }
}

export type UserRole = "ESTUDIANTE" | "EMPRESA" | "UNIVERSIDAD" | "ADMIN"
