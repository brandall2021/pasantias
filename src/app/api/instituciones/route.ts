import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  const todas = url.searchParams.get("todas")

  if (todas === "true") {
    const instituciones = await prisma.institucion.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(instituciones)
  }

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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await req.json()
  const { id, institucionNombre, fechaNacimiento, ...updateData } = data

  if (fechaNacimiento) {
    (updateData as any).fechaNacimiento = new Date(fechaNacimiento)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  if (institucionNombre) {
    await prisma.institucion.update({
      where: { id: user.institucionId! },
      data: { nombre: institucionNombre },
    })
  }

  await logAudit(session.user.id, "MODIFICAR_PERFIL", `Actualizó su perfil`)

  return NextResponse.json(user)
}
