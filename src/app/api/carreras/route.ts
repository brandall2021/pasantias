import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const facultadId = url.searchParams.get("facultadId")

  const where = facultadId ? { facultadId } : {}
  const carreras = await prisma.carrera.findMany({
    where,
    include: { facultad: { select: { nombre: true, universidad: { select: { nombre: true } } } } },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(carreras)
}
