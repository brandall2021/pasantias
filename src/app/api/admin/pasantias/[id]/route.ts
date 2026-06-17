import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { PasantiaService } from "@/services/pasantia.service"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  if (data.estado) {
    try {
      const pasantia = await PasantiaService.cambiarEstado(id, data.estado, session.user.id)
      return NextResponse.json(pasantia)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  const pasantia = await prisma.pasantia.update({ where: { id }, data })
  await logAudit(session.user.id, "MODIFICAR_PASANTIA",
    data.activo !== undefined
      ? `${data.activo ? "Activó" : "Desactivó"} pasantía: ${pasantia.titulo}`
      : `Modificó pasantía: ${pasantia.titulo}`,
    "Pasantia", id)
  return NextResponse.json(pasantia)
}
