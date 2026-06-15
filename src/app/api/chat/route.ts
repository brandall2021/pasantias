import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { receptorId, contenido, pasantiaId } = await req.json()

    if (!receptorId || !contenido) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { creadorId: session.user.id, participanteId: receptorId },
          { creadorId: receptorId, participanteId: session.user.id },
        ],
      },
    })

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          creadorId: session.user.id,
          participanteId: receptorId,
          pasantiaId: pasantiaId || null,
        },
      })
    }

    const mensaje = await prisma.mensaje.create({
      data: {
        chatId: chat.id,
        emisorId: session.user.id,
        receptorId,
        contenido,
      },
      include: {
        emisor: { select: { id: true, name: true, image: true } },
      },
    })

    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ chat, mensaje })
  } catch {
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { creadorId: session.user.id },
        { participanteId: session.user.id },
      ],
    },
    include: {
      creador: { select: { id: true, name: true, image: true } },
      participante: { select: { id: true, name: true, image: true } },
      mensajes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(chats)
}
