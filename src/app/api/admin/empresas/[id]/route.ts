import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  const empresa = await prisma.empresa.findUnique({ where: { id } })
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const updated = await prisma.empresa.update({
    where: { id },
    data: { estado: data.estado },
  })

  await logAudit(session.user.id, "VALIDAR_EMPRESA",
    `${data.estado === "VALIDADA" ? "Validó" : data.estado === "RECHAZADA" ? "Rechazó" : "Revisó"} empresa: ${empresa.nombre}`,
    "Empresa", id)

  return NextResponse.json(updated)
}
