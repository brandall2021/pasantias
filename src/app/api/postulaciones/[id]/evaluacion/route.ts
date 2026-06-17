import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ConvenioService } from "@/services/convenio.service"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { tipo, puntaje, comentario } = await req.json()

  if (!tipo || !puntaje) {
    return NextResponse.json({ error: "Faltan campos: tipo, puntaje" }, { status: 400 })
  }

  try {
    const evaluacion = await ConvenioService.evaluar(id, tipo, puntaje, comentario, session.user.id)
    return NextResponse.json(evaluacion)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
