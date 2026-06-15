import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      institucionId?: string
    } & DefaultSession["user"]
  }
}

export type UserRole = "ESTUDIANTE" | "INSTITUCION" | "ADMIN"
