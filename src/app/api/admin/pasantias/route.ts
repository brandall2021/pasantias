import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const pasantias = await prisma.pasantia.findMany({
    where: { activo: true },
    include: {
      institucion: { select: { name: true } },
      _count: { select: { postulaciones: true } },
      resenas: { select: { puntuacion: true } },
    },
    orderBy: [
      { postulaciones: { _count: "desc" } },
    ],
  })

  return NextResponse.json(pasantias)
}
