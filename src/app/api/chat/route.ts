import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { postulacionId, texto } = await req.json()

    if (!postulacionId || !texto) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    let conversacion = await prisma.conversacion.findUnique({
      where: { postulacionId },
    })

    if (!conversacion) {
      conversacion = await prisma.conversacion.create({
        data: { postulacionId },
      })
    }

    const mensaje = await prisma.mensaje.create({
      data: {
        conversacionId: conversacion.id,
        autorId: session.user.id,
        texto,
      },
      include: {
        autor: { select: { id: true, name: true, image: true } },
      },
    })

    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ conversacion, mensaje })
  } catch {
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const conversaciones = await prisma.conversacion.findMany({
    where: {
      postulacion: {
        OR: [
          { alumnoId: session.user.id },
          { pasantia: { empresa: { usuarios: { some: { id: session.user.id } } } } },
        ],
      },
    },
    include: {
      postulacion: {
        select: {
          id: true,
          alumnoId: true,
          pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
        },
      },
      mensajes: {
        orderBy: { fecha: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(conversaciones)
}
