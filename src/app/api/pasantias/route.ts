import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET() {
  const pasantias = await prisma.pasantia.findMany({
    where: { activo: true },
    include: {
      institucion: { select: { name: true, id: true } },
      _count: { select: { postulaciones: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(pasantias)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const data = await req.json()
    const pasantia = await prisma.pasantia.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        requisitos: data.requisitos,
        area: data.area,
        modalidad: data.modalidad,
        duracion: data.duracion,
        becaEconomica: data.becaEconomica,
        cargaHoraria: data.cargaHoraria,
        vacantes: parseInt(data.vacantes) || 1,
        institucionId: data.institucionId,
      },
    })

    await logAudit(session.user.id, "CREAR_PASANTIA", `Creó pasantía: ${pasantia.titulo}`)

    return NextResponse.json(pasantia)
  } catch (error) {
    return NextResponse.json({ error: "Error al crear pasantía" }, { status: 500 })
  }
}
