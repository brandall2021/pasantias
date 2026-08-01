import { prisma } from "@/lib/prisma"

export class AnalyticsService {
  static async resumenUniversidad(universidadId: string) {
    const universidad = await prisma.universidad.findUnique({
      where: { id: universidadId },
      include: { facultades: { select: { id: true, nombre: true } } },
    })
    if (!universidad) throw new Error("Universidad no encontrada")

    const facultadIds = universidad.facultades.map((f) => f.id)

    const [pasantias, postulaciones, planes, convenios, evaluaciones, horas] = await Promise.all([
      prisma.pasantia.findMany({
        where: { unidadAcademicaId: { in: facultadIds } },
        select: { estado: true, titulo: true, unidadAcademicaId: true },
      }),
      prisma.postulacion.findMany({
        where: { pasantia: { unidadAcademicaId: { in: facultadIds } } },
        select: { estado: true, fecha: true, pasantiaId: true },
      }),
      prisma.planTrabajo.findMany({
        where: { convenio: { postulacion: { pasantia: { unidadAcademicaId: { in: facultadIds } } } } },
        select: { id: true, horasSemana: true, fechaInicio: true, fechaFin: true, convenioId: true },
      }),
      prisma.convenio.findMany({
        where: { postulacion: { pasantia: { unidadAcademicaId: { in: facultadIds } } } },
        select: { estado: true, firmaAlumno: true, firmaEmpresa: true, firmaUniversidad: true },
      }),
      prisma.evaluacion.findMany({
        where: { convenio: { postulacion: { pasantia: { unidadAcademicaId: { in: facultadIds } } } } },
        select: { tipo: true, puntaje: true },
      }),
      prisma.registroHoras.findMany({
        where: { convenio: { postulacion: { pasantia: { unidadAcademicaId: { in: facultadIds } } } } },
        select: { horas: true, fecha: true },
      }),
    ])

    const porFacultad = universidad.facultades.map((fac) => {
      const ps = pasantias.filter((p) => p.unidadAcademicaId === fac.id)
      const activas = ps.filter((p) => p.estado === "ACTIVA").length
      const finalizadas = ps.filter((p) => p.estado === "FINALIZADA").length
      const publicadas = ps.filter((p) => p.estado === "PUBLICADA" || p.estado === "SELECCION" || p.estado === "ESPERA_CONVENIO").length
      return {
        facultad: fac.nombre,
        total: ps.length,
        activas,
        finalizadas,
        publicadas,
      }
    })

    const totalPasantias = pasantias.length
    const totalFinalizadas = pasantias.filter((p) => p.estado === "FINALIZADA").length
    const tasaFinalizacion = totalPasantias > 0 ? Math.round((totalFinalizadas / totalPasantias) * 100) : 0

    const totalHoras = horas.reduce((s, r) => s + r.horas, 0)
    const horasEsperadas = planes.reduce(
      (s, plan) => {
        const inicio = new Date(plan.fechaInicio)
        const fin = new Date(plan.fechaFin)
        const semanas = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / (7 * 24 * 60 * 60 * 1000)))
        return s + plan.horasSemana * semanas
      },
      0
    )
    const avanceHoras = horasEsperadas > 0 ? Math.min(100, Math.round((totalHoras / horasEsperadas) * 100)) : 0

    const evaluacionPromedio = evaluaciones.length > 0
      ? (evaluaciones.reduce((s, e) => s + e.puntaje, 0) / evaluaciones.length).toFixed(1)
      : "—"

    const porMes = new Map<string, number>()
    for (const r of horas) {
      const key = new Date(r.fecha).toLocaleDateString("es-AR", { month: "short" })
      porMes.set(key, (porMes.get(key) || 0) + r.horas)
    }

    const totalConvenios = convenios.length
    const conveniosCompletos = convenios.filter((c) => c.firmaAlumno && c.firmaEmpresa && c.firmaUniversidad).length

    return {
      porFacultad,
      resumen: {
        totalPasantias,
        totalFinalizadas,
        tasaFinalizacion,
        totalPostulaciones: postulaciones.length,
        totalHoras,
        avanceHoras,
        evaluacionPromedio,
        totalConvenios,
        conveniosCompletos,
      },
      horasPorMes: [...porMes.entries()],
    }
  }
}
