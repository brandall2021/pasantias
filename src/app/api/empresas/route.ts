import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { EmpresaRepository } from "@/repositories/empresa.repository"

export async function GET() {
  const empresas = await EmpresaRepository.findAllResumen()
  return NextResponse.json(empresas)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await req.json()
  const { id, ...updateData } = data

  const userEmpresaId = (session.user as { empresaId?: string }).empresaId
  if (id !== userEmpresaId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const empresa = await EmpresaRepository.update(id, updateData)
  return NextResponse.json(empresa)
}
