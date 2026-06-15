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
    where: { chatId: id },
    include: {
      emisor: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  await prisma.mensaje.updateMany({
    where: { chatId: id, receptorId: session.user.id, leido: false },
    data: { leido: true },
  })

  return NextResponse.json(mensajes)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params
  const { contenido, receptorId } = await req.json()

  const mensaje = await prisma.mensaje.create({
    data: {
      chatId: id,
      emisorId: session.user.id,
      receptorId,
      contenido,
    },
    include: {
      emisor: { select: { id: true, name: true, image: true } },
    },
  })

  await prisma.chat.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(mensaje)
}
