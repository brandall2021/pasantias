import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const documento = await prisma.documento.findUnique({ where: { id } })
  if (!documento) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (documento.usuarioId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  await prisma.documento.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
