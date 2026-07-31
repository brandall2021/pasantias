import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { crearNotificacion } from "@/lib/notificacion"
import { ConversacionRepository } from "@/repositories/conversacion.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  // Verificar que el usuario sea participante de la conversación
  const conversacion = await ConversacionRepository.findByIdConParticipantes(id)

  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  }

  const esAlumno = conversacion.postulacion.alumnoId === session.user.id
  const esEmpresa = conversacion.postulacion.pasantia.empresa.usuarios.some((u) => u.id === session.user.id)
  const esAdmin = session.user.role === "ADMIN"

  if (!esAlumno && !esEmpresa && !esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const mensajes = await ConversacionRepository.mensajes(id)

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
  const conversacion = await ConversacionRepository.findByIdConParticipantes(id)

  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  }

  const esAlumno = conversacion.postulacion.alumnoId === session.user.id
  const esEmpresa = conversacion.postulacion.pasantia.empresa.usuarios.some((u) => u.id === session.user.id)
  const esAdmin = session.user.role === "ADMIN"

  if (!esAlumno && !esEmpresa && !esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const mensaje = await ConversacionRepository.crearMensaje({
    conversacionId: id,
    autorId: session.user.id,
    texto,
  })

  await ConversacionRepository.touch(id)

  // Notificar al otro participante
  const receptorId = esAlumno
    ? conversacion.postulacion.pasantia.empresa.usuarios[0]?.id
    : conversacion.postulacion.alumnoId
  if (receptorId && receptorId !== session.user.id) {
    const postulacion = await PostulacionRepository.findByIdConPasantiaTitulo(conversacion.postulacionId)
    await crearNotificacion({
      usuarioId: receptorId,
      titulo: "Nuevo mensaje en el chat",
      mensaje: `${session.user.name} te escribió sobre "${postulacion?.pasantia.titulo || ''}"`,
      link: "/chat",
    })
  }

  return NextResponse.json(mensaje)
}
