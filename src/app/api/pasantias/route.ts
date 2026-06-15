import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
    return NextResponse.json(pasantia)
  } catch (error) {
    return NextResponse.json({ error: "Error al crear pasantía" }, { status: 500 })
  }
}
