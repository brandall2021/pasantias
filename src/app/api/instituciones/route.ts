import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  const tipo = url.searchParams.get("tipo")

  if (tipo === "empresas") {
    const empresas = await prisma.empresa.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(empresas)
  }

  if (tipo === "universidades") {
    const universidades = await prisma.universidad.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(universidades)
  }

  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { empresa: true, universidad: true, carrera: true },
    })
    if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json(user)
  }

  return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await req.json()
  const { id, fechaNacimiento, ...updateData } = data

  if (fechaNacimiento) {
    (updateData as any).fechaNacimiento = new Date(fechaNacimiento)
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  })

  await logAudit(session.user.id, "MODIFICAR_PERFIL", "Actualizó su perfil")

  return NextResponse.json({ success: true })
}
