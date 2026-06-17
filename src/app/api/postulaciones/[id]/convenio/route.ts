import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ConvenioService } from "@/services/convenio.service"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { parte } = await req.json()

  if (!["alumno", "empresa", "universidad"].includes(parte)) {
    return NextResponse.json({ error: "parte inválido: alumno, empresa o universidad" }, { status: 400 })
  }

  try {
    const convenio = await ConvenioService.firmar(id, parte as any, session.user.id)
    return NextResponse.json(convenio)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
