import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AuditLogRepository } from "@/repositories/auditLog.repository"
import type { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")
  const accion = url.searchParams.get("accion")
  const tabla = url.searchParams.get("tabla")
  const limit = parseInt(url.searchParams.get("limit") || "100")
  const offset = parseInt(url.searchParams.get("offset") || "0")

  const where: Prisma.AuditLogWhereInput = {}
  if (userId) where.usuarioId = userId
  if (accion) where.accion = accion
  if (tabla) where.tabla = tabla

  const [logs, total] = await Promise.all([
    AuditLogRepository.findMany(where, limit, offset),
    AuditLogRepository.count(where),
  ])

  return NextResponse.json({ logs, total })
}
