import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { contarNoLeidas, marcarTodasLeidas } from "@/lib/notificacion"
import { NotificacionRepository } from "@/repositories/notificacion.repository"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const [notificaciones, noLeidas] = await Promise.all([
    NotificacionRepository.findByUsuarioId(session.user.id),
    contarNoLeidas(session.user.id),
  ])

  return NextResponse.json({ notificaciones, noLeidas })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()

  if (body.marcarTodas) {
    await marcarTodasLeidas(session.user.id)
    return NextResponse.json({ success: true })
  }

  if (body.id) {
    await NotificacionRepository.marcarLeida(body.id, session.user.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 })
}
