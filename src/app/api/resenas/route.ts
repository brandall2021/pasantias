import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { pasantiaId, puntuacion, comentario, receptorId } = await req.json()

    if (!pasantiaId || !puntuacion || !receptorId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const existing = await prisma.resena.findFirst({
      where: { pasantiaId, emisorId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Ya reseñaste esta pasantía" }, { status: 400 })
    }

    const resena = await prisma.resena.create({
      data: {
        pasantiaId,
        puntuacion,
        comentario,
        emisorId: session.user.id,
        receptorId,
      },
    })

    return NextResponse.json(resena)
  } catch {
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const pasantiaId = url.searchParams.get("pasantiaId")

  const where: any = {}
  if (pasantiaId) where.pasantiaId = pasantiaId

  const resenas = await prisma.resena.findMany({
    where,
    include: { emisor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(resenas)
}
