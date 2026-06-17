import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pasantia = await prisma.pasantia.findUnique({
    where: { id },
    include: {
      institucion: { select: { name: true, image: true } },
      resenas: {
        include: { emisor: { select: { name: true } } },
      },
    },
  })
  if (!pasantia) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(pasantia)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.pasantia.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  if (existing.institucionId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const data = await req.json()
  const pasantia = await prisma.pasantia.update({ where: { id }, data })

  await logAudit(session.user.id, "MODIFICAR_PASANTIA", `Editó pasantía: ${pasantia.titulo}`)

  return NextResponse.json(pasantia)
}
