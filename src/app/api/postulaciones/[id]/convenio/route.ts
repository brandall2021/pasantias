import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ConvenioService } from "@/services/convenio.service"

type Parte = "alumno" | "empresa" | "universidad"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { parte } = await req.json() as { parte: Parte }

  if (!["alumno", "empresa", "universidad"].includes(parte)) {
    return NextResponse.json({ error: "parte inválido: alumno, empresa o universidad" }, { status: 400 })
  }

  try {
    const convenio = await ConvenioService.firmar(id, parte, session.user.id)
    return NextResponse.json(convenio)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error al firmar"
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}
