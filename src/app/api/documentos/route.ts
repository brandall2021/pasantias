import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const documentos = await prisma.documento.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(documentos)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { nombre, tipo, url } = await req.json()

  if (!nombre || !tipo || !url) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  if (!["CV", "ALUMNO_REGULAR", "ANALITICO_PARCIAL", "SALUD", "OTRO"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  const documento = await prisma.documento.create({
    data: {
      nombre,
      tipo,
      url,
      usuarioId: session.user.id,
    },
  })

  return NextResponse.json(documento, { status: 201 })
}
