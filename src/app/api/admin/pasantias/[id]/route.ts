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
  const pasantia = await prisma.pasantia.update({ where: { id }, data })

  if ("activo" in data) {
    await logAudit(session.user.id, "MODIFICAR_PASANTIA",
      `${data.activo ? "Activó" : "Desactivó"} pasantía: ${pasantia.titulo}`)
  }

  return NextResponse.json(pasantia)
}
