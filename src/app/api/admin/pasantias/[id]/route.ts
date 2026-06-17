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

  // Validate convenio tripartito before changing to EN_CURSO
  if (data.estado === "EN_CURSO") {
    const postulacionesAceptadas = await prisma.postulacion.findMany({
      where: { pasantiaId: id, estado: "ACEPTADO" },
    })

    if (postulacionesAceptadas.length === 0) {
      return NextResponse.json(
        { error: "No hay postulaciones aceptadas para esta pasantía" },
        { status: 400 }
      )
    }

    const sinConvenio = postulacionesAceptadas.filter((p) => !p.convenioCompletado)
    if (sinConvenio.length > 0) {
      return NextResponse.json(
        { error: `Hay ${sinConvenio.length} postulación(es) aceptada(s) sin convenio tripartito completado` },
        { status: 400 }
      )
    }
  }

  const pasantia = await prisma.pasantia.update({ where: { id }, data })

  const acciones = []
  if ("activo" in data) {
    acciones.push(`${data.activo ? "Activó" : "Desactivó"} pasantía`)
  }
  if ("estado" in data) {
    acciones.push(`Cambió estado a ${data.estado}`)
  }

  await logAudit(session.user.id, "MODIFICAR_PASANTIA",
    `${acciones.join(" y ")}: ${pasantia.titulo}`)

  return NextResponse.json(pasantia)
}
