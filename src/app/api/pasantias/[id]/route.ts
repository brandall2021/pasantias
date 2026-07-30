import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { PasantiaService } from "@/services/pasantia.service"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pasantia = await prisma.pasantia.findUnique({
    where: { id },
    include: {
      empresa: { select: { nombre: true, logo: true } },
      postulaciones: {
        include: {
          alumno: { select: { name: true, email: true } },
          convenio: true,
        },
      },
    },
  })
  if (!pasantia) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(pasantia)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.pasantia.findUnique({
    where: { id },
    include: { empresa: { select: { id: true } } },
  })
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const userEmpresaId = (session.user as any).empresaId
  if (existing.empresaId !== userEmpresaId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const data = await req.json()

  if (data.estado) {
    try {
      const pasantia = await PasantiaService.cambiarEstado(id, data.estado, session.user.id, {
        role: session.user.role,
      })
      return NextResponse.json(pasantia)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  const pasantia = await prisma.pasantia.update({ where: { id }, data })
  await logAudit(session.user.id, "EDITAR_PASANTIA", `Editó pasantía: ${pasantia.titulo}`, "Pasantia", id)
  return NextResponse.json(pasantia)
}
