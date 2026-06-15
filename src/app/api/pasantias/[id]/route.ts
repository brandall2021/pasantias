import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pasantia = await prisma.pasantia.findUnique({
    where: { id },
    include: {
      institucion: { select: { name: true, image: true } },
      resenas: {
        include: { emisor: { select: { name: true } } },
      },
    },
  })
  if (!pasantia) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(pasantia)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const pasantia = await prisma.pasantia.update({ where: { id }, data })
  return NextResponse.json(pasantia)
}
