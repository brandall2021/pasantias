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
