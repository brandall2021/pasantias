import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class ConvenioRepository {
  static findByPostulacionId(postulacionId: string) {
    return prisma.convenio.findUnique({
      where: { postulacionId },
      include: { seguimientos: { orderBy: { fecha: "desc" } }, evaluaciones: true },
    })
  }

  static findById(id: string) {
    return prisma.convenio.findUnique({ where: { id } })
  }

  static create(postulacionId: string) {
    return prisma.convenio.create({ data: { postulacionId } })
  }

  static update(id: string, data: Prisma.ConvenioUncheckedUpdateInput) {
    return prisma.convenio.update({ where: { id }, data })
  }

  static findByIdConPostulacion(id: string) {
    return prisma.convenio.findUnique({
      where: { id },
      include: {
        postulacion: {
          select: {
            alumnoId: true,
            tutorAcademicoId: true,
            tutorEmpresaId: true,
            pasantia: { select: { titulo: true } },
          },
        },
      },
    })
  }

  static crearSeguimiento(data: Prisma.SeguimientoUncheckedCreateInput) {
    return prisma.seguimiento.create({ data })
  }

  static crearEvaluacion(data: Prisma.EvaluacionUncheckedCreateInput) {
    return prisma.evaluacion.create({ data })
  }
}
