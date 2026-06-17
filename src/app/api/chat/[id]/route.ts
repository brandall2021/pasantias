import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  const mensajes = await prisma.mensaje.findMany({
    where: { conversacionId: id },
    include: {
      autor: { select: { id: true, name: true, image: true } },
    },
    orderBy: { fecha: "asc" },
  })

  return NextResponse.json(mensajes)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params
  const { texto } = await req.json()

  const mensaje = await prisma.mensaje.create({
    data: {
      conversacionId: id,
      autorId: session.user.id,
      texto,
    },
    include: {
      autor: { select: { id: true, name: true, image: true } },
    },
  })

  await prisma.conversacion.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(mensaje)
}
