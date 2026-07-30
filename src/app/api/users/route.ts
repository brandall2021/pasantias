import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "UNIVERSIDAD")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const role = url.searchParams.get("role")

  const where: Prisma.UserWhereInput = { deletedAt: null, baneado: false }
  if (role && Object.values(Role).includes(role as Role)) {
    where.role = role as Role
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(users)
}
