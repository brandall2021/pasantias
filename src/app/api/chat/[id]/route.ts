import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { crearNotificacion } from "@/lib/notificacion"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  // Verificar que el usuario sea participante de la conversación
  const conversacion = await prisma.conversacion.findUnique({
    where: { id },
    include: {
      postulacion: {
        select: {
          alumnoId: true,
          pasantia: { select: { empresa: { select: { usuarios: { select: { id: true } } } } } },
        },
      },
    },
  })

  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  }

  const esAlumno = conversacion.postulacion.alumnoId === session.user.id
  const esEmpresa = conversacion.postulacion.pasantia.empresa.usuarios.some((u) => u.id === session.user.id)
  const esAdmin = session.user.role === "ADMIN"

  if (!esAlumno && !esEmpresa && !esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

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

  // Verificar permiso
  const conversacion = await prisma.conversacion.findUnique({
    where: { id },
    include: {
      postulacion: {
        select: {
          alumnoId: true,
          pasantia: { select: { empresa: { select: { usuarios: { select: { id: true } } } } } },
        },
      },
    },
  })

  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  }

  const esAlumno = conversacion.postulacion.alumnoId === session.user.id
  const esEmpresa = conversacion.postulacion.pasantia.empresa.usuarios.some((u) => u.id === session.user.id)
  const esAdmin = session.user.role === "ADMIN"

  if (!esAlumno && !esEmpresa && !esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

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

  // Notificar al otro participante
  const receptorId = esAlumno
    ? conversacion.postulacion.pasantia.empresa.usuarios[0]?.id
    : conversacion.postulacion.alumnoId
  if (receptorId && receptorId !== session.user.id) {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: conversacion.postulacionId },
      select: { pasantia: { select: { titulo: true } } },
    })
    await crearNotificacion({
      usuarioId: receptorId,
      titulo: "Nuevo mensaje en el chat",
      mensaje: `${session.user.name} te escribió sobre "${postulacion?.pasantia.titulo || ''}"`,
      link: "/chat",
    })
  }

  return NextResponse.json(mensaje)
}
