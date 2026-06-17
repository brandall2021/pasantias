import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const empresas = await prisma.empresa.findMany({
    select: { id: true, nombre: true, cuit: true, estado: true },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(empresas)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await req.json()
  const { id, ...updateData } = data

  const userEmpresaId = (session.user as any).empresaId
  if (id !== userEmpresaId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const empresa = await prisma.empresa.update({ where: { id }, data: updateData })
  return NextResponse.json(empresa)
}
