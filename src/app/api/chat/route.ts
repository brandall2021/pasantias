import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { mensajeSchema } from "@/lib/validations"
import { ConversacionRepository } from "@/repositories/conversacion.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const parsed = mensajeSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const { postulacionId, texto } = parsed.data

    let conversacion = await ConversacionRepository.findByPostulacionId(postulacionId)

    if (!conversacion) {
      conversacion = await ConversacionRepository.create(postulacionId)
    }

    const mensaje = await ConversacionRepository.crearMensaje({
      conversacionId: conversacion.id,
      autorId: session.user.id,
      texto,
    })

    await ConversacionRepository.touch(conversacion.id)

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

  const conversaciones = await ConversacionRepository.findAllParaUsuario(session.user.id)
  return NextResponse.json(conversaciones)
}
