import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const universidadId = url.searchParams.get("universidadId")

  const where = universidadId ? { universidadId } : {}
  const facultades = await prisma.facultad.findMany({
    where,
    include: { universidad: { select: { nombre: true } } },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(facultades)
}
