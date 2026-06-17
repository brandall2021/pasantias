import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ConvenioService } from "@/services/convenio.service"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { descripcion } = await req.json()
  if (!descripcion) return NextResponse.json({ error: "Descripción requerida" }, { status: 400 })

  try {
    const seguimiento = await ConvenioService.agregarSeguimiento(id, descripcion, session.user.id)
    return NextResponse.json(seguimiento)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
