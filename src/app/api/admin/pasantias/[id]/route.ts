import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { PasantiaService } from "@/services/pasantia.service"
import { PasantiaRepository } from "@/repositories/pasantia.repository"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  if (data.estado) {
    try {
      const pasantia = await PasantiaService.cambiarEstado(id, data.estado, session.user.id, {
        role: "ADMIN",
      })
      return NextResponse.json(pasantia)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al cambiar estado"
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  const pasantia = await PasantiaRepository.update(id, data)
  await logAudit(
    session.user.id,
    "MODIFICAR_PASANTIA",
    data.activo !== undefined
      ? `${data.activo ? "Activó" : "Desactivó"} pasantía: ${pasantia.titulo}`
      : `Modificó pasantía: ${pasantia.titulo}`,
    "Pasantia",
    id
  )
  return NextResponse.json(pasantia)
}
