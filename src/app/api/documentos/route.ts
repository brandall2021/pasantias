import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { DocumentoRepository } from "@/repositories/documento.repository"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const documentos = await DocumentoRepository.findByUsuarioId(session.user.id)
  return NextResponse.json(documentos)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { tipo, url } = await req.json()
  if (!tipo || !url) {
    return NextResponse.json({ error: "Faltan campos: tipo, url" }, { status: 400 })
  }

  const documento = await DocumentoRepository.create({ tipo, url, usuarioId: session.user.id })
  return NextResponse.json(documento)
}
