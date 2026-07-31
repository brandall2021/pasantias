import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"
import { UserRepository } from "@/repositories/user.repository"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  const target = await UserRepository.findById(id)
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  if ("baneado" in data) {
    await logAudit(
      session.user.id,
      "BANEAR",
      `${data.baneado ? "Baneó" : "Desbaneó"} a ${target.name} (${target.email})`,
      "User",
      id
    )
  }
  if ("role" in data && data.role !== target.role) {
    await logAudit(
      session.user.id,
      "CAMBIAR_ROL",
      `Cambió rol de ${target.name}: ${target.role} → ${data.role}`,
      "User",
      id
    )
  }

  const user = await UserRepository.update(id, data)
  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const target = await UserRepository.findById(id)
  if (target) {
    await logAudit(
      session.user.id,
      "ELIMINAR_USUARIO",
      `Eliminó a ${target.name} (${target.email})`,
      "User",
      id
    )
    await UserRepository.update(id, { deletedAt: new Date(), baneado: true })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
}
