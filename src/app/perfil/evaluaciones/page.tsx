import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { EvaluacionForm } from "./evaluacion-form"
import type { EvaluacionTipo } from "@prisma/client"

const TIPO_LABELS: Record<string, string> = {
  ALUMNO_A_EMPRESA: "Alumno → Empresa",
  EMPRESA_A_ALUMNO: "Empresa → Alumno",
  TUTOR: "Tutor",
  INTERMEDIO_ALUMNO: "Intermedia - Alumno",
  INTERMEDIO_EMPRESA: "Intermedia - Empresa",
  FINAL_ALUMNO: "Final - Alumno",
  FINAL_EMPRESA: "Final - Empresa",
}

const TIPOS_POR_ROL: Record<string, EvaluacionTipo[]> = {
  ESTUDIANTE: ["ALUMNO_A_EMPRESA", "INTERMEDIO_ALUMNO", "FINAL_ALUMNO"],
  EMPRESA: ["EMPRESA_A_ALUMNO", "INTERMEDIO_EMPRESA", "FINAL_EMPRESA"],
  TUTOR_ACADEMICO: ["TUTOR"],
  TUTOR_EMPRESA: ["TUTOR"],
}

export default async function EvaluacionesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id
  const role = session.user.role

  const postulacionesParaEvaluar = await (async () => {
    const includeComun = {
      convenio: { include: { evaluaciones: true } },
      orderBy: { fecha: "desc" as const },
    }

    if (role === "ESTUDIANTE") {
      return prisma.postulacion.findMany({
        where: { alumnoId: userId, pasantia: { estado: "FINALIZADA" } },
        include: {
          pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
          ...includeComun,
        },
      })
    }
    if (role === "EMPRESA") {
      const empresaId = (session.user as { empresaId?: string }).empresaId
      if (!empresaId) return []
      return prisma.postulacion.findMany({
        where: { pasantia: { empresaId, estado: "FINALIZADA" } },
        include: {
          alumno: { select: { name: true } },
          pasantia: { select: { titulo: true } },
          ...includeComun,
        },
      })
    }
    if (role === "TUTOR_ACADEMICO" || role === "TUTOR_EMPRESA") {
      const tutorWhere = role === "TUTOR_ACADEMICO"
        ? { tutorAcademicoId: userId }
        : { tutorEmpresaId: userId }

      return prisma.postulacion.findMany({
        where: { ...tutorWhere, pasantia: { estado: "FINALIZADA" } },
        include: {
          alumno: { select: { name: true } },
          pasantia: { select: { titulo: true } },
          ...includeComun,
        },
      })
    }
    return []
  })()

  const evaluacionesRealizadas = await prisma.evaluacion.findMany({
    where: { autorId: userId },
    include: {
      convenio: {
        include: {
          postulacion: {
            include: {
              pasantia: { select: { titulo: true } },
              alumno: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { fecha: "desc" },
  })

  const tiposDelRol = TIPOS_POR_ROL[role] || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Evaluaciones</h1>

      {postulacionesParaEvaluar.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pasantías finalizadas por evaluar</h2>
          <div className="space-y-3">
            {postulacionesParaEvaluar.map((p) => {
              const existingTipos = new Set(
                (p.convenio?.evaluaciones || [])
                  .filter((e) => e.autorId === userId)
                  .map((e) => e.tipo)
              )
              const availableTipos = tiposDelRol.filter((t) => !existingTipos.has(t))
              const nombreAlumno = "alumno" in p && p.alumno ? p.alumno.name : null
              const nombreEmpresa = "empresa" in p.pasantia && p.pasantia.empresa
                ? p.pasantia.empresa.nombre
                : null

              return (
                <Card key={p.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{p.pasantia.titulo}</p>
                        <p className="text-sm text-gray-500">
                          {nombreAlumno || nombreEmpresa}
                        </p>
                      </div>
                      <Badge variant={availableTipos.length === 0 ? "secondary" : "default"}>
                        {availableTipos.length === 0
                          ? "Completas"
                          : `${availableTipos.length} pendiente${availableTipos.length > 1 ? "s" : ""}`}
                      </Badge>
                    </div>
                    {availableTipos.length > 0 && (
                      <EvaluacionForm
                        postulacionId={p.id}
                        availableTipos={availableTipos}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Mis evaluaciones realizadas</h2>
      {evaluacionesRealizadas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <p>No realizaste evaluaciones todavía.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluacionesRealizadas.map((e) => (
            <Card key={e.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{e.convenio.postulacion.pasantia.titulo}</p>
                    <p className="text-xs text-gray-500">{TIPO_LABELS[e.tipo] || e.tipo}</p>
                    {e.comentario && <p className="text-sm text-gray-600 mt-1">{e.comentario}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">{e.puntaje}/5</p>
                    <p className="text-xs text-gray-400">{formatDate(e.fecha)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
