import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const universidades = await prisma.universidad.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(universidades)
}

export async function POST(req: Request) {
  const { nombre } = await req.json()
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

  const universidad = await prisma.universidad.create({ data: { nombre } })
  return NextResponse.json(universidad)
}
