import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const userId = url.searchParams.get("usuarioId")
  const accion = url.searchParams.get("accion")
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500)
  const offset = Number(url.searchParams.get("offset")) || 0

  const where: any = {}
  if (userId) where.usuarioId = userId
  if (accion) where.accion = accion

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { usuario: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ logs, total })
}
