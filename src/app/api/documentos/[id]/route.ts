import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { DocumentoRepository } from "@/repositories/documento.repository"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const documento = await DocumentoRepository.findById(id)
  if (!documento) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (documento.usuarioId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  await DocumentoRepository.delete(id)
  return NextResponse.json({ success: true })
}
