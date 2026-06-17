import { NextResponse } from "next/server"
import { PasantiaService } from "@/services/pasantia.service"
import { auth } from "@/lib/auth"

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
    const data = await req.json()
    const pasantia = await PasantiaService.crear({
      ...data,
      vacantes: parseInt(data.vacantes) || 1,
      empresaId: (session.user as any).empresaId,
      usuarioId: session.user.id,
    })
    return NextResponse.json(pasantia)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear pasantía" }, { status: 500 })
  }
}
