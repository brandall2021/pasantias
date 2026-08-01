import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { CalendarDays, FileCheck, Play, Star, Timer } from "lucide-react"

type Evento = {
  fecha: Date
  titulo: string
  subtitulo: string
  tipo: "inicio" | "fin" | "evaluacion" | "hito"
  detalle?: string
}

const TIPO_LABEL: Record<string, string> = {
  INTERMEDIO_ALUMNO: "Evaluación intermedia (alumno)",
  INTERMEDIO_EMPRESA: "Evaluación intermedia (empresa)",
  FINAL_ALUMNO: "Evaluación final (alumno)",
  FINAL_EMPRESA: "Evaluación final (empresa)",
  EMPRESA_A_ALUMNO: "Evaluación de empresa",
  ALUMNO_A_EMPRESA: "Evaluación de alumno",
  TUTOR: "Evaluación de tutor",
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default async function CalendarioPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as { role: string; universidadId?: string; id: string }

  const where =
    user.role === "UNIVERSIDAD"
      ? { pasantia: { unidadAcademica: { universidadId: user.universidadId } } }
      : user.role === "TUTOR_ACADEMICO"
        ? { tutorAcademicoId: user.id }
        : user.role === "TUTOR_EMPRESA"
          ? { tutorEmpresaId: user.id }
          : user.role === "EMPRESA"
            ? { pasantia: { empresa: { usuarios: { some: { id: user.id } } } } }
            : user.role === "ESTUDIANTE"
              ? { alumnoId: user.id }
              : {}

  const postulaciones = await prisma.postulacion.findMany({
    where: { ...where, estado: "ACEPTADO", convenio: { isNot: null } },
    include: {
      alumno: { select: { name: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      convenio: {
        include: {
          planesTrabajo: true,
          evaluaciones: { select: { fecha: true, tipo: true, puntaje: true } },
        },
      },
    },
    orderBy: { fecha: "desc" },
  })

  const eventos: Evento[] = []

  for (const p of postulaciones) {
    const titulo = p.pasantia.titulo
    const alumno = p.alumno.name
    const convenio = p.convenio!

    for (const plan of convenio.planesTrabajo) {
      eventos.push({
        fecha: plan.fechaInicio,
        titulo: `Inicio de pasantía: ${titulo}`,
        subtitulo: `${alumno} — ${p.pasantia.empresa.nombre}`,
        tipo: "inicio",
        detalle: plan.objetivos,
      })
      eventos.push({
        fecha: plan.fechaFin,
        titulo: `Fin de pasantía: ${titulo}`,
        subtitulo: `${alumno} — ${p.pasantia.empresa.nombre}`,
        tipo: "fin",
        detalle: plan.objetivos,
      })
    }

    for (const ev of convenio.evaluaciones) {
      eventos.push({
        fecha: ev.fecha,
        titulo: `${TIPO_LABEL[ev.tipo] || ev.tipo}: ${titulo}`,
        subtitulo: `${alumno} — ${p.pasantia.empresa.nombre}`,
        tipo: "evaluacion",
        detalle: ev.puntaje ? `${ev.puntaje} pts` : undefined,
      })
    }

    eventos.push({
      fecha: convenio.createdAt,
      titulo: `Convenio firmado: ${titulo}`,
      subtitulo: `${alumno} — ${p.pasantia.empresa.nombre}`,
      tipo: "hito",
    })
  }

  eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

  const porMes = new Map<string, Evento[]>()
  for (const ev of eventos) {
    const key = `${ev.fecha.getFullYear()}-${ev.fecha.getMonth()}`
    if (!porMes.has(key)) porMes.set(key, [])
    porMes.get(key)!.push(ev)
  }

  const agrupado = [...porMes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, lista]) => {
      const [anio, mes] = key.split("-").map(Number)
      return { anio, mes, lista }
    })

  const icono = (tipo: Evento["tipo"]) => {
    if (tipo === "inicio") return <Play size={16} className="text-green-600 shrink-0 mt-0.5" />
    if (tipo === "fin") return <Timer size={16} className="text-red-500 shrink-0 mt-0.5" />
    if (tipo === "evaluacion") return <Star size={16} className="text-yellow-500 shrink-0 mt-0.5" />
    return <FileCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Calendario de pasantías</h1>
          <p className="text-sm text-gray-500">Fechas clave de pasantías activas: inicio, evaluaciones y cierre.</p>
        </div>
      </div>

      {agrupado.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-gray-500">
            No hay pasantías activas con convenio firmado para mostrar.
          </CardContent>
        </Card>
      ) : (
        agrupado.map(({ anio, mes, lista }) => (
          <div key={`${anio}-${mes}`} className="mb-8">
            <h2 className="text-lg font-bold mb-4">{MESES[mes]} {anio}</h2>
            <div className="space-y-3">
              {lista.map((ev, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {icono(ev.tipo)}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{ev.titulo}</span>
                          <Badge>{formatDate(ev.fecha)}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{ev.subtitulo}</p>
                        {ev.detalle && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ev.detalle}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
