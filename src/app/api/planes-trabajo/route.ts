import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PlanTrabajoService } from "@/services/plan-trabajo.service"
import { crearNotificacion } from "@/lib/notificacion"
import { planTrabajoSchema } from "@/lib/validations"
import { ConvenioRepository } from "@/repositories/convenio.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = planTrabajoSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Faltan campos requeridos" },
      { status: 400 }
    )
  }

  const { convenioId, objetivos, horasSemana, fechaInicio, fechaFin } = parsed.data

  const plan = await PlanTrabajoService.crear({
    convenioId,
    objetivos,
    horasSemana,
    fechaInicio: new Date(fechaInicio),
    fechaFin: new Date(fechaFin),
    usuarioId: session.user.id,
  })

  const convenio = await ConvenioRepository.findByIdConPostulacion(convenioId)

  if (convenio) {
    const notifReceptores = [
      convenio.postulacion.alumnoId,
      convenio.postulacion.tutorAcademicoId,
      convenio.postulacion.tutorEmpresaId,
    ].filter(Boolean)

    for (const uid of notifReceptores) {
      if (uid !== session.user.id) {
        await crearNotificacion({
          usuarioId: uid!,
          titulo: "Plan de trabajo creado",
          mensaje: `Plan de trabajo para "${convenio.postulacion.pasantia.titulo}" creado`,
          link: "/tutor-academico",
        })
      }
    }
  }

  return NextResponse.json(plan)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const convenioId = url.searchParams.get("convenioId")
  if (!convenioId) return NextResponse.json({ error: "Falta convenioId" }, { status: 400 })

  const planes = await PlanTrabajoService.obtenerPorConvenio(convenioId)
  return NextResponse.json(planes)
}
