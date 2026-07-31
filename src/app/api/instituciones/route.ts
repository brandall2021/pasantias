import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"
import { UserRepository } from "@/repositories/user.repository"
import { EmpresaRepository } from "@/repositories/empresa.repository"
import { UniversidadRepository } from "@/repositories/universidad.repository"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  const tipo = url.searchParams.get("tipo")

  if (tipo === "empresas") {
    const empresas = await EmpresaRepository.findAllNombre()
    return NextResponse.json(empresas)
  }

  if (tipo === "universidades") {
    const universidades = await UniversidadRepository.findAllNombre()
    return NextResponse.json(universidades)
  }

  if (id) {
    const user = await UserRepository.findByIdConInstituciones(id)
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
    const d = new Date(fechaNacimiento)
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Fecha de nacimiento inválida" }, { status: 400 })
    }
    ;(updateData as { fechaNacimiento?: Date }).fechaNacimiento = d
  }

  await UserRepository.update(id, updateData)

  await logAudit(session.user.id, "MODIFICAR_PERFIL", "Actualizó su perfil")

  return NextResponse.json({ success: true })
}
