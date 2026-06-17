import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  const { tipo, url } = await req.json()
  if (!tipo || !url) {
    return NextResponse.json({ error: "Faltan campos: tipo, url" }, { status: 400 })
  }

  const documento = await prisma.documento.create({
    data: { tipo, url, usuarioId: session.user.id },
  })
  return NextResponse.json(documento)
}
