import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")

  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { institucion: true, pasantias: { where: { activo: true } } },
    })
    if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json(user)
  }

  const instituciones = await prisma.user.findMany({
    where: { role: "INSTITUCION" },
    include: { institucion: true, _count: { select: { pasantias: true } } },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(instituciones)
}

export async function PATCH(req: Request) {
  const data = await req.json()
  const { id, ...updateData } = data

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  if (updateData.institucionNombre) {
    await prisma.institucion.update({
      where: { id: user.institucionId! },
      data: { nombre: updateData.institucionNombre },
    })
  }

  return NextResponse.json(user)
}
