import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  if ("baneado" in data) {
    const target = await prisma.user.findUnique({ where: { id } })
    if (target) {
      await logAudit(session.user.id, "BANEAR",
        `${data.baneado ? "Baneó" : "Desbaneó"} a ${target.name} (${target.email})`)
    }
  }

  const user = await prisma.user.update({ where: { id }, data })
  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const target = await prisma.user.findUnique({ where: { id } })
  if (target) {
    await logAudit(session.user.id, "ELIMINAR_USUARIO",
      `Eliminó a ${target.name} (${target.email})`)
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
