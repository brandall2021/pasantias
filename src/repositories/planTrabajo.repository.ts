import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class PlanTrabajoRepository {
  static create(data: Prisma.PlanTrabajoUncheckedCreateInput) {
    return prisma.planTrabajo.create({ data })
  }

  static findByConvenioId(convenioId: string) {
    return prisma.planTrabajo.findMany({
      where: { convenioId },
      include: { usuario: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
  }

  static findUltimoPlan(convenioId: string) {
    return prisma.planTrabajo.findFirst({
      where: { convenioId },
      orderBy: { createdAt: "desc" },
    })
  }

  static findRegistroDuplicado(convenioId: string, usuarioId: string, fecha: Date) {
    const start = new Date(fecha)
    start.setHours(0, 0, 0, 0)
    const end = new Date(fecha)
    end.setHours(23, 59, 59, 999)
    return prisma.registroHoras.findFirst({
      where: {
        convenioId,
        usuarioId,
        fecha: { gte: start, lte: end },
      },
    })
  }

  static crearRegistroHoras(data: Prisma.RegistroHorasUncheckedCreateInput) {
    return prisma.registroHoras.create({ data })
  }

  static findRegistrosHoras(convenioId: string) {
    return prisma.registroHoras.findMany({
      where: { convenioId },
      include: { usuario: { select: { name: true } } },
      orderBy: { fecha: "desc" },
    })
  }

  static async totalHoras(convenioId: string) {
    const result = await prisma.registroHoras.aggregate({
      where: { convenioId },
      _sum: { horas: true },
    })
    return result._sum.horas || 0
  }
}
