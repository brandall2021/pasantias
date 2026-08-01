import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PlanTrabajoService } from "@/services/plan-trabajo.service"
import { registroHorasSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = registroHorasSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Faltan campos requeridos" },
      { status: 400 }
    )
  }

  const { convenioId, horas, descripcion, fecha } = parsed.data

  try {
    const registro = await PlanTrabajoService.registrarHoras({
      convenioId,
      horas,
      descripcion,
      usuarioId: session.user.id,
      fecha: fecha ? new Date(fecha) : undefined,
    })

    return NextResponse.json(registro)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error al registrar horas"
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const convenioId = url.searchParams.get("convenioId")
  if (!convenioId) return NextResponse.json({ error: "Falta convenioId" }, { status: 400 })

  const [registros, total] = await Promise.all([
    PlanTrabajoService.horasPorConvenio(convenioId),
    PlanTrabajoService.totalHoras(convenioId),
  ])

  return NextResponse.json({ registros, total })
}
