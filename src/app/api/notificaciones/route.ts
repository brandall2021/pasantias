import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { marcarTodasLeidas, contarNoLeidas } from "@/lib/notificacion"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const [notificaciones, noLeidas] = await Promise.all([
    prisma.notificacion.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
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
    await prisma.notificacion.updateMany({
      where: { id: body.id, usuarioId: session.user.id },
      data: { leida: true },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 })
}
