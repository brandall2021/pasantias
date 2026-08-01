import { NextResponse } from "next/server"
import { PasantiaService } from "@/services/pasantia.service"
import { auth } from "@/lib/auth"

type CrearPasantiaData = {
  titulo: string
  descripcion: string
  requisitos?: string
  area: string
  modalidad: string
  duracion?: string
  becaEconomica?: string
  cargaHoraria?: string
  vacantes?: string | number
  unidadAcademicaId?: string
}

export async function GET() {
  const pasantias = await PasantiaService.listarPublicadas()
  return NextResponse.json(pasantias)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Solo empresas pueden crear pasantías" }, { status: 403 })
  }

  try {
    const data = (await req.json()) as CrearPasantiaData
    const empresaId = (session.user as { empresaId?: string }).empresaId
    if (!empresaId) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 400 })
    }
    const pasantia = await PasantiaService.crear({
      ...data,
      vacantes: parseInt(String(data.vacantes)) || 1,
      empresaId,
      usuarioId: session.user.id,
    })
    return NextResponse.json(pasantia)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error al crear pasantía"
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
