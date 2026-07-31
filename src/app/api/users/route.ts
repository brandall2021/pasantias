import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { UserRepository } from "@/repositories/user.repository"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "UNIVERSIDAD")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const roleParam = url.searchParams.get("role")

  const role = roleParam && Object.values(Role).includes(roleParam as Role) ? (roleParam as Role) : undefined

  const users = await UserRepository.findActivos(role)
  return NextResponse.json(users)
}
